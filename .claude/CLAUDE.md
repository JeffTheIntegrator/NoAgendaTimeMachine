# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NoAgendaTimeMachine is a Python-based DVR for the No Agenda stream. It continuously records an ICY audio stream, splits it into MP3 segments based on metadata changes (StreamTitle), and provides a static HTML player for time-shifted playback.

**Architecture:**
- **Python recorder** (`recorderd.py`): Captures stream, writes MP3 segments with JSON metadata sidecars, updates `playlist.json`
- **HTML player** (`index.html`): Static file with embedded JavaScript, dual-buffer audio player (playerA/playerB), fetches playlist.json and sidecar metadata
- **Screen launcher** (`start.sh`): Manages recorder in detached screen session
- **Live edge handling**: Dynamic reloading at the stream's leading edge with fixed 30s offset

**Current Version:** v1.6.1 (Extended retention) - Released 2026-08-02
**Project Status:** ✅ All 6 bugs fixed, 15/15 features complete - v1.6.1 released

## Project Structure

```
noAgendaTimeMachine/
├── .agent/
│   └── CLAUDE.md (this file)
├── release/                       # Release packages (frozen artifacts)
│   ├── v1.1.0/                   # Light theme release
│   ├── v1.2.0/                   # UI improvements
│   ├── v1.3.0/                   # 12 features complete
│   ├── v1.5.4/                   # Date display in hamburger menu
│   ├── v1.6.0/                   # Security & quality release
│   ├── v1.6.1/                   # Current - Extended retention (7 days)
│   │   ├── index.html
│   │   ├── RELEASE_v1.6.0.md
│   │   └── audio/
│   │       ├── recorderd.py
│   │       ├── start.sh
│   │       └── segments/
├── validation/                    # Development & deployment source
│   ├── docs/
│   │   └── 2025-07-04-no-agenda-time-machine-production-design.md
│   ├── production/                # CANONICAL SOURCE (source for releases)
│   │   ├── index.html             # THE frontend file - edit here
│   │   └── audio/
│   │       ├── recorderd.py       # THE recorder - edit here
│   │       ├── start.sh           # THE launcher - edit here
│   │       └── segments/
│   ├── TESTING.md                 # Testing & validation report
│   └── playlist.json              # (removed - was duplicate test data)
├── test_validation/               # Playwright browser tests
│   ├── index.html -> ../validation/production/index.html (symlink)
│   ├── audio/
│   │   └── playlist.json         # test data
│   └── tests/
│       ├── feature2.spec.js (5 tests)
│       ├── feature6.spec.js (7 tests)
│       ├── feature8.spec.js (6 tests)
│       ├── feature9.spec.js (6 tests)
│       ├── feature10.spec.js (6 tests)
│       ├── bug3.spec.js (8 tests)
│       └── feature13.spec.js (7 tests)
├── TODO.md                        # Feature requests (13/14 complete for v1.4.0, 14 pending)
└── .git/
```

**Note on file copies:** As of v1.4.0, the project has a single canonical live source:
- `validation/production/index.html` - THE frontend file
- `validation/production/audio/recorderd.py` - THE recorder
- `validation/production/audio/start.sh` - THE launcher
- `test_validation/index.html` - symlink → `../validation/production/index.html`

Previous duplicate copies (`validation/index.html`, `validation/noAgendaTimeMachine.py`, `validation/start.sh`) were removed in v1.4.0. Release artifacts (`release/v1.*/`) are frozen and not touched.

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
# From validation/production directory (canonical source)
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
./audio/start.sh

# Or run Python directly (for testing without screen)
cd audio/
python3 recorderd.py
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

Edit `validation/production/audio/recorderd.py`:

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
- **Slider drag preview (Feature 13)**: As slider is dragged, title updates to show segment at dragged position via `segIndexForTime()`

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `recorderd.py` | Python recorder (canonical) | 385 |
| `index.html` | Static HTML player (canonical) | ~680 |
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

### All Bugs Fixed ✅

| Bug ID | Description | Status | Fixed | Validated |
|--------|-------------|--------|-------|-----------|
| **Bug 1** | Live Edge Stalling - Audio stops while UI shows playing, buffer depletion errors | ✅ FIXED | ✅ Yes | ✅ Yes (2026-07-10) |
| **Bug 2** | Previous Track Freezing - Audio freezes after clicking previous track | ✅ FIXED | ✅ Yes | ✅ Yes (2026-07-11) |
| **Bug 3** | Next Track Button - Does not advance to next segment | ✅ FIXED | ✅ Yes | ✅ Yes (2026-07-11) |

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

