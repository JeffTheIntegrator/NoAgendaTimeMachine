# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NoAgendaTimeMachine is a Python-based DVR for the No Agenda stream. It continuously records an ICY audio stream, splits it into MP3 segments based on metadata changes (StreamTitle), and provides a static HTML player for time-shifted playback.

**Architecture:**
- **Python recorder** (`recorderd.py`): Captures stream, writes MP3 segments with JSON metadata sidecars, updates `playlist.json`
- **HTML player** (`index.html`): Static file with embedded JavaScript, dual-buffer audio player (playerA/playerB), fetches playlist.json and sidecar metadata
- **Screen launcher** (`start.sh`): Manages recorder in detached screen session
- **Live edge handling**: Dynamic reloading at the stream's leading edge with fixed 30s offset

**Project Status:** ✅ Feature 13 complete, Simplification S1/S2 complete - v1.4.0 released (2026-07-12)

## Project Structure

```
noAgendaTimeMachine/
├── .agent/
│   └── CLAUDE.md
├── release/                       # Release packages (frozen)
│   ├── v1.1.0/                   # Light theme
│   ├── v1.2.0/                   # UI improvements
│   ├── v1.3.0/                   # 12 features complete
│   ├── v1.4.0/                   # Current - Feature 13 + simplification
│   │   ├── index.html
│   │   ├── RELEASE_v1.4.0.md
│   │   └── audio/
│   │       ├── recorderd.py
│   │       ├── start.sh
│   │       └── segments/
├── validation/                    # You are here - canonical source in production/
│   ├── docs/
│   │   └── 2025-07-04-no-agenda-time-machine-production-design.md
│   ├── production/                # CANONICAL SOURCE
│   │   ├── index.html             # THE frontend file - edit here
│   │   └── audio/
│   │       ├── recorderd.py       # THE recorder - edit here
│   │       ├── start.sh           # THE launcher - edit here
│   │       └── segments/
│   ├── TESTING.md                 # Testing & validation report
│   └── (removed: validation/index.html, noAgendaTimeMachine.py, start.sh - consolidated to production/)
├── test_validation/               # Playwright browser tests
│   ├── index.html -> ../validation/production/index.html (symlink)
│   ├── audio/playlist.json       # test data
│   └── tests/
│       ├── feature2.spec.js (5 tests)
│       ├── feature6.spec.js (7 tests)
│       ├── feature8.spec.js (6 tests)
│       ├── feature9.spec.js (6 tests)
│       ├── feature10.spec.js (6 tests)
│       ├── bug3.spec.js (8 tests)
│       └── feature13.spec.js (7 tests)
└── .git/
```

**Canonical source (v1.4.0+):** `validation/production/`
- `validation/production/index.html` - THE frontend file
- `validation/production/audio/recorderd.py` - THE recorder
- `validation/production/audio/start.sh` - THE launcher
- `test_validation/index.html` - symlink → canonical

Removed in v1.4.0: `validation/index.html`, `validation/noAgendaTimeMachine.py`, `validation/start.sh` (identical copies).

## Production Architecture

The production implementation follows a simplified, maintainable architecture:

- **Python writes only `playlist.json`** - Frontend fetches sidecar JSON for metadata
- **Static HTML** - Deployed once, not dynamically generated
- **Screen session management** - Manual restart with script assistance
- **Fixed 30s live edge offset** - No adaptive complexity

### File Structure (Production)

```
/var/www/html/noAgendaTimeMachine/
├── index.html              # Static web player
├── playlist.json           # Python writes segment list
└── audio/
    ├── recorderd.py        # Python recorder script
    ├── start.sh            # Screen launcher
    └── segments/          # Runtime: MP3 + JSON sidecars
        ├── track_*.mp3
        └── track_*.json
```

## Common Commands

### Running the Recorder (Local Testing)

```bash
# From validation/production directory (canonical)
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production/audio
python3 recorderd.py

# Or via screen launcher
./start.sh
```

### Running the Recorder (Production)

```bash
cd /var/www/html/noAgendaTimeMachine/audio
./start.sh
```

### Screen Session Management

```bash
# Attach to view logs
screen -r noagendarecorder

# Detach (leave running)
# Press: Ctrl+A, then D

# List all sessions
screen -list

# Stop the recorder
screen -S noagendarecorder -X quit
```

### Configuration

Edit `recorderd.py`:

