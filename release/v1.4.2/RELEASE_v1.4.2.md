# Release v1.4.2

**Date**: 2026-07-20

## Bug Fix
- **AbortError spam fix**: Suppress "play() request interrupted by new load request" errors during rapid navigation
  - These errors are expected behavior when user clicks navigation buttons rapidly
  - Changed from error logging to debug logging for AbortError
  - Added graceful handling in `playSegment()`, `togglePlay()`, and overlay click handlers
  - Recovery attempts now ignore AbortError (only retry actual errors)

## UI Additions
- Added version number display (v1.4.2) in player footer
- Added console logging for all user interactions (buttons, timeline) with `[USER]` prefix

## Testing
- Created `abort-error.spec.js` with 3 tests for AbortError handling and user input logging
- Updated existing tests to account for new console.log in onclick handlers
- All 47 regression tests passing (1 skipped)

## Files Changed
- `validation/production/index.html` - Main fix (AbortError handling, console logging, version display)
- `test_validation/tests/abort-error.spec.js` - New test file
- `test_validation/tests/bug3.spec.js` - Updated onclick check and tolerance
- `test_validation/tests/feature6.spec.js` - Updated onclick check and tolerance

## Test Coverage
- **47 tests passing** (feature2, feature6, feature8, feature9, feature10, bug3, feature13, abort-error)
- 1 skipped (feature13 drag test - skipped by design)
