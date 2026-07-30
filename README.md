# No Agenda Time Machine

A Python-based DVR for the No Agenda stream with time-shifted web playback.

![Version](https://img.shields.io/badge/version-v1.5.3-blue)
![Status](https://img.shields.io/badge/status-production--ready-green)
![Tests](https://img.shields.io/badge/tests-66%20passing-success)

## Overview

**No Agenda Time Machine** is a 24/7 DVR for the [No Agenda stream](https://noagendastream.com/). Like a DVR for radio, it continuously records the live stream and lets you rewind and listen to any point in the last 72 hours through a clean web interface.

**Key Concept**: Time-shifted playback - jump back to hear what you missed, skip past commercials, or replay your favorite segments.

## Features

All 15 planned features complete as of v1.5.3:

| # | Feature | Description |
|---|---------|-------------|
| 1 | Remove green bar | Clean timeline without buffer indicator |
| 2 | 12-hour clock format | Time with AM/PM + date (e.g., "9:30:15 AM" on "Sat Jul 11") |
| 3 | Fixed title height | Reserved 3-row space prevents button shifting |
| 4 | Prevent page zoom | Mobile-friendly, no zoom on double-tap |
| 5 | Remove status text | Cleaner UI without "Playing"/"Paused" |
| 6 | Live button | One-click jump to near-live playback |
| 7 | Updated branding | "No Agenda Time Machine" heading |
| 8 | White button text | High-contrast controls (white on gold) |
| 9 | Equal button sizes | All 64×64px for consistent touch targets |
| 10 | Larger slider | 28px thumb for mobile touch interaction |
| 11 | Light theme | Matches NoAgenda.stream color palette |
| 12 | Bug validation | Complete regression test suite |
| 13 | Slider drag preview | Title shows segment at dragged position |
| 14a | Slider improvements | Segment-based slider with finer control |
| 14 | Hamburger menu | Dropdown panel showing all segments |

**Core Capabilities**:
- **Continuous 24/7 recording** of No Agenda ICY stream
- **Automatic segmentation** based on metadata (StreamTitle) changes
- **72-hour retention** of audio segments
- **Dual-buffer audio** for smooth segment transitions
- **Live edge handling** with fixed 30-second offset

## Quick Start

### Requirements

- Python 3.8+
- screen (for detached session management)
- Web server (nginx, apache, or Python's http.server)

### Quick Deploy (from release package)

```bash
# Create deployment directory
sudo mkdir -p /var/www/html/noAgendaTimeMachine/audio/segments

# Copy files from latest release
cp -r release/v1.5.3/* /var/www/html/noAgendaTimeMachine/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/noAgendaTimeMachine
chmod +x /var/www/html/noAgendaTimeMachine/audio/*.sh

# Start the recorder
cd /var/www/html/noAgendaTimeMachine/audio
./start.sh
```

### Access the Web Player

Navigate to: `http://your-server/noAgendaTimeMachine/`

**Player Controls:**
- ▶️ Play/Pause
- ⏮️ Previous track
- ⏭️ Next track
- Seek slider - drag to any position
- Jump buttons: -1h, -10m, -30s, +30s, +10m, +1h
- Live button - jump near live
- ☰ Hamburger menu - segment list

## Architecture

```
Python Recorder (recorderd.py - 385 lines)
    writes
/var/www/html/noAgendaTimeMachine/
    ├── playlist.json          # Segment list (minimal state)
    └── audio/segments/
        ├── track_*.mp3        # Audio files
        └── track_*.json       # Metadata sidecars

Browser (index.html - ~680 lines)
    fetches
playlist.json → segments/*.json → segments/*.mp3 → Audio playback
```

**Data Flow**:
1. Python connects to ICY stream with `Icy-MetaData: 1` header
2. Reads audio chunks, parses metadata for title changes
3. On metadata change: closes current segment, opens new one
4. Writes MP3 + JSON sidecar (start/end/title/final flags)
5. Updates playlist.json every 5 seconds
6. Frontend fetches playlist and sidecar JSON files
7. Dual-buffer players (playerA/playerB) alternate for smooth transitions

## Configuration

Edit `/var/www/html/noAgendaTimeMachine/audio/recorderd.py`:

```python
STREAM_URL = "https://listen.noagendastream.com/noagenda?type=.mp3"
WEB_DIR = "/var/www/html/noAgendaTimeMachine"
MAX_AGE = 72 * 3600           # 72 hours retention
MAX_CHUNK_DUR = 4 * 3600      # 4 hours max per segment
METADATA_IGNORE_MIN = 5        # Ignore title flips < 5s
```

**Frontend constants** (in `index.html`):
- `LIVE_EDGE_OFFSET`: 30 seconds (fixed offset from live edge)
- `PLAYLIST_URL`: `'playlist.json'`
- `POLL_INTERVAL`: 5000ms (5 seconds)

## Managing the Recorder

```bash
# Attach to view logs
screen -r noagendarecorder

# Detach (leave running)
# Press: Ctrl+A, then D

# Stop the recorder
screen -S noagendarecorder -X quit
```

## Project Structure

```
noAgendaTimeMachine/
├── README.md                          # This file
├── TODO.md                            # Feature tracking (15/15 complete)
├── .claude/CLAUDE.md                  # Development guidance
├── release/                           # Release packages (frozen artifacts)
│   ├── v1.0.0/ through v1.5.3/       # Versioned releases
│   └── README.md
├── validation/                        # Development & canonical source
│   ├── production/                    # CANONICAL SOURCE (edit here)
│   │   ├── index.html                 # THE frontend (~680 lines)
│   │   ├── audio/
│   │   │   ├── recorderd.py           # THE recorder (385 lines)
│   │   │   └── start.sh               # THE launcher (81 lines)
│   │   └── docs/                      # Design documentation
│   ├── TESTING.md                     # Testing report
│   └── CLAUDE.md                      # Development guide
└── test_validation/                   # Playwright browser tests
    ├── index.html → ../validation/production/index.html (symlink)
    ├── tests/                         # 67 regression tests
    └── audio/playlist.json            # Test data
```

**Canonical source**: `validation/production/`

## Testing

**66 Playwright regression tests, all passing**:

- feature2.spec.js (5 tests) - 12-hour clock format
- feature6.spec.js (7 tests) - Live button
- feature8.spec.js (6 tests) - White button text/icons
- feature9.spec.js (6 tests) - Equal button sizes
- feature10.spec.js (6 tests) - Larger slider button
- bug3.spec.js (8 tests) - Next Track validation
- feature13.spec.js (7 tests) - Slider drag updates title
- feature14a.spec.js (10 tests) - Slider improvements
- feature14.spec.js (10 tests) - Hamburger segment list

```bash
cd test_validation
python3 -m http.server 8081
npx playwright test --reporter=list
```

## Status

| Component | Status |
|-----------|--------|
| Bug Fixes | ✅ Complete (6/6) |
| Features | ✅ Complete (15/15) |
| Production Ready | ✅ Yes |

**Latest Version**: v1.5.3 (2026-07-30)

**Version History**:
- v1.0.0 (2026-07-11): Initial production release
- v1.1.0 (2026-07-11): Light theme (Feature 11)
- v1.2.0 (2026-07-11): UI improvements (7 features)
- v1.3.0 (2026-07-11): Complete feature set (12 features)
- v1.4.0 (2026-07-12): Feature 13 + simplification (45 tests)
- v1.4.3 (2026-07-28): Slider improvements (57 tests)
- v1.5.0 (2026-07-29): Hamburger segment list (67 tests)
- v1.5.1 (2026-07-29): Playback stall fix
- v1.5.2 (2026-07-29): Infinite reload loop fix
- v1.5.3 (2026-07-30): Time display stalled & playback skip fixes

**Fixed Bugs**:
1. ✅ Live Edge Stalling - Audio stops while UI shows playing
2. ✅ Previous Track Freezing - Audio freezes after clicking previous track
3. ✅ Next Track Button - Does not advance to next segment
4. ✅ Infinite Reload Loop - 130MB/s data transfer after hamburger navigation
5. ✅ Time Display Stalled - Time freezes while audio continues playing
6. ✅ Playback Skip During Live Reload - Audio skips back ~30s at live edge

## Development

**Canonical source location**: `/home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production/`

```bash
# Edit files in validation/production/
# Test via test_validation/ (symlink to canonical)
# Deploy from validation/production/ to server
```

## License

This project is provided as-is for personal use with the No Agenda stream.

## Credits

- Inspired by the [No Agenda Stream](https://noagenda.stream/)
- Built with [Claude Code](https://claude.ai/code)

---

**Repository**: https://github.com/JeffTheIntegrator/NoAgendaTimeMachine