**Completed Features (14 total, 13 complete as of v1.4.0):**

| # | Feature | Description | Status | Date |
|---|---------|-------------|--------|------|
| **1** | Remove green buffer bar | Removed the green buffer indicator from the timeline | ✅ Complete | 2026-07-11 |
| **2** | 12-hour clock format | Display time with 12-hour clock, date, and day name (e.g., "Sat Jul 11") below the time. Applied to playing time and timeline bounds. | ✅ Complete | 2026-07-11 |
| **3** | Fixed segment title height | Reserve 3 rows for track title, prevent button shifting | ✅ Complete | 2026-07-11 |
| **4** | Prevent page zoom | Fixed viewport meta tag, added touch-action CSS to prevent zoom on double-tap | ✅ Complete | 2026-07-11 |
| **5** | Remove status text | Removed "Playing"/"Paused" text below track title | ✅ Complete | 2026-07-11 |
| **6** | Live button | Add a "Live" button that starts playing as close to live as possible when touched | ✅ Complete | 2026-07-11 |
| **7** | Update heading | Changed "No Agenda DVR" to "No Agenda Time Machine" | ✅ Complete | 2026-07-11 |
| **8** | White button text/icons | Make text/icon color on buttons white, same as other white text | ✅ Complete | 2026-07-11 |
| **9** | Equal button sizes | Make skip forward and backward buttons the same size as the play/pause button | ✅ Complete | 2026-07-11 |
| **10** | Larger slider button | Make the slider button larger to support touch interaction on mobile devices | ✅ Complete | 2026-07-11 |
| **11** | Match NoAgenda.stream CSS | Light theme matching NoAgenda.stream color palette (bluish-gray background, white cards, dark text) | ✅ Complete | 2026-07-11 |
| **12** | Remaining validation | Complete Bug 3 validation test, all bugs validated | ✅ Complete | 2026-07-11 |
| **13** | Slider drag updates title | As slider is dragged, title updates to segment at dragged position | ✅ Complete | 2026-07-12 |
| **14** | Hamburger segment list | Add hamburger button with scrollable segment list showing time + date (v1.5.4) | ✅ Complete | 2026-07-29 |

**Simplification (v1.4.0):**

| # | Task | Description | Status |
|---|------|-------------|--------|
| **S1** | Consolidate index.html copies | 3 live copies → 1 canonical + symlink | ✅ Complete |
| **S2** | Consolidate Python/start.sh | Remove validation/ duplicates, canonical is validation/production/audio/ | ✅ Complete |

**Feature #1 (Remove green buffer bar):**
- Removed CSS `.buffer-bar` styling
- Removed HTML buffer indicator element
- Removed JavaScript buffer update logic
- Removed `bufferBar` from UI object

**Feature #2 (12-hour clock format):**
- Added `fmtTime12Hour(unix)` function - formats as "9:30:15 AM" (no leading zero on hour)
- Added `fmtDate(unix)` function - formats as "Sat Jul 11" (day name, month, day)
- Added `.date-display` CSS class with 14px muted font
- Updated all time displays to use 12-hour format
- Validated with 10 unit tests + 5 Playwright browser tests (all passing)

**Feature #3 (Fixed segment title height):**
- Set `min-height: 72px` to reserve 3 rows of space
- Added `-webkit-line-clamp: 3` to truncate long titles
- Added `overflow: hidden` and `-webkit-box-orient: vertical`
- Prevents buttons from moving when title length changes

**Feature #4 (Prevent page zoom):**
- Fixed viewport meta tag: removed duplicate "name" attribute
- Added `maximum-scale=1.0, user-scalable=no` to viewport
- Added `touch-action: manipulation` to `.player-card` CSS
- Added `touch-action: pan-y` to `body` CSS
- Prevents zoom on double-tap, especially on mobile devices

**Feature #5 (Remove status text):**
- Removed "Playing"/"Paused" text below track title
- Removed `.status` CSS styling
- Removed `status` from UI object
- Removed `UI.status.textContent` updates from `updateUI()` and `init()`

**Feature #6 (Live button):**
- Added Live button to main-controls section (4th button)
- Added `goLive()` JavaScript function that navigates to `lastSeg.end - LIVE_EDGE_OFFSET`
- Added `.live-btn` CSS with `var(--link)` background (distinct blue)
- Play icon SVG for visual consistency
- Validated with 7 Playwright tests (feature6.spec.js)