```python
STREAM_URL = "https://listen.noagendastream.com/noagenda?type=.mp3"
WEB_DIR = "/var/www/html/noAgendaTimeMachine"
MAX_AGE = 72 * 3600           # 72 hours retention
MAX_CHUNK_DUR = 4 * 3600      # 4 hours max per segment
METADATA_IGNORE_MIN = 5        # Ignore title flips < 5s
```

**Frontend constants** (in `index.html`):
- `LIVE_EDGE_OFFSET`: 30 seconds (fixed)
- `PLAYLIST_URL`: `'playlist.json'`
- `POLL_INTERVAL`: 5000ms (5 seconds)

## Architecture Details

### Stream Recording Flow
1. Connect to ICY stream with `Icy-MetaData: 1` header
2. Read audio in `icy-metaint`-sized chunks
3. Parse metadata from ICY headers for title changes
4. On metadata change: close current segment, open new one
5. Write sidecar JSON with `start`, `end`, `title`, `final` flags
6. Update `playlist.json` (minimal state: filenames only)
7. Frontend fetches sidecar JSON for full metadata

### Playback System
- **Dual-buffer players**: playerA and playerB alternate for smooth segment transitions
- **Playlist polling**: Every 5 seconds, fetches updated playlist.json
- **Sidecar enrichment**: Frontend fetches track_*.json files for title, start, end, final
- **Live edge reload**: When playback catches up, reloads live segment with 30s offset
- **Start overlay**: Captures first interaction for browser autoplay compliance
- **Slider drag preview (Feature 13)**: As slider dragged, title updates via `segIndexForTime()`

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `recorderd.py` | Python recorder (canonical) | 385 |
| `index.html` | Static HTML player (canonical, validation/production/) | ~680 |
| `start.sh` | Screen launcher (canonical) | 81 |
| `TESTING.md` | Testing & validation report | 145 |
| `DEPLOYMENT.md` | Deployment guide | 204 |
| `playlist.json` | Segment list (generated at runtime) | - |
| `track_*.json` | Per-segment metadata sidecars | - |

### Data Flow

```
Python (recorderd.py)
    ↓ writes
/var/www/html/noAgendaTimeMachine/
    ├── playlist.json          (filenames only)
    └── audio/segments/
        ├── track_123.mp3      (audio)
        └── track_123.json     (metadata)

Browser (index.html)
    ↓ fetches
playlist.json → gets segment URLs
    ↓ fetches
audio/segments/*.json → gets metadata
    ↓ fetches
audio/segments/*.mp3 → plays audio
```

## Known Issues & Bug Status

### All Bugs Fixed & Validated ✅

| Bug ID | Description | Status | Fixed | Validated |
|--------|-------------|--------|-------|-----------|
| **Bug 1** | Live Edge Stalling - Audio stops while UI shows playing, buffer depletion errors | ✅ FIXED | ✅ Yes | ✅ Yes (2026-07-10) |
| **Bug 2** | Previous Track Freezing - Audio freezes after clicking previous track | ✅ FIXED | ✅ Yes | ✅ Yes (2026-07-11) |
| **Bug 3** | Next Track Button - Does not advance to next segment | ✅ FIXED | ✅ Yes | ✅ Yes (2026-07-11) - 8 tests in bug3.spec.js |

**Bug 1 & 2 Details:**
- Fixed via `switchPlayer()`, `playbackIntent` state tracking, recovery limiting (`MAX_RECOVERY_ATTEMPTS=3`, `MAX_LIVE_RELOADS=3`)
- Recovery mechanism handles interrupted play requests during navigation
- State synchronization prevents UI/player desync

**Bug 3 Details:**
- Discovered during Bug 2 validation (2026-07-11)
- Root cause: `segIndexForTime()` returned wrong index when segment timestamps overlapped
  - Stream segments often have overlapping timestamps during metadata transitions
  - Function iterated forwards, returning first matching segment instead of the correct later one
- Fix 1: Changed `segIndexForTime()` to iterate backwards (prefer later segment when timestamps overlap)
- Fix 2: Added robust validation to `nextTrack()` function for consistency with `prevTrack()`

### Feature Implementation Status

**Completed Features (15 total, 15 complete as of v1.5.0):**

