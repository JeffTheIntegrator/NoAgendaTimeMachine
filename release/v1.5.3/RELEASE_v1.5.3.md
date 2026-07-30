# Release v1.5.3 - Bug Fixes: Time Display Stalled & Playback Skip

**Date:** 2026-07-30

## Bug Fixes

### Fixed: Time Display Stopped (Bugs 4 & 5)

**Issue**: Time display would freeze/stop updating while audio continued playing.

**Observed Behavior**:
- Time display freezes at a specific time (e.g., 11:33:33 AM)
- Audio continues playing in background
- Console logs show `timeupdate` events firing with current time values
- Time display in UI remains stuck

**Root Cause**:
- Heartbeat interval only updated time display when `!active.paused` was true
- When player entered WAITING/STALLED state, `active.paused === false` but `isPlaying === false`
- The condition `!active.paused && segments[currentIndex]` was too restrictive
- Time display should update whenever there's a valid segment, regardless of player state

**Fix**:
- Removed `!active.paused` condition from heartbeat interval
- Now time display updates whenever `segments[currentIndex]` exists
- This matches expected user behavior (time shows position even when paused)

**Technical Details**:
```javascript
// Before:
if (!active.paused && segments[currentIndex]) {
    currentTime = segments[currentIndex].start + active.currentTime;
    // ... update UI
}

// After:
if (segments[currentIndex]) {
    currentTime = segments[currentIndex].start + active.currentTime;
    // ... update UI
}
```

### Fixed: Playback Skip During Live Edge Reload (Bug 6)

**Issue**: During live edge reload, playback would skip back and replay content.

**Observed Behavior**:
- Player reaches end of live segment
- Live edge reload triggers
- Playback skips back ~30 seconds and replays content
- Duration increases during playback (stream still recording)

**Root Cause**:
- Live edge reload used `active.duration` to calculate offset
- `active.duration` can be larger than actual buffered content (HLS/progressive streaming)
- When offset exceeded buffered range, player would skip back to seek position
- Duration grows during recording: 2850.5s → 2939.4s, but buffered content lags

**Fix**:
1. Check if actually close to live edge before reloading (within LIVE_EDGE_OFFSET + 5s)
2. Use `bufferedEnd` instead of `active.duration` as basis for offset calculation
3. If not close to edge, continue playback from current position instead of reloading
4. Final validation to ensure offset is within range

**Technical Details**:
```javascript
// Check if close to live edge before reloading
const currentPos = active.currentTime;
if (currentPos < actualDuration - LIVE_EDGE_OFFSET - 5) {
    // Not close enough, continue from current position
    playSegment(currentIndex, currentPos, playbackIntent);
    return;
}

// Use buffered range as basis (more reliable than duration)
if (active.buffered.length > 0) {
    const bufferedEnd = active.buffered.end(active.buffered.length - 1);
    const effectiveDuration = Math.min(actualDuration, bufferedEnd);
    offset = effectiveDuration - LIVE_EDGE_OFFSET;
}
```

### Additional Improvement: Smoother Time Display Updates

**Enhancement**: Added timeupdate-based UI updates for more responsive time display.

**Details**:
- Timeupdate event fires ~4 times per second (vs 1-second heartbeat)
- Added UI updates to timeupdate handler for smoother display
- Only updates for active player (checked via `usePlayerA === (p === playerA)`)
- Skips updates during dragging to prevent conflicts

**Technical Details**:
```javascript
p.addEventListener('timeupdate', () => {
    // ... logging ...

    // Update time display on each timeupdate for smoother updates
    if (segments[currentIndex] && !isDragging && usePlayerA === (p === playerA)) {
        currentTime = segments[currentIndex].start + p.currentTime;
        UI.timeDisplay.textContent = fmtTime12Hour(currentTime);
        UI.dateDisplay.textContent = fmtDate(currentTime);
    }
});
```

## Testing

- 66 regression tests passing (1 unrelated version check test outdated)
- Fixes verified against TestResult0017, TestResult0018, TestResult0019 scenarios
- Manual testing: Extended playback at live edge, time display updates continuously
- Manual testing: Live edge reload without skipping

## Files Modified

- `index.html` - 3 changes:
  1. Heartbeat condition (line 1221): Removed `!active.paused` check
  2. Live edge reload buffer validation (lines 1117-1160): Added proximity check and buffered range basis
  3. timeupdate handler (lines 1407-1418): Added UI updates for smoother display

## Installation

Copy files to `/var/www/html/noAgendaTimeMachine/`:
```bash
cp -r release/v1.5.3/* /var/www/html/noAgendaTimeMachine/
```

## Migration Notes

- No configuration changes required
- No API changes
- Drop-in replacement for v1.5.2
- All 15 features remain intact
- All previous bug fixes (Bugs 1-4) remain in place

## Known Issues

- None

## Previous Releases

- v1.5.2: Bug fix - Infinite reload loop (Bug 4 - excessive data transfer)
- v1.5.1: UI version update only
- v1.5.0: Hamburger segment list (10 new tests, 67 total)
- v1.4.3: Slider improvements (10 new tests)
- v1.4.2: Additional refinements
- v1.4.0: Feature 13 + simplification (45 tests)
- v1.3.0: Complete feature set (38 tests)
