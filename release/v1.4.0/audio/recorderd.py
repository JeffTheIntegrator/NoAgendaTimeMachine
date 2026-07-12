#!/usr/bin/env python3
"""
No Agenda Time Machine - Production Recorder

Captures the No Agenda ICY stream, splits it into MP3 segments based on
metadata changes, and generates playlist.json for the static web player.

Run as: python3 noAgendaTimeMachine.py
Or in screen: screen -S natm python3 noAgendaTimeMachine.py
"""

import os
import re
import json
import time
import tempfile
import logging

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
# Production deployment paths (adjust as needed for your environment)
# For production: script runs from /var/www/html/noAgendaTimeMachine/audio/
# For development: adjust to your local directory
if os.path.exists("/var/www/html"):
    # Production environment
    WEB_DIR = "/var/www/html/noAgendaTimeMachine"
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    if BASE_DIR.endswith("/audio"):
        # Script is in audio/ subdirectory
        SEGMENTS_DIR = os.path.join(BASE_DIR, "segments")
        PLAYLIST_FILE = os.path.join(os.path.dirname(BASE_DIR), "playlist.json")
    else:
        # Script is in web root (fallback)
        SEGMENTS_DIR = os.path.join(WEB_DIR, "audio", "segments")
        PLAYLIST_FILE = os.path.join(WEB_DIR, "playlist.json")
else:
    # Development/testing environment
    WEB_DIR = os.path.dirname(os.path.abspath(__file__))
    SEGMENTS_DIR = os.path.join(WEB_DIR, "segments")
    PLAYLIST_FILE = os.path.join(WEB_DIR, "playlist.json")

STREAM_URL = "https://listen.noagendastream.com/noagenda?type=.mp3"

# Retention
MAX_AGE = 72 * 3600  # 72 hours in seconds

# Stream behavior
METADATA_IGNORE_MIN = 5   # Ignore metadata changes shorter than this (seconds)
MAX_CHUNK_DUR = 4 * 3600  # 4 hours fallback cut
RECONNECT_GRACE = 30      # Keep segment open if gap < this (seconds)
RECONNECT_DELAY_FAST = 3  # Retry delay for initial failures
RECONNECT_DELAY_SLOW = 15 # Retry delay for persistent failures

# Playlist updates
PLAYLIST_UPDATE_INTERVAL = 5  # seconds

