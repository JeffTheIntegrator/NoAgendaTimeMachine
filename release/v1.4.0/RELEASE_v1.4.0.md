# No Agenda Time Machine v1.4.0 Release

**Release Date:** 2026-07-12

## Summary

Version 1.4.0 adds Feature #13 (slider drag title preview) and simplifies the project's file structure by consolidating 3 live copies of `index.html` into 1 canonical source plus a symlink for tests. Same consolidation applied to Python recorder and launcher scripts.

## New in v1.4.0

### ✅ Feature #13: Slider Drag Updates Title

- As the timeline slider is dragged, the track title now updates in real-time to show the title of the segment at the dragged position
- Implementation: 3 lines added to `input` event handler:
  ```js
  const dragIdx = segIndexForTime(time);
  if (segments[dragIdx]) {
      UI.trackTitle.textContent = segments[dragIdx].title || 'No Agenda Stream';
  }
  ```
- Reuses existing `segIndexForTime()` (backwards iteration for overlapping timestamps)
- Guard `if (segments[dragIdx])` prevents crash when segments array is empty
- Time/date display continues updating during drag (existing behavior preserved)
- Validated with 7 new Playwright tests (feature13.spec.js)
- Does not trigger seek during drag — seek happens only on `change` (release)

### ✅ Simplification S1/S2: Consolidate File Copies

**Before v1.4.0:**
- 3 live copies of `index.html`: `validation/index.html`, `validation/production/index.html`, `test_validation/index.html` (all identical, must be kept in sync manually)
- 2 copies of Python recorder: `validation/noAgendaTimeMachine.py` vs `validation/production/audio/recorderd.py` (identical content, different names)
- 2 copies of `start.sh`: `validation/start.sh` vs `validation/production/audio/start.sh` (identical, but referenced wrong script name)

**After v1.4.0:**
- 1 canonical live source: `validation/production/` directory
  - `validation/production/index.html` - THE frontend file
  - `validation/production/audio/recorderd.py` - THE recorder
  - `validation/production/audio/start.sh` - THE launcher (fixed to reference `recorderd.py`)
- `test_validation/index.html` - symlink → `../validation/production/index.html` (so tests always test canonical)
- Release artifacts (`release/v1.*/`) remain frozen, not touched
- Removed: `validation/index.html`, `validation/noAgendaTimeMachine.py`, `validation/start.sh`

**Bug fixed as part of S2:** `start.sh` referenced `noAgendaTimeMachine.py` but canonical file is `recorderd.py`. Fixed in v1.4.0 canonical.

## Files Changed

| File | Changes |
|------|---------|
| `index.html` | Added Feature #13: title preview during slider drag |
| `recorderd.py` | No changes (same as v1.3.0) |
| `start.sh` | Fixed PYTHON_SCRIPT to reference `recorderd.py` (was `noAgendaTimeMachine.py`) |

## Installation

```bash
# Copy files to web server (full package)
cp -r v1.4.0/* /var/www/html/noAgendaTimeMachine/

# Or just update index.html for Feature #13
cp v1.4.0/index.html /var/www/html/noAgendaTimeMachine/index.html

# Or extract to target directory
tar -xzf noAgendaTimeMachine-v1.4.0.tar.gz -C /var/www/html/
```

## Configuration

No configuration changes from v1.3.0. Edit `recorderd.py` for stream settings:
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

**Complete: 13/14 features (S1/S2 simplification also complete)**

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
| 13 | Slider drag updates title | ✅ Complete (v1.4.0) |
| 14 | Hamburger segment list | ⏳ Pending |

**Simplification:**

| # | Task | Status |
|---|------|--------|
| S1 | Consolidate index.html copies (3 → 1 + symlink) | ✅ Complete (v1.4.0) |
| S2 | Consolidate Python/start.sh copies | ✅ Complete (v1.4.0) |

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
| `feature13.spec.js` | 7 | ✅ Pass |

**Total: 45 tests, all passing**

## Upgrade from v1.3.0

- **Minimal upgrade:** Replace `index.html` only (Feature #13)
- **Full upgrade:** Replace entire package (includes start.sh fix)
- No database migrations or configuration changes needed
- If you have local modifications to `start.sh` that reference `noAgendaTimeMachine.py`, update to `recorderd.py`

## Credits

- **Project:** No Agenda Time Machine
- **Version:** 1.4.0
- **Release:** 2026-07-12
- **Features:** 13/14 complete + S1/S2 simplification
- **All Bugs Fixed:** 3/3 validated
- **Tests:** 45 Playwright tests, all passing
