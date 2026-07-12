# No Agenda Time Machine v1.2.0 Release

**Release Date:** 2026-07-11

## Summary

Version 1.2.0 adds UI/UX improvements for mobile usability and visual consistency. This release includes 4 new features building on the light theme introduced in v1.1.0.

## New Features (4)

### ✅ Feature 3: Fixed Segment Title Height
- Reserved 3 rows of space for track titles
- Added line clamping to truncate long titles at 3 lines
- Prevents buttons from shifting when title length changes
- CSS: `min-height: 72px`, `-webkit-line-clamp: 3`

### ✅ Feature 4: Prevent Page Zoom
- Fixed viewport meta tag (removed duplicate "name" attribute)
- Added `maximum-scale=1.0, user-scalable=no` to prevent zoom
- Added `touch-action: manipulation` to `.player-card` for button interactions
- Added `touch-action: pan-y` to `body` to allow vertical scroll only
- Prevents accidental zoom on double-tap, especially on mobile devices

### ✅ Feature 5: Remove Status Text
- Removed "Playing"/"Paused" text below track title
- Cleaned up UI object, removed all `UI.status` references
- Simplified `updateUI()` function

### ✅ Feature 7: Update Heading
- Changed header from "No Agenda DVR" to "No Agenda Time Machine"
- Consistent branding across title tag and logo element

## Files Changed

| File | Changes |
|------|---------|
| `index.html` | CSS updates, removed status element, heading text |
| `recorderd.py` | No changes (same as v1.1.0) |
| `start.sh` | No changes (same as v1.1.0) |

## Installation

```bash
# Copy files to web server
cp -r v1.2.0/* /var/www/html/noAgendaTimeMachine/

# Or extract to target directory
tar -xzf noAgendaTimeMachine-v1.2.0.tar.gz -C /var/www/html/
```

## Configuration

No configuration changes from v1.1.0. Edit `recorderd.py` for stream settings:
- `STREAM_URL`: ICY stream URL
- `WEB_DIR`: Web root directory
- `MAX_AGE`: Segment retention (hours)
- `MAX_CHUNK_DUR`: Max segment duration (seconds)

## Known Issues

None. All bugs from v1.1.0 remain fixed:
- ✅ Bug 1: Live Edge Stalling - FIXED
- ✅ Bug 2: Previous Track Freezing - FIXED
- ✅ Bug 3: Next Track Button - FIXED

## Feature Progress

**Completed: 7/12 features**

| # | Feature | Status |
|---|---------|--------|
| 1 | Remove green bar | ✅ Complete |
| 2 | 12-hour clock format | ✅ Complete |
| 3 | Fixed segment title height | ✅ Complete (v1.2.0) |
| 4 | Prevent page zoom | ✅ Complete (v1.2.0) |
| 5 | Remove status text | ✅ Complete (v1.2.0) |
| 6 | Live button | ⏳ Pending |
| 7 | Update heading | ✅ Complete (v1.2.0) |
| 8 | White button text/icons | ⏳ Pending |
| 9 | Equal button sizes | ⏳ Pending |
| 10 | Larger slider button | ⏳ Pending |
| 11 | Match CSS formatting | ✅ Complete |
| 12 | Remaining validation | ⏳ Pending |

## Upgrade from v1.1.0

Simply replace `index.html` - no database migrations or configuration changes needed.

## Credits

- **Project:** No Agenda Time Machine
- **Version:** 1.2.0
- **Release:** 2026-07-11
