# Release v1.4.1 - Bug Fix: Play Rejected Error

**Release Date:** 2026-07-20

## What's Fixed

### Bug: "Play rejected - interrupted by new load request" Error
- **Symptom:** Console logs showing `AbortError: The play() request was interrupted by a new load request` when rapidly clicking navigation buttons
- **Root Cause:** `preloadNext()` was calling `load()` explicitly, triggering `onloadedmetadata` with stale closure state
- **Fix:** Removed redundant `load()` call - HTML5 audio with `preload='auto'` handles loading automatically when `src` is assigned
- **Also:** Simplified `handleEnded()` next segment logic to use `playSegment()` for consistent state management

## Files Modified

1. `index.html` (line 700): Removed `next.load()` call from `preloadNext()`
2. `index.html` (lines 951-986): Simplified `handleEnded()` to use `playSegment()` for next segment advancement

## Test Results

- **43 tests passing** (all regression tests pass)
- 1 pre-existing flaky test unrelated to this fix

## Installation

```bash
# Copy to production server
cp -r release/v1.4.1/* /var/www/html/noAgendaTimeMachine/

# Or deploy individual files
cp release/v1.4.1/index.html /var/www/html/noAgendaTimeMachine/
cp release/v1.4.1/audio/*.py /var/www/html/noAgendaTimeMachine/audio/
cp release/v1.4.1/audio/*.sh /var/www/html/noAgendaTimeMachine/audio/
```

## Version History

- **v1.4.0** (2026-07-12): Feature 13 (Slider drag updates title) + Simplification
- **v1.4.1** (2026-07-20): Bug fix for "Play rejected" error
