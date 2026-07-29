# Release v1.5.2 - Bug Fix: Infinite Reload Loop (Excessive Data Transfer)

**Date:** 2026-07-29

## Bug Fixes

### Fixed: Infinite Reload Loop Causing Excessive Data Transfer

**Issue**: After navigating via the hamburger menu to select a segment, the inactive player would continuously reload the same audio file in an infinite loop. This caused data transfer rates of 130MB/s instead of the expected 20KB/s stream rate.

**Observed Behavior**:
- User clicks hamburger menu and selects a segment
- Player switches from playerA to playerB (or vice versa)
- The inactive player enters infinite loop: LOAD_START → METADATA_LOADED → "Play aborted by new load request" → repeat
- Same audio file downloaded repeatedly

**Root Cause**:
- `playSegment()` sets up event handlers (`onloadedmetadata`, `onerror`) on the active player
- These handlers capture `index`, `offset`, `shouldPlay` in their closure
- When user switches players via hamburger menu, the inactive player's event handlers are **NOT cleared**
- `preloadNext()` is called after the active player's metadata loads
- `preloadNext()` sets `inactivePlayer.src = nextSegment.url` to preload the next segment
- **Setting src triggers the inactive player's OLD `onloadedmetadata` handler**
- That stale handler calls `playSegment()` with **OLD closure values** (previous segment index/offset)
- Each call creates NEW event handlers → infinite loop
- Browser aborts previous play() requests, logged as "Play aborted by new load request"

**Example sequence**:
1. PlayerA was playing segment 117 (live segment) with event handlers attached
2. User clicked hamburger and selected segment 111
3. `switchPlayer()` toggled to playerB
4. `playSegment(111, ...)` set up new handlers on playerB
5. PlayerA's old handlers were STILL ATTACHED (never cleared)
6. PlayerB's metadata loaded → `preloadNext()` called
7. `preloadNext()` set `playerA.src = segments[112].url`
8. **This triggered playerA's stale `onloadedmetadata` handler**
9. That handler called `playSegment()` with OLD closure values
10. Infinite loop began

**Fix**:
- Clear event handlers (`onloadedmetadata`, `onerror`) on BOTH players when switching
- Clear pending metadata timeouts when switching players
- Track timeouts per player to prevent orphaned callbacks
- This ensures `preloadNext()` cannot trigger stale callbacks

**Technical Details**:
```javascript
const switchPlayer = () => {
    usePlayerA = !usePlayerA;

    // Clear pending timeouts
    if (playerATimeout) {
        clearTimeout(playerATimeout);
        playerATimeout = null;
    }
    if (playerBTimeout) {
        clearTimeout(playerBTimeout);
        playerBTimeout = null;
    }

    // Clear event handlers on BOTH players (THE FIX)
    playerA.onloadedmetadata = null;
    playerA.onerror = null;
    playerB.onloadedmetadata = null;
    playerB.onerror = null;

    return getActive();
};
```

**Testing**:
- 67 regression tests passing
- Fix verified against TestResult0015 (infinite reload loop scenario)
- Manual testing: Navigate via hamburger menu, verify no repeated downloads in DevTools Network tab

**Impact**:
- Data transfer rate returns to normal ~20KB/s stream rate
- No more infinite reload loops after hamburger navigation
- Player switching properly cleans up all callbacks (handlers + timeouts)

## Installation

Copy files to `/var/www/html/noAgendaTimeMachine/`:
```bash
cp -r release/v1.5.2/* /var/www/html/noAgendaTimeMachine/
```

## Migration Notes

- No configuration changes required
- No API changes
- Drop-in replacement for v1.5.1
- All 15 features remain intact

## Known Issues

- None

## Previous Releases

- v1.5.1: UI version update only (fix was in release folder but not committed)
- v1.5.0: Hamburger segment list (10 new tests, 67 total)
- v1.4.3: Slider improvements (10 new tests)
- v1.4.2: Additional refinements
- v1.4.0: Feature 13 + simplification (45 tests)
- v1.3.0: Complete feature set (38 tests)
