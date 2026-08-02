# Release v1.5.4 - Date Display in Hamburger Menu

**Date:** 2026-08-01

## Changes

### Features
- **Date display in hamburger menu**: Each segment item now shows the date alongside the time
- **"Today" label**: Segments from the current day display "Today" instead of the date for quick orientation
- **Full time with AM/PM**: Time now includes AM/PM indicator (previously stripped)
- **Stacked item layout**: Title on top line, time + date on second line for improved readability

### Technical Details
- New `fmtSegmentDate(unix)` helper: returns "Today" for current-day segments, otherwise delegates to `fmtDate()`
- Uses local calendar date comparison for day matching (consistent with existing `fmtDate` and `fmtTime12Hour`)
- Menu item layout: `flex-direction: column` with title span and meta line (time · date)
- CSS: `.segment-item-meta` replaces `.segment-item-time` rule; monospace, muted color, 12px
- Separator: middle dot "·" between time and date

### Testing
- Updated feature14 test 6 time regex for full AM/PM format
- 5 new Playwright tests (11-15): date presence, format validation, exact computed date, "Today" label, stacked layout
- Fixed stale version test in abort-error.spec.js (v1.4.3 → v1.5.4)
- All 72 regression tests passing

### Installation
Copy files to `/var/www/html/noAgendaTimeMachine/`:
```bash
cp -r release/v1.5.4/* /var/www/html/noAgendaTimeMachine/
```

### Migration Notes
- No configuration changes required
- Drop-in replacement for v1.5.3
- Existing playlists fully compatible
- All 15 features remain intact
- All previous bug fixes (Bugs 1-6) remain in place

### Known Issues
- None

### Previous Releases
- v1.5.3: Bug fixes - time display stalled & playback skip
- v1.5.2: Bug fix - infinite reload loop (Bug 4)
- v1.5.1: Bug fix - playback stall after skipping
- v1.5.0: Hamburger segment list (10 new tests, 67 total)
- v1.4.3: Slider improvements (10 new tests)
- v1.4.0: Feature 13 + simplification (45 tests)
- v1.3.0: Complete feature set (38 tests)
