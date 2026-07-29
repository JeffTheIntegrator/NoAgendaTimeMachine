# Release v1.5.0 - Hamburger Segment List

**Date:** 2026-07-29

## Changes

### Features
- **Hamburger segment list**: Added hamburger button (top-right) with dropdown panel showing all segments
- **Newest-first ordering**: Segments displayed with most recent at top for easy access to latest content
- **Quick navigation**: Click any segment to seek directly to it; menu closes automatically
- **Segment info**: Each item shows start time and title (long titles truncated with ellipsis)
- **Click-outside-to-close**: Clicking outside the dropdown closes it for better UX

### Technical Details
- Hamburger button positioned absolute top-right (32px from edge, 24px from top)
- Dropdown panel: 320px wide, max 400px height, scrollable list
- Segment items: flex layout with time (monospace) + title (ellipsized)
- ARIA attributes for accessibility (aria-label, aria-expanded)
- Custom scrollbar styling for segment list
- Event handlers: segment item click, hamburger button toggle, document-level click-outside

### Testing
- 10 new Playwright tests for hamburger segment list
- All 67 regression tests passing (57 existing + 10 new)
- Manual validation completed

### Installation
Copy files to `/var/www/html/noAgendaTimeMachine/`:
```bash
cp -r release/v1.5.0/* /var/www/html/noAgendaTimeMachine/
```

### Known Issues
- None

### Migration Notes
- No configuration changes required
- Existing playlists compatible
- Audio files unchanged
- All 15 features now complete