**Feature #7 (Update heading):**
- Changed logo from "No Agenda DVR" to "No Agenda Time Machine"
- Updated both `.logo` element and `<title>` tag

**Feature #8 (White button text/icons):**
- Changed `.jump-btn` background from `#f5f5f5` to `var(--accent)` (gold)
- Changed button text/icons from `var(--text-muted)` to `#fff` (white)
- Updated hover states to maintain white text
- Validated with 6 Playwright tests (feature8.spec.js)

**Feature #9 (Equal button sizes):**
- Changed `.control-btn` dimensions from 48px to 64px to match `.play-btn`
- All control buttons now 64x64px for consistent visual hierarchy and touch targets
- Validated with 6 Playwright tests (feature9.spec.js)

**Feature #10 (Larger slider button):**
- Increased `.timeline::-webkit-slider-thumb` from 20px to 28px
- Increased `.timeline::-moz-range-thumb` from 20px to 28px
- More touch-friendly on mobile devices
- Validated with 6 Playwright tests (feature10.spec.js)

**Feature #11 (Match NoAgenda.stream CSS):**
- Converted from dark theme to light theme
- Updated CSS variables to match NoAgenda.stream:
  - `--body-bg: #415364` (bluish-gray)
  - `--card-bg: #fff` (white)
  - `--text-primary: #222` (dark text)
  - `--text-muted: #767676` (muted)
  - `--accent: #b08c4f` (gold/amber)
  - `--link: #77abd9` (light blue)
- Updated font family to match reference site
- Softened shadows for light theme
- Verified via browser testing

**Feature #12 (Remaining validation / Bug 3):**
- Created `bug3.spec.js` with 8 tests validating Next Track button fix
- Verified `segIndexForTime()` iterates backwards for overlapping segments
- Verified `nextTrack()` validation prevents invalid navigation
- All 38 regression tests passing (feature2, 6, 8, 9, 10, bug3)

**Feature #13 (Slider drag updates title) - v1.4.0:**
- As slider is dragged across timeline, title updates to segment at dragged position
- 3-line addition to `input` event handler: `segIndexForTime(time)` + title preview
- Reuses existing backwards-iteration in `segIndexForTime()` for overlapping segments
- Guard `if (segments[dragIdx])` prevents crash when segments empty
- Time/date display continues to update during drag (existing behavior preserved)
- Validated with 7 Playwright tests (feature13.spec.js)

**Simplification S1/S2 (v1.4.0):**
- Consolidated 3 live copies of `index.html` to 1 canonical (`validation/production/index.html`) + symlink (`test_validation/index.html`)
- Removed `validation/index.html`, `validation/noAgendaTimeMachine.py`, `validation/start.sh` (all identical to production copies)
- Fixed `start.sh` to reference `recorderd.py` (was `noAgendaTimeMachine.py`)
- `test_validation/index.html` is now symlink → `../validation/production/index.html` (or copy if symlink unavailable)
- Release artifacts (`release/v1.*/`) remain frozen and untouched

**Regression Tests:** 76 Playwright tests, all passing (v1.6.1)

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
On script restart, Python always creates a new segment file — existing segments remain on disk until cleaned up by the retention policy (MAX_AGE).

## Code Style

- **Python**: Standard logging, atomic file writes, type-aware comments
- **JavaScript**: Arrow functions, const/let, structured logging with `log` object, `segIndexForTime()` backwards iteration, slider drag title preview (Feature 13)
- **HTML**: Inline styles, light theme (matching NoAgenda.stream), responsive layout, CSS variables
- **Bash**: POSIX-compliant, clear error messages, helpful output

## Development Notes

### Working Directory

**Primary work location:** `/home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production/`

This directory is the canonical source:
- `index.html` - THE frontend file to edit
- `audio/recorderd.py` - THE recorder to edit
- `audio/start.sh` - THE launcher to edit
- `docs/` - Design documentation

### Making Changes

1. Edit files in `validation/production/` (canonical source)
2. Test via `test_validation/` (Playwright, symlink to canonical index.html)
3. Deploy from `validation/production/` to server (or use `release/v1.4.0/` package)

### Deployment

See `validation/production/DEPLOYMENT.md` for complete deployment instructions.

Quick deploy:
```bash
# From validation/production directory
# Upload files via sftp/scp to /var/www/html/noAgendaTimeMachine/
```

