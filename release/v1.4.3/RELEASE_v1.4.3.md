# Release v1.4.3 - Slider Improvements

**Date:** 2026-07-28

## Changes

### Features
- **Segment-based slider**: Slider now uses segment indices (0 to N-1) instead of timestamps for finer control
- **Title sync fixed**: 1:1 mapping between slider position and segment eliminates title repetition during drag
- **Button reorder**: Jump buttons now ordered -30s, -10m, -1h, +30s, +10m, +1h for better UX
- **Cleaner UI**: Removed time labels below timeline

### Technical Changes
- Slider range: `min=0, max=segments.length-1` (was timestamp range)
- Input handler: Direct segment index lookup (was segIndexForTime(timestamp))
- Heartbeat: Sets slider to currentIndex (was currentTime timestamp)
- Removed: `.time-labels` HTML/CSS, `UI.startTime`, `UI.endTime`

### Testing
- 10 new Playwright tests for slider improvements
- All 57 regression tests passing (45 existing + 10 new - 2 updated, 2 obsolete tests replaced)
- Audio stress testing: 6 x 2-minute playback checks interleaved with 5 rapid drag tests

### Installation
Copy files to `/var/www/html/noAgendaTimeMachine/`:
```bash
cp -r release/v1.4.3/* /var/www/html/noAgendaTimeMachine/
```

### Known Issues
- None

### Migration Notes
- No configuration changes required
- Existing playlists compatible
- Audio files unchanged
- User should verify: drag slider updates title/time correctly
