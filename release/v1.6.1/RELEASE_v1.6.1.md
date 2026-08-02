# No Agenda Time Machine v1.6.1

**Release Date:** 2026-08-02
**Previous Version:** v1.6.0
**Test Suite:** 76 tests passing, 1 skipped

## Overview

v1.6.1 is a minor configuration release extending segment retention from 3 days to 7 days.

## Changes

- **Extended retention:** `MAX_AGE` increased from 72 hours (3 days) to 7 days (168 hours), allowing further time-shifted playback

## Files Changed

| File | Change |
|------|--------|
| `audio/recorderd.py` | `MAX_AGE = 7 * 24 * 3600` (was `72 * 3600`) |

## Test Results

```
76 passed, 1 skipped
```

No frontend changes — all regression tests remain passing.

## Upgrade Notes

1. Replace `audio/recorderd.py` on the server (or `index.html` + `audio/recorderd.py` for a full refresh)
2. Restart the recorder: `screen -r noagendarecorder` then Ctrl+C, then `./start.sh`
3. On restart, segments between 3–7 days will be preserved; segments older than 7 days cleaned up
