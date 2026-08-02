# No Agenda Time Machine v1.6.0

**Release Date:** 2026-08-02
**Previous Version:** v1.5.4
**Test Suite:** 76 tests passing, 1 skipped

## Overview

v1.6.0 is a comprehensive quality and security release addressing findings from a full code review. It includes 5 phases of fixes: XSS security hardening, user-visible error feedback, adaptive polling, accessibility improvements, code cleanup, and Python recorder reliability fixes.

## Changes

### Phase 1: XSS Security Fix (Critical)
- **Replaced `innerHTML` with DOM API** in `renderSegmentList()` — all segment items now built with `createElement()` and `textContent`, eliminating XSS vector where malicious stream metadata could inject JavaScript
- Added 4 Playwright security tests (`code-review-xss.spec.js`)

### Phase 2: User-Visible Error Feedback & DOM Efficiency
- **Status indicator**: New `setStatus()` function shows error/recovery/buffering messages below the track title (with `aria-live="polite"` for screen readers)
- **Efficient DOM rebuilds**: `renderSegmentList()` now tracks `lastGeneratedAt` — only rebuilds when playlist content actually changes, not on every poll
- **Preload optimization**: Inactive player uses `preload='metadata'` (bandwidth-saving); switches to `preload='auto'` only when becoming the active player

### Phase 3: Adaptive Polling, Accessibility & Correctness
- **Adaptive playlist polling**: Polling interval scales from 5s → 10s → 30s → 60s when playlist is unchanged, reducing server load
- **Accessibility**: ARIA labels on all transport buttons, keyboard navigation for segment list (Enter/Space to select, Escape to close with focus return), `aria-valuetext` on slider, `role="option"` on segment items
- **`isPlaying` correctness**: Changed from a tracked variable to a derived function — reads `active.paused`/`active.ended`/`active.src` directly, eliminating desync bugs
- **Same-segment seek optimization**: Avoids unnecessary player switch (A↔B) when seeking within the same segment
- **Buffering status**: "Buffering..." status shown on stall events
- **Buffer retry limiting**: `liveBufferRetryCount` prevents infinite recursive reloads from `handleEnded`

### Phase 4: Code Cleanup & Polish
- **Event handler cleanup**: Inline `onclick` handlers on all buttons replaced with DOM event listeners (`addEventListener`), improving Content Security Policy compatibility
- **Deduplicated recovery logic**: Shared `attemptRecovery()` function replaces duplicated recovery code in `onerror` and `onloadedmetadata` handlers
- **Map-based recovery tracking**: `recoveryCounts` Map replaces `player.recoveryCount` property attachment
- **Removed dead code**: Unused `fmtTime()` function removed
- **Throttled progress logging**: Buffer progress log capped at once per second
- **Fixed typo**: "可能" → "possible" in stall log message

### Phase 5: Python Recorder Reliability
- **Fixed reconnection gap logic**: Uses actual elapsed wall-clock time (`time.time() - current_start`) instead of theoretical retry delay to decide whether to close or keep a segment open
- **Fixed file descriptor leak**: `current_file.close()` called on reconnect retry, preventing FD exhaustion during extended outages
- **Improved logging**: Gap duration now included in segment close/keep log messages

## Files Changed

| File | Lines Changed |
|------|---------------|
| `index.html` | +174 / -148 (rewrite) |
| `audio/recorderd.py` | +10 / -4 |

## Test Results

```
76 passed, 1 skipped (57.7s)
```

- 8 test files, 77 tests total
- Includes 4 new XSS security tests
- All regression tests passing

## Upgrade Notes

1. Replace `index.html` and `audio/recorderd.py` on the server
2. Restart the recorder: `screen -r noagendarecorder` then Ctrl+C, then `./start.sh`
3. No database or config changes required

## Security

- **XSS**: Segment titles rendered via `textContent` instead of `innerHTML` — no script injection possible even with malicious ICY metadata
- **CSP**: Inline event handlers (`onclick=`) removed, enabling stricter Content Security Policy headers
