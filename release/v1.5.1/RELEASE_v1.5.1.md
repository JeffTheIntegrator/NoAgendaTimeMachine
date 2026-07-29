# Release v1.5.1 - Bug Fix: Playback Stalls After Skipping

**Date:** 2026-07-29

## Bug Fixes

### Fixed: Playback Stalls After Skipping (+10m)

**Issue**: When skipping forward (+10m) multiple times, playback would eventually stall with "buffer underrun" errors. The background player was repeatedly loading the same short segment, interfering with active playback.

**Root Cause**: 
- `playSegment()` was unconditionally setting `active.src = url`, even when the player already had that source loaded
- `preloadNext()` was setting `next.src` repeatedly on every metadata load event
- This created a loop of load/abort cycles that could interfere with active playback buffering

**Fix**:
- Added check in `playSegment()` to skip setting `src` if player already has that source loaded
- Added check in `preloadNext()` to only set `src` if not already set to that URL

**Technical Details**:
```javascript
// In playSegment() - avoid redundant loads
if (active.src && active.src === url) {
    log.d(playerName, 'Source already loaded, skipping redundant load');
} else {
    active.src = url;
    log.state('LOAD_START', { player: playerName, url });
}

// In preloadNext() - only set if needed
if (!next.src || next.src !== nextUrl) {
    next.src = nextUrl;
}
```

**Testing**:
- 66 regression tests passing
- Fix verified against original bug report scenario

## Installation

Copy files to `/var/www/html/noAgendaTimeMachine/`:
```bash
cp -r release/v1.5.1/* /var/www/html/noAgendaTimeMachine/
```

## Migration Notes

- No configuration changes required
- No API changes
- Drop-in replacement for v1.5.0
- All 15 features remain intact

## Known Issues

- None

## Previous Releases

- v1.5.0: Hamburger segment list (10 new tests)
- v1.4.3: Slider improvements (10 new tests)
- v1.4.2: Additional refinements
- v1.4.0: Feature 13 + simplification (45 tests)
- v1.3.0: Complete feature set (38 tests)