Or from release package:
```bash
cp -r release/v1.4.0/* /var/www/html/noAgendaTimeMachine/
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

# Run Playwright tests
npx playwright test --reporter=list
npx playwright test feature13 --reporter=list

# View test results
cat validation/TESTING.md
```

### Playwright Browser Automation

The project uses Playwright for automated browser testing.

**Test environment setup:**
```bash
# Serve the HTML for Playwright (test_validation/index.html is symlink to canonical)
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation
python3 -m http.server 8081

# In another terminal, run tests
npx playwright test --reporter=list
```

**Bug validation tests:**
- Bug 1: Live Edge Stalling - ✅ Validated (2026-07-10)
- Bug 2: Previous Track Freezing - ✅ Validated (2026-07-11)
- Bug 3: Next Track Button - ✅ Validated with 8 tests (2026-07-11)

**Bug 1 Status:** ✅ Live Edge Stalling is FIXED and validated (2026-07-10). Live reload uses actual audio duration, buffered range validation, retry limiting (MAX_LIVE_RELOADS=3), and state synchronization all working correctly.

**Bug 2 Status:** ✅ Previous Track Freezing is FIXED and validated (2026-07-11). Player switching (A↔B), recovery mechanism (MAX_RECOVERY_ATTEMPTS=3), and state synchronization all working correctly. Validated in fresh browser session.

**Bug 3 Status:** ✅ Next Track button FIXED and validated (2026-07-11). Root cause was `segIndexForTime()` returning wrong index for overlapping timestamps. Fixed by iterating backwards to prefer later segment. Added robust validation to `nextTrack()`. Validated with 8 Playwright tests in bug3.spec.js.

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

#### Original Test Cases (16)
| # | Test Case | Description | Status |
|---|-----------|-------------|--------|
| 1 | Play at live edge | Let play for 2-3 minutes, verify no stalling | ✅ Validated via Bug 1 fix |
| 2 | Back 2 tracks | Click previous track twice, verify smooth playback | ✅ Validated (2026-07-11) |
| 3 | Back 2, forward 1 | Bidirectional navigation test | ✅ Covered by bug3.spec.js |
| 4 | Back 3 tracks | Multi-segment navigation test | ✅ Covered |
| 5 | Seek back 30s | Intra-segment seeking | ✅ Covered |
| 6 | Seek back 10m | Cross-segment seeking | ✅ Covered |
| 7 | Seek back 1h | Large time jumps | ✅ Covered |
| 8 | Back 2h, forward 30s | Complex navigation | ✅ Covered |
| 9 | Invalid segment | Attempt navigation beyond playlist | ✅ Covered by nextTrack validation |
| 10 | Seek beyond duration | Offset validation test | ✅ Covered |
| 11 | Buffer depletion | Recovery test at live edge | ✅ Validated via Bug 1 |
| 12 | Rapid switching | State consistency test | ✅ Validated via Bug 2 |
| 13 | Network interruption | Recovery limiting test | ✅ Validated |
| 14 | Play/Pause toggle | Verify playback state changes | ✅ Validated |
| 15 | Next track navigation | Advance to next segment | ✅ Validated via bug3.spec.js |
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

### Phase 3: Testing & Validation (Complete)
- ✅ Created comprehensive testing report (TESTING.md)
- ✅ Validated HTML player structure and elements
- ✅ Tested screen launcher functionality
- ✅ Completed code review with security audit
- ✅ Verified architecture compliance
- ✅ Local Git repo with commits for Phases 2 & 3
- ✅ Bug 1 (Live Edge Stalling) - FIXED and validated (2026-07-10)
- ✅ Bug 2 (Previous Track Freezing) - FIXED and validated (2026-07-11)
- ✅ Bug 3 (Next Track Button) - FIXED and validated (2026-07-11)
- ✅ 38 Playwright regression tests, all passing (2026-07-11)

### Phase 4: Production Release (v1.3.0 Complete - 2026-07-11)
- ✅ All bugs fixed and validated (3/3)
- ✅ All 12 features implemented and validated
  - v1.1.0: Light theme (Feature 11)
  - v1.2.0: UI improvements (Features 1, 3, 4, 5, 7 + 12-hour clock)
  - v1.3.0: Complete feature set (Features 6, 8, 9, 10, 12)
- ✅ Light theme matching NoAgenda.stream (bluish-gray bg, white cards, gold accent)
- ✅ Mobile usability: larger slider (28px), equal buttons (64px), prevent zoom
- ✅ Live button for near-live playback
- ✅ Release package created at `release/v1.3.0/` with 38 regression tests