# Ensure directories exist
os.makedirs(SEGMENTS_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("natm")
logging.getLogger("urllib3").setLevel(logging.WARNING)

# ---------------------------------------------------------------------------
# Metadata parsing
# ---------------------------------------------------------------------------
_TITLE_RE = re.compile(r"StreamTitle='([^']*)'")

def parse_stream_title(meta_bytes):
    """Extract and clean StreamTitle from ICY metadata."""
    try:
        meta_str = meta_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return None
    m = _TITLE_RE.search(meta_str)
    if not m:
        return None
    title = m.group(1).strip()
    title = re.sub(r"\s+", " ", title)
    if not title:
        return None
    return title

# ---------------------------------------------------------------------------
# Segment metadata sidecars
# ---------------------------------------------------------------------------
def write_segment_meta(filepath, start_time, end_time, title, final=False):
    """Write JSON sidecar with segment metadata."""
    meta = {
        "start": start_time,
        "end": end_time,
        "title": title,
        "final": bool(final),
    }
    atomic_write_json(filepath + ".json", meta)
    log.debug("segmeta %s start=%.3f end=%.3f title=%r final=%s",
              os.path.basename(filepath), start_time, end_time, title, final)

# ---------------------------------------------------------------------------
# Atomic file writers
# ---------------------------------------------------------------------------
def atomic_write_text(path, text):
    """Write text to path atomically (POSIX rename)."""
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(text)
        os.chmod(tmp, 0o644)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise

def atomic_write_json(path, obj):
    """Write JSON to path atomically."""
    atomic_write_text(path, json.dumps(obj))

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
def cleanup_old_segments():
    """Remove segments older than MAX_AGE."""
    now = time.time()
    removed = 0
    try:
        for filename in os.listdir(SEGMENTS_DIR):
            if not (filename.endswith(".mp3") or filename.endswith(".json")):
                continue
            filepath = os.path.join(SEGMENTS_DIR, filename)
            if not os.path.isfile(filepath):
                continue
            try:
                age = now - os.path.getmtime(filepath)
            except OSError:
                continue
            if age > MAX_AGE:
                try:
                    os.remove(filepath)
                    removed += 1
                    log.info("cleanup removed=%s age=%.0fh", filename, age/3600)
                except OSError as e:
                    log.warning("cleanup failed=%s err=%s", filename, e)
    except FileNotFoundError:
        # Segments directory may not exist yet in validation environment
        pass
    if removed:
        log.info("cleanup total_removed=%d", removed)

# ---------------------------------------------------------------------------
# Playlist generation
# ---------------------------------------------------------------------------
def build_segment_list():
    """Scan segments directory and build segment list."""
    files = []
    try:
        for filename in os.listdir(SEGMENTS_DIR):
            if not filename.endswith(".mp3"):
                continue
            filepath = os.path.join(SEGMENTS_DIR, filename)
            meta_filepath = filepath + ".json"
            if not os.path.exists(meta_filepath):
                log.debug("manifest skip no-meta=%s", filename)
                continue
            try:
                with open(meta_filepath, "r") as mf:
                    data = json.load(mf)
                if "start" not in data or "end" not in data:
                    continue
                files.append({
                    "url": f"audio/segments/{filename}",
                    "start": float(data["start"]),
                    "end": float(data["end"]),
                    "title": data.get("title", "Unknown Program"),
                    "final": bool(data.get("final", False)),
                })
            except (OSError, ValueError, json.JSONDecodeError) as e:
                log.warning("manifest parse-fail=%s err=%s", filename, e)
    except FileNotFoundError:
        # Segments directory may not exist yet in validation environment
        pass
    files.sort(key=lambda x: x["start"])
    return files

def write_playlist():
    """Generate playlist.json with current segment list."""
    segs = build_segment_list()
    payload = {
        "generated_at": time.time(),
        "segments": segs,
    }
    atomic_write_json(PLAYLIST_FILE, payload)
    return segs

# ---------------------------------------------------------------------------
# Stream recording
# ---------------------------------------------------------------------------
def read_exact(raw, size):
    """Read exactly `size` bytes; return b'' on EOF."""
    buf = bytearray()
    while len(buf) < size:
        chunk = raw.read(size - len(buf))
        if not chunk:
            return b''
        buf.extend(chunk)
    return bytes(buf)

def record_stream():
    """Main recording loop - connect to stream, capture audio, generate playlist."""
    log.info("natm starting dir=%s stream=%s max_age_h=%.1f",
             WEB_DIR, STREAM_URL, MAX_AGE/3600)

    headers = {"Icy-MetaData": "1"}
    consecutive_failures = 0

    current_title = "No Agenda Stream"
    current_start = None
    current_filepath = None
    current_file = None

    while True:
        try:
            log.info("connecting attempt=%d", consecutive_failures)
            with requests.get(STREAM_URL, headers=headers, stream=True, timeout=(10, 30)) as r:
                r.raise_for_status()
                metaint = int(r.headers.get("icy-metaint", 0) or 0)
                log.info("connected metaint=%d", metaint)
                consecutive_failures = 0

                # Open initial segment if needed
                if current_file is None:
                    current_start = time.time()
                    filename = f"track_{int(current_start)}.mp3"
                    current_filepath = os.path.join(SEGMENTS_DIR, filename)
                    current_file = open(current_filepath, "wb")
                    os.chmod(current_filepath, 0o644)
                    log.info("seg open=%s title=%r", filename, current_title)
                    write_segment_meta(current_filepath, current_start, current_start, current_title, final=False)

                bytes_written = 0
                last_playlist = 0

                while True:
                    if metaint > 0:
                        # Read audio chunk, then metadata
                        audio = read_exact(r.raw, metaint)
                        if not audio:
                            log.info("raw-eof after audio")
                            break
                        current_file.write(audio)
                        bytes_written += len(audio)

                        # Read metadata length byte
                        lb = r.raw.read(1)
                        if not lb:
                            log.info("raw-eof after length-byte")
                            break
                        meta_len = ord(lb) * 16

                        if meta_len > 0:
                            meta_bytes = read_exact(r.raw, meta_len)
                            title = parse_stream_title(meta_bytes)
                            now = time.time()

                            if title and title != current_title:
                                seg_dur = now - current_start
                                log.info("meta-change new=%r old=%r seg_dur=%.1f bytes=%d",
                                         title, current_title, seg_dur, bytes_written)

                                if seg_dur < METADATA_IGNORE_MIN:
                                    log.info("meta-change ignored too-short=%.1f", seg_dur)
                                    current_title = title
                                else:
                                    # Close current segment, open new one
                                    current_file.flush()
                                    os.fsync(current_file.fileno())
                                    current_file.close()
                                    write_segment_meta(current_filepath, current_start, now, current_title, final=True)

                                    current_title = title
                                    current_start = now
                                    filename = f"track_{int(current_start)}.mp3"
                                    current_filepath = os.path.join(SEGMENTS_DIR, filename)
                                    current_file = open(current_filepath, "wb")
                                    os.chmod(current_filepath, 0o644)
                                    bytes_written = 0
                                    write_segment_meta(current_filepath, current_start, current_start, current_title, final=False)
                                    log.info("seg open=%s title=%r", filename, current_title)
                    else:
                        # No metadata support, read in fixed chunks
                        audio = r.raw.read(8192)
                        if not audio:
                            log.info("raw-eof no-metaint")
                            break
                        current_file.write(audio)
                        bytes_written += len(audio)

                    # Fallback: Force cut if segment too long
                    if time.time() - current_start > MAX_CHUNK_DUR:
                        log.info("fallback-cut dur=%.1f", time.time() - current_start)
                        current_file.flush()
                        os.fsync(current_file.fileno())
                        current_file.close()
                        write_segment_meta(current_filepath, current_start, time.time(), current_title, final=True)

                        current_start = time.time()
                        filename = f"track_{int(current_start)}.mp3"
                        current_filepath = os.path.join(SEGMENTS_DIR, filename)
                        current_file = open(current_filepath, "wb")
                        os.chmod(current_filepath, 0o644)
                        bytes_written = 0
                        write_segment_meta(current_filepath, current_start, current_start, current_title, final=False)

                    # Periodic playlist update
                    now = time.time()
                    if now - last_playlist >= PLAYLIST_UPDATE_INTERVAL:
                        try:
                            current_file.flush()
                        except Exception:
                            pass
                        # Update current segment's end time
                        write_segment_meta(current_filepath, current_start, now, current_title, final=False)
                        cleanup_old_segments()
                        write_playlist()
                        last_playlist = now
                        log.debug("heartbeat bytes=%d title=%r start=%.0f",
                                  bytes_written, current_title, current_start)

                log.info("inner-loop-exit bytes_total=%d", bytes_written)

        except requests.exceptions.RequestException as e:
            log.warning("network-error type=%s msg=%s", type(e).__name__, e)
            consecutive_failures += 1
            delay = RECONNECT_DELAY_FAST if consecutive_failures <= 2 else RECONNECT_DELAY_SLOW
            log.info("reconnect delay=%ds consecutive=%d", delay, consecutive_failures)
            time.sleep(delay)

            # Decide whether to keep segment open or close it
            if current_file is not None:
                gap = RECONNECT_DELAY_FAST if consecutive_failures <= 2 else RECONNECT_DELAY_SLOW
                if gap >= RECONNECT_GRACE:
                    # Gap too long, close segment
                    try:
                        current_file.close()
                    except Exception:
                        pass
                    if current_filepath:
                        write_segment_meta(current_filepath, current_start, time.time(), current_title, final=True)
                    log.info("seg closed gap-too-long path=%s",
                             os.path.basename(current_filepath) if current_filepath else None)
                    current_file = None
                    current_filepath = None
                else:
                    log.info("seg kept-open for reconnect path=%s",
                             os.path.basename(current_filepath) if current_filepath else None)

        except KeyboardInterrupt:
            log.info("keyboard-interrupt shutting-down")
            if current_file is not None:
                try:
                    current_file.close()
                except Exception:
                    pass
                if current_filepath:
                    write_segment_meta(current_filepath, current_start, time.time(), current_title, final=True)
            break

        except Exception as e:
            log.exception("unexpected-error type=%s msg=%s", type(e).__name__, e)
            time.sleep(5)

if __name__ == "__main__":
    record_stream()