| # | Feature | Description | Status | Date |
|---|---------|-------------|--------|------|
| **1** | Remove green bar | Removed the green buffer indicator from the timeline | ✅ Complete | 2026-07-11 |
| **2** | 12-hour clock format | Display time with 12-hour clock, date, and day name (e.g., "Sat Jul 11") below the time. Applied to playing time and timeline bounds. | ✅ Complete | 2026-07-11 |
| **3** | Fixed segment title height | Reserve 3 rows for track title, prevent button shifting | ✅ Complete | 2026-07-11 |
| **4** | Prevent page zoom | Fixed viewport meta tag, added touch-action CSS to prevent zoom on double-tap | ✅ Complete | 2026-07-11 |
| **5** | Remove status text | Removed "Playing"/"Paused" text below track title | ✅ Complete | 2026-07-11 |
| **6** | Live button | Add a "Live" button that starts playing as close to live as possible when touched | ✅ Complete | 2026-07-11 |
| **7** | Update heading | Changed "No Agenda DVR" to "No Agenda Time Machine" | ✅ Complete | 2026-07-11 |
| **8** | White button text/icons | Make text/icon color on buttons white, same as other white text | ✅ Complete | 2026-07-11 |
| **9** | Equal button sizes | Make skip forward and backward buttons the same size as the play/pause button | ✅ Complete | 2026-07-11 |
| **10** | Larger slider button | Make the slider button larger to support touch interaction on mobile devices | ✅ Complete | 2026-07-11 |
| **11** | Match CSS formatting | Match CSS formatting from https://noagenda.stream/#/livestream | ✅ Complete | 2026-07-11 |
| **12** | Remaining validation | Complete Bug 3 validation test, all bugs validated | ✅ Complete | 2026-07-11 |
| **13** | Slider drag updates title | As slider is dragged, title updates to segment at dragged position | ✅ Complete | 2026-07-12 |
| **14a** | Slider improvements | Segment-based slider, button swap, remove time labels | ✅ Complete | 2026-07-28 |
| **14** | Hamburger segment list | Add hamburger button with scrollable segment list | ✅ Complete | 2026-07-29 |

**Simplification (v1.4.0):**

| # | Task | Description | Status |
|---|------|-------------|--------|
| **S1** | Consolidate index.html copies | 3 live copies → 1 canonical + symlink | ✅ Complete |
| **S2** | Consolidate Python/start.sh | Remove validation/ duplicates | ✅ Complete |

**Feature Implementations:**
- **Feature #1 (Remove green bar):** Removed CSS `.buffer-bar` styling, HTML buffer indicator element, and JavaScript buffer update logic
- **Feature #2 (12-hour clock format):** Added `fmtTime12Hour(unix)` and `fmtDate(unix)` functions, updated all time displays, validated with 10 unit tests + 5 Playwright tests
- **Feature #3 (Fixed segment title height):** Set `min-height: 72px`, added `-webkit-line-clamp: 3`
- **Feature #4 (Prevent page zoom):** Fixed viewport meta tag, added `maximum-scale=1.0, user-scalable=no`, added `touch-action` CSS
- **Feature #5 (Remove status text):** Removed status element and all `UI.status` references
- **Feature #6 (Live button):** Added Live button with `goLive()` function, distinct blue styling, validated with 7 Playwright tests
- **Feature #7 (Update heading):** Changed logo from "No Agenda DVR" to "No Agenda Time Machine"
- **Feature #8 (White button text/icons):** Changed button colors to white with gold backgrounds, validated with 6 Playwright tests
- **Feature #9 (Equal button sizes):** Changed all control buttons to 64x64px, validated with 6 Playwright tests
- **Feature #10 (Larger slider button):** Increased slider thumb from 20px to 28px, validated with 6 Playwright tests
- **Feature #11 (Match CSS formatting):** Converted from dark theme to light theme matching NoAgenda.stream
- **Feature #12 (Bug 3 validation):** Created bug3.spec.js with 8 tests validating Next Track button fix
- **Feature #13 (Slider drag updates title) - v1.4.0:** As slider dragged, title updates to segment at dragged position via `segIndexForTime()`, 3 lines in input handler, 7 Playwright tests
- **Feature #14a (Slider improvements) - v1.4.3:**
  - Segment-index-based slider for finer control (min=0, max=segments.length-1)
  - Title sync solved via 1:1 segment mapping (no repeats during drag)
  - Button order: -30s, -10m, -1h, +30s, +10m, +1h
  - Removed time labels below timeline (.time-labels HTML/CSS, UI.startTime/UI.endTime)
  - Input handler: Direct segment index lookup instead of segIndexForTime(timestamp)
  - Heartbeat: Sets slider to currentIndex instead of currentTime
  - Validated with 10 Playwright tests, all 57 regression tests passing
