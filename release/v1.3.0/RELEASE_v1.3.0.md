# No Agenda Time Machine v1.3.0 Release

**Release Date:** 2026-07-11

## Summary

Version 1.3.0 completes all 12 planned features with UI/UX improvements for mobile usability, visual consistency, and live playback functionality. This release includes 5 new features building on the light theme and UI improvements from v1.2.0.

## New Features (5)

### ✅ Feature 6: Live Button
- Added "Live" button to main controls
- Navigates to live edge (30s behind actual live stream)
- `goLive()` JavaScript function for live navigation
- Distinct blue styling (`var(--link)` color)
- Play icon SVG for visual consistency

### ✅ Feature 8: White Button Text/Icons
- Changed button text/icons from gray to white for better contrast
- `.jump-btn` background changed to gold (`var(--accent)`)
- `.control-btn` background changed to gold (`var(--accent)`)
- White text (`#fff`) on all buttons for readability
- Hover states maintain white text

### ✅ Feature 9: Equal Button Sizes
- All control buttons now 64x64px (previously 48x48px)
- Previous track, play/pause, next track, and live buttons all same size
- Consistent visual hierarchy and touch targets

### ✅ Feature 10: Larger Slider Button
- Slider thumb increased from 20px to 28px
- More touch-friendly on mobile devices
- Both webkit and Firefox (moz) thumb styles updated

### ✅ Feature 12: Bug 3 Validation Complete
- Next Track button fix validated with Playwright tests
- `segIndexForTime()` iterates backwards for overlapping segments
- `nextTrack()` includes proper segment validation
- All 3 bugs fixed and validated (Bug 1, 2, 3)

## Files Changed

| File | Changes |
|------|---------|
| `index.html` | All 5 new features implemented |
| `recorderd.py` | No changes (same as v1.2.0) |
| `start.sh` | No changes (same as v1.2.0) |

## Installation

```bash
# Copy files to web server
cp -r v1.3.0/* /var/www/html/noAgendaTimeMachine/

# Or extract to target directory
tar -xzf noAgendaTimeMachine-v1.3.0.tar.gz -C /var/www/html/
```

## Configuration

No configuration changes from v1.2.0. Edit `recorderd.py` for stream settings:
- `STREAM_URL`: ICY stream URL
- `WEB_DIR`: Web root directory
- `MAX_AGE`: Segment retention (hours)
- `MAX_CHUNK_DUR`: Max segment duration (seconds)

## Known Issues

None. All bugs from previous versions remain fixed:
- ✅ Bug 1: Live Edge Stalling - FIXED
- ✅ Bug 2: Previous Track Freezing - FIXED
- ✅ Bug 3: Next Track Button - FIXED and validated

## Feature Progress

**Complete: 12/12 features**

| # | Feature | Status |
|---|---------|--------|
| 1 | Remove green bar | ✅ Complete |
| 2 | 12-hour clock format | ✅ Complete |
| 3 | Fixed segment title height | ✅ Complete (v1.2.0) |
| 4 | Prevent page zoom | ✅ Complete (v1.2.0) |
| 5 | Remove status text | ✅ Complete (v1.2.0) |
| 6 | Live button | ✅ Complete (v1.3.0) |
| 7 | Update heading | ✅ Complete (v1.2.0) |
| 8 | White button text/icons | ✅ Complete (v1.3.0) |
| 9 | Equal button sizes | ✅ Complete (v1.3.0) |
| 10 | Larger slider button | ✅ Complete (v1.3.0) |
| 11 | Match CSS formatting | ✅ Complete |
| 12 | Remaining validation | ✅ Complete (v1.3.0) |

## Regression Tests

All features validated with Playwright browser automation:

| Test File | Tests | Status |
|-----------|-------|--------|
| `feature2.spec.js` | 5 | ✅ Pass |
| `feature6.spec.js` | 7 | ✅ Pass |
| `feature8.spec.js` | 6 | ✅ Pass |
| `feature9.spec.js` | 6 | ✅ Pass |
| `feature10.spec.js` | 6 | ✅ Pass |
| `bug3.spec.js` | 8 | ✅ Pass |

**Total: 38 tests, all passing**

## Upgrade from v1.2.0

Simply replace `index.html` - no database migrations or configuration changes needed.

## Credits

- **Project:** No Agenda Time Machine
- **Version:** 1.3.0
- **Release:** 2026-07-11
- **Total Features:** 12/12 complete
- **All Bugs Fixed:** 3/3 validated