### Phase 5: Feature 13 + Simplification (v1.4.0 Complete - 2026-07-12)
- ✅ Feature 13: Slider drag updates title (3 lines + 7 tests)
- ✅ Simplification S1/S2: 3 live copies → 1 canonical + symlink (or copy)
  - Removed `validation/index.html`, `validation/noAgendaTimeMachine.py`, `validation/start.sh`
  - `test_validation/index.html` is now symlink to canonical
  - Fixed `start.sh` to reference `recorderd.py` (was `noAgendaTimeMachine.py`)
- ✅ 45 Playwright regression tests, all passing (38 + 7 new)
- ✅ Release package at `release/v1.4.0/`

### Phase 6: Security & Quality (v1.6.0 - 2026-08-02)
- ✅ Phase 1: XSS fix — `innerHTML` replaced with DOM API in `renderSegmentList()` (+4 security tests)
- ✅ Phase 2: User-visible error feedback (`setStatus()`), DOM efficiency (`lastGeneratedAt`), preload optimization
- ✅ Phase 3: Adaptive polling (5s→60s), accessibility (ARIA labels, keyboard nav), correctness fixes (`isPlaying` function, same-segment seek)
- ✅ Phase 4: Code cleanup — inline `onclick` → event listeners, shared `attemptRecovery()`, Map-based recovery tracking, dead code removal
- ✅ Phase 5: Python fixes — reconnection gap uses actual elapsed time, FD leak fix on retry
- ✅ 76 Playwright regression tests, all passing (72 + 4 new XSS tests)
- ✅ Code review findings from v1.5.4 applied
- ✅ Release package at `release/v1.6.0/`

### Phase 7: Extended Retention (v1.6.1 - 2026-08-02)
- ✅ MAX_AGE increased from 72 hours (3 days) to 7 days (168 hours)
- ✅ Release package at `release/v1.6.1/`

## Related Files

- **TODO List**: `TODO.md` - Feature requests (13/14 complete for v1.4.0, #14 pending)
- **Release Notes**: `release/v1.6.1/RELEASE_v1.6.1.md` - v1.6.1 release summary
- **Release Packages**:
  - `release/v1.1.0/` - Light theme
  - `release/v1.2.0/` - UI improvements (7/12)
  - `release/v1.3.0/` - 12 features complete (38 tests)
  - `release/v1.4.0/` - Feature 13 + simplification (45 tests)
  - `release/v1.5.4/` - Date display in hamburger menu (72 tests)
  - `release/v1.6.0/` - Security & quality release (76 tests)
  - `release/v1.6.1/` - Current - Extended retention, 7 days (76 tests)
- **Design Document**: `validation/production/docs/2025-07-04-no-agenda-time-machine-production-design.md`
- **Testing Report**: `validation/TESTING.md`
- **Code Review**: `validation/CODE_REVIEW.md` — v1.5.4 review, findings applied in v1.6.0
- **Playwright Tests**: `test_validation/tests/` - feature2, feature6, feature8, feature9, feature10, bug3, feature13, feature14, slider-improvements, abort-error, code-review-xss specs (76 tests)
- **Previous Releases**: `release/v1.1.0/`, `release/v1.2.0/`, `release/v1.3.0/`, `release/v1.4.0/`, `release/v1.5.4/`

### Quick Reference

- **Current Release**: `release/v1.6.1/` - Extended retention (7 days), 76 tests passing
- **Current Version**: v1.6.1 (2026-08-02)
- **Bug Validation**: All 6 bugs fixed and validated
- **Code Review**: v1.5.4 review complete — all findings applied in v1.6.0
- **Features Implemented** (15/15):
  - Remove green bar (1), 12-hour clock (2), Fixed title height (3), Prevent zoom (4)
  - Remove status (5), Live button (6), Update heading (7), White text (8)
  - Equal sizes (9), Larger slider (10), Light theme (11), Bug3 validation (12)
  - Slider drag title (13), Slider improvements (14a), Hamburger list (14)
- **Simplification**: 3 live copies → 1 canonical (validation/production/) + symlink (test_validation/)
- **Regression Tests**: 76 tests — feature2 (5), feature6 (7), feature8 (6), feature9 (6), feature10 (6), bug3 (8), feature13 (7), slider-improvements (10), abort-error (3), feature14 (15), code-review-xss (4)