- **Feature #14 (Hamburger segment list) - v1.5.0:**
  - Hamburger button (top-right corner) with SVG icon
  - Dropdown panel (320px wide, max 400px height, scrollable)
  - Segments displayed in reverse chronological order (newest first)
  - Each item shows time + title (long titles truncated with ellipsis)
  - Click segment → seek and close menu
  - Click outside → close menu (document-level event handler)
  - Toggle behavior on button click
  - Validated with 10 Playwright tests, all 67 regression tests passing

**Regression Tests:** 67 Playwright tests, all passing (v1.5.0)

### Known Issues & Considerations

### Browser Autoplay Policies
Modern browsers block autoplay without user interaction. The player includes a "Click to Start" overlay that captures first interaction, enabling playback.

### Live Edge Buffering
The production implementation uses a **fixed 30s offset** from the live edge:

- When playback catches up to the live segment
- Reload with position: `segment_end - 30s`
- Simple, reliable, no adaptive complexity

### Network Resilience
The recorder handles stream interruptions:
- Short blips (< 30s gap): Keeps file open, continues recording
- Long gaps: Closes segment, marks final, opens new segment
- Retry delays: 3s for first failures, 15s for persistent issues
- Grace period: 30 seconds before closing segment on reconnect

### Segment Reclamation
On script restart, Python reclaims existing segments if gap < 30s, preventing orphaned files.

## Code Style

- **Python**: Standard logging, atomic file writes, type-aware comments
- **JavaScript**: Arrow functions, const/let, structured logging with `log` object, `goLive()` for live edge, `segIndexForTime()` backwards iteration, Feature 13 drag title preview
- **HTML**: Inline styles, light theme (matching NoAgenda.stream - #415364 bg, #fff cards, #b08c4f accent), responsive layout, CSS variables, 64x64 buttons, 28px slider thumb
- **Bash**: POSIX-compliant, clear error messages, helpful output
- **Tests**: Playwright browser automation, 45 regression tests in test_validation/tests/ (v1.4.0)

## Development Notes

### Working Directory

**Primary work location:** `/home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production/`

This directory is the canonical source:
- `index.html` - THE frontend file to edit (678 lines + feature 13)
- `audio/recorderd.py` - THE recorder to edit (385 lines)
- `audio/start.sh` - THE launcher to edit (81 lines)
- `docs/` - Design documentation
- `TESTING.md` / `DEPLOYMENT.md` - Reports

Test validation:
- `test_validation/index.html` → symlink to `../validation/production/index.html`
- `test_validation/audio/playlist.json` - test data
- `test_validation/tests/` - Playwright specs

### Making Changes

1. Edit files in `validation/production/` (canonical source)
2. Test via `test_validation/` - `python3 -m http.server 8081` + `npx playwright test`
3. Deploy from `validation/production/` or `release/v1.4.0/` to server

### Deployment

See `production/DEPLOYMENT.md` for complete deployment instructions.

Quick deploy:
```bash
# From validation/production
# Upload files via sftp/scp to /var/www/html/noAgendaTimeMachine/
cp -r ../release/v1.4.0/* /var/www/html/noAgendaTimeMachine/
```

### Debugging

**Python logs** (attach to screen):
```bash
screen -r noagendarecorder
```

**Browser console**:
- Playlist fetch errors
- Sidecar JSON fetch errors
- Player state changes
- Buffer status

**Common issues**:
- Permission denied: Fix directory ownership/permissions
- Screen won't start: Check for existing sessions with `screen -list`
- No segments: Attach to screen, check Python errors

## Testing & Validation

### Running Tests

```bash
# Test HTML player (requires HTTP server)
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation
python3 -m http.server 8081 &
curl http://localhost:8081/index.html | grep "No Agenda Time Machine"

# Run Playwright regression tests
npx playwright test --reporter=list

# Run only feature13 tests
npx playwright test feature13 --reporter=list

# View test results
cat TESTING.md
```

### Playwright Browser Automation

The project uses Playwright for automated browser testing.

**Test environment setup:**
```bash
# test_validation/index.html is symlink to canonical (validation/production/index.html)
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation
python3 -m http.server 8081

# In another terminal
npx playwright test --reporter=list
```

**Bug validation tests:**
- Bug 1: Live Edge Stalling - ✅ Validated (2026-07-10)
- Bug 2: Previous Track Freezing - ✅ Validated (2026-07-11)
- Bug 3: Next Track Button - ✅ Validated with 8 tests (2026-07-11)

**Bug 1 Status:** ✅ Live Edge Stalling is FIXED. Live reload uses actual audio duration, buffered range validation, retry limiting (MAX_LIVE_RELOADS=3), and state synchronization.

**Bug 2 Status:** ✅ Previous Track Freezing is FIXED. Player switching (A↔B), recovery mechanism (MAX_RECOVERY_ATTEMPTS=3), and state synchronization.

**Bug 3 Status:** ✅ Next Track button FIXED and validated (2026-07-11). Root cause was `segIndexForTime()` returning wrong index for overlapping timestamps. Fixed by backwards iteration + validation. 8 Playwright tests in bug3.spec.js.

### Test Case Validation Status

**Test Coverage:** 45 Playwright regression tests, all passing (2026-07-12)

#### Regression Test Suite (v1.4.0)
| Test File | Tests | Feature | Status |
|-----------|-------|---------|--------|
| `feature2.spec.js` | 5 | 12-hour clock format | ✅ Pass |
| `feature6.spec.js` | 7 | Live button | ✅ Pass |
| `feature8.spec.js` | 6 | White button text/icons | ✅ Pass |
| `feature9.spec.js` | 6 | Equal button sizes | ✅ Pass |
| `feature10.spec.js` | 6 | Larger slider button | ✅ Pass |
| `bug3.spec.js` | 8 | Next Track validation | ✅ Pass |
| `feature13.spec.js` | 7 | Slider drag updates title | ✅ Pass |

#### Original Test Cases (16) - All Validated via Regression Suite
| # | Test Case | Description | Status |
|---|-----------|-------------|--------|
| 1 | Play at live edge | Let play for 2-3 minutes, verify no stalling | ✅ Validated via Bug 1 |
| 2 | Back 2 tracks | Click previous track twice, verify smooth playback | ✅ Validated (2026-07-11) |
| 3 | Back 2, forward 1 | Bidirectional navigation test | ✅ Covered by bug3.spec.js |
| 4 | Back 3 tracks | Multi-segment navigation test | ✅ Covered |
| 5 | Seek back 30s | Intra-segment seeking | ✅ Covered |
| 6 | Seek back 10m | Cross-segment seeking | ✅ Covered |
| 7 | Seek back 1h | Large time jumps | ✅ Covered |
| 8 | Back 2h, forward 30s | Complex navigation | ✅ Covered |
| 9 | Invalid segment | Attempt navigation beyond playlist | ✅ nextTrack validation |
| 10 | Seek beyond duration | Offset validation test | ✅ Covered |
| 11 | Buffer depletion | Recovery test at live edge | ✅ Bug 1 |
| 12 | Rapid switching | State consistency test | ✅ Bug 2 |
| 13 | Network interruption | Recovery limiting test | ✅ Validated |
| 14 | Play/Pause toggle | Verify playback state changes | ✅ Validated |
| 15 | Next track navigation | Advance to next segment | ✅ Validated via bug3.spec.js (8 tests) |
| 16 | Time display accuracy | Verify time updates correctly | ✅ Validated |

### Test Coverage (Original)

| Component | Test Method | Status |
|-----------|-------------|--------|
| HTML Structure | curl validation | ✅ Pass |
| Playlist API | JSON validation | ✅ Pass |
| Screen Launcher | Session management | ✅ Pass |
| Code Review | Security & quality | ✅ Pass |
| Token Efficiency | Line count analysis | ✅ 60% reduction |

## Development History

### Phase 1: Architecture & Requirements (Complete)
- Approved production architecture design
- Simplified from PoC (removed adaptive buffering)
- Static HTML instead of dynamic generation
- Screen session management

### Phase 2: Code Generation (Complete)
- Python recorder: 385 lines (down from 1,413 PoC)
- HTML player: 678 lines (clean, maintainable)
- Screen launcher: 81 lines
- Deployment package ready

### Phase 3: Testing & Validation (Complete - v1.3.0)
- ✅ Created comprehensive testing report (TESTING.md)
- ✅ Validated HTML player structure and elements
- ✅ Tested screen launcher functionality
- ✅ Completed code review with security audit
- ✅ Verified architecture compliance
- ✅ Local Git repo with commits for Phases 2 & 3
- ✅ Bug 1 (Live Edge Stalling) - FIXED and validated (2026-07-10)
- ✅ Bug 2 (Previous Track Freezing) - FIXED and validated (2026-07-11)
- ✅ Bug 3 (Next Track Button) - FIXED and validated (2026-07-11) - 8 tests
- ✅ 38 Playwright regression tests, all passing (2026-07-11)
- ✅ All 12 features complete and validated

### Phase 4: Production Release (v1.3.0 Complete - 2026-07-11)
- ✅ All 3 bugs fixed and validated
- ✅ All 12 features implemented:
  - v1.1.0: Light theme (Feature 11 - 1/12)
  - v1.2.0: UI improvements (Features 1,2,3,4,5,7 - 7/12 total)
  - v1.3.0: Complete feature set (Features 6,8,9,10,12 - 12/12 total)
- ✅ Live button (Feature 6) - goLive() with 30s offset
- ✅ White button text/icons (Feature 8) - gold bg, white text
- ✅ Equal button sizes (Feature 9) - 64x64px all controls
- ✅ Larger slider button (Feature 10) - 28px thumb
- ✅ Bug 3 validation (Feature 12) - 8 Playwright tests
- ✅ Release package created at `release/v1.3.0/`
- ✅ Documentation updated (TODO.md 12/12, CLAUDE.md v1.3.0)
- ✅ Git commits per feature with regression tests

### Phase 5: Feature 13 + Simplification (v1.4.0 Complete - 2026-07-12)
- ✅ Feature 13: Slider drag updates title (3 lines + 7 tests)
  - Input handler now shows title at dragged position via segIndexForTime()
  - Guard prevents crash when segments empty
- ✅ Simplification S1/S2:
  - 3 live copies of index.html → 1 canonical (validation/production/index.html) + symlink (test_validation/)
  - Removed validation/index.html, validation/noAgendaTimeMachine.py, validation/start.sh
  - Fixed start.sh to reference recorderd.py (was noAgendaTimeMachine.py)
  - test_validation/index.html is symlink → ../validation/production/index.html
- ✅ 45 Playwright regression tests (38 + 7 new for feature13), all passing
- ✅ Release package created at `release/v1.4.0/`
- ✅ Documentation updated (TODO.md 13/14, CLAUDE.md v1.4.0)

## Related Files

- **TODO List**: `TODO.md` - Feature requests and UI improvements (13/14 complete for v1.4.0, #14 pending)
- **Release Notes**: `../release/v1.4.0/RELEASE_v1.4.0.md` - v1.4.0 release summary (feature 13 + simplification, 45 tests)
- **Release Packages**:
  - `../release/v1.1.0/` - Light theme
  - `../release/v1.2.0/` - UI improvements (7/12)
  - `../release/v1.3.0/` - 12 features complete (38 tests)
  - `../release/v1.4.0/` - Current - Feature 13 + simplification (45 tests, 2026-07-12)
- **Design Document**: `docs/2025-07-04-no-agenda-time-machine-production-design.md`
- **Deployment Guide**: `production/DEPLOYMENT.md`
- **Testing Report**: `TESTING.md`
- **Bug Fix Summary**: `tests/BUG_FIX_SUMMARY.md`
- **Playwright Tests**: `../test_validation/tests/` - feature2, feature6, feature8, feature9, feature10, bug3, feature13 specs (45 tests)
- **Test Results**: `../TestResults/`

### Quick Bug Reference - All Fixed ✅

- **Bug 1**: Live Edge Stalling - FIXED via actual duration, buffered validation, MAX_LIVE_RELOADS=3
- **Bug 2**: Previous Track Freezing - FIXED via switchPlayer(), playbackIntent, MAX_RECOVERY_ATTEMPTS=3
- **Bug 3**: Next Track Button - FIXED via backwards iteration in segIndexForTime() + validation, 8 tests in bug3.spec.js
- **All 3 bugs**: Validated 2026-07-11, 45 regression tests passing (v1.4.0)
- **Feature 13**: Slider drag title preview - implemented via segIndexForTime() in input handler
- **Simplification**: 3 live copies → 1 canonical + symlink - completed 2026-07-12
