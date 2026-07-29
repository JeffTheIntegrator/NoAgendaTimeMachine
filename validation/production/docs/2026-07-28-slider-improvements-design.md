# Slider Improvements Design

**Date:** 2026-07-28
**Status:** Approved
**Version:** v1.4.3/v1.5.0

## Overview

Replace the current timestamp-based timeline slider with a segment-index-based slider. The slider will represent segment positions (0 to N-1) rather than raw Unix timestamps.

**Changes summary:**
1. **Slider**: `min/max` change from timestamp range to segment count range
2. **Title sync**: Solved via 1:1 segment mapping (no repeats)
3. **Button order**: Swap -1h and -30s positions
4. **Time labels**: Remove start/end labels below timeline

**Key files modified:**
- `validation/production/index.html` (lines ~340-1055)

---

## Component Changes

### 2.1 HTML Changes

**Remove time labels (lines ~342-345):**
```html
<!-- REMOVE THIS SECTION -->
<div class="time-labels">
    <span id="start-time">--:--</span>
    <span id="end-time">--:--</span>
</div>
```

**Swap button order (lines ~347-354):**
```html
<!-- BEFORE -->
<button class="jump-btn" onclick="skip(-3600)">-1h</button>
<button class="jump-btn" onclick="skip(-600)">-10m</button>
<button class="jump-btn" onclick="skip(-30)">-30s</button>
...

<!-- AFTER -->
<button class="jump-btn" onclick="skip(-30)">-30s</button>
<button class="jump-btn" onclick="skip(-600)">-10m</button>
<button class="jump-btn" onclick="skip(-3600)">-1h</button>
...
```

### 2.2 CSS Changes

**Remove time-labels CSS (lines ~97-105):**
```css
/* REMOVE .time-labels styling */
```

### 2.3 JavaScript Changes

**Update `updateTimeline()` function (~lines 1011-1017):**
```javascript
function updateTimeline() {
    if (!segments.length) return;
    // BEFORE: UI.timeline.min = segments[0].start;
    //        UI.timeline.max = segments[segments.length - 1].end;

    // AFTER: Use segment indices
    UI.timeline.min = 0;
    UI.timeline.max = segments.length - 1;

    // Remove time label updates:
    // UI.startTime.textContent = fmtTime12Hour(segments[0].start);
    // UI.endTime.textContent = fmtTime12Hour(segments[segments.length - 1].end);
}
```

**Update timeline event handlers (~lines 1036-1054):**

*Input handler (drag):*
```javascript
UI.timeline.addEventListener('input', (e) => {
    isDragging = true;
    const segIndex = parseInt(e.target.value);  // Segment index, not timestamp
    if (segments[segIndex]) {
        const seg = segments[segIndex];
        UI.timeDisplay.textContent = fmtTime12Hour(seg.start);
        UI.dateDisplay.textContent = fmtDate(seg.start);
        UI.trackTitle.textContent = seg.title || 'No Agenda Stream';
        currentTime = seg.start;  // Track the timestamp
    }
});
```

*Change handler (release):*
```javascript
UI.timeline.addEventListener('change', (e) => {
    const segIndex = parseInt(e.target.value);
    isDragging = false;
    if (segments[segIndex]) {
        seekToTime(segments[segIndex].start);
    }
});
```

**Update heartbeat timer (~lines 1020-1031):**
```javascript
// Update slider position based on current segment
if (!active.paused && segments[currentIndex]) {
    currentTime = segments[currentIndex].start + active.currentTime;
    if (!isDragging) {
        UI.timeline.value = currentIndex;  // Segment index, not timestamp
        UI.timeDisplay.textContent = fmtTime12Hour(currentTime);
        UI.dateDisplay.textContent = fmtDate(currentTime);
    }
}
```

**Clean up unused DOM references:**
```javascript
// Remove from UI object (~lines 426-437):
// startTime: document.getElementById('start-time'),
// endTime: document.getElementById('end-time'),
```

---

## Data Flow Changes

### 3.1 Slider Value Flow

**Before (timestamp-based):**
```
Slider value → Unix timestamp → segIndexForTime() → segment
Range: [first_segment.start, last_segment.end]
Example: [1720000000, 1720288800] (72 hours = ~259,200 seconds)
```

**After (index-based):**
```
Slider value → Segment index → segment[index] → timestamp
Range: [0, segment_count - 1]
Example: [0, 199] (200 segments)
```

### 3.2 State Synchronization

| State Variable | Before | After |
|----------------|--------|-------|
| `UI.timeline.value` | Timestamp (seconds) | Segment index (integer) |
| `currentTime` | Timestamp (seconds) | Timestamp (seconds) — unchanged |
| `currentIndex` | Computed via `segIndexForTime()` | Directly from slider value |

### 3.3 Event Flow

**Drag interaction:**
```
User drags → input event → slider value changes (0 to N-1)
  → Look up segment by index
  → Update time display (seg.start)
  → Update title (seg.title)
  → Update currentTime for continuity
```

**Release interaction:**
```
User releases → change event → slider value finalizes
  → seekToTime(segment[start])
  → Loads audio at segment start
```

---

## Testing Strategy

### 4.1 Playwright Test Cases

Create `test_validation/tests/slider-improvements.spec.js`:

| Test | Description | Expected Result |
|------|-------------|-----------------|
| 1. Segment slider range | Verify slider `min=0`, `max=segments.length-1` | Correct range |
| 2. Drag updates title | Drag slider across 5+ positions | Title updates per segment, no repeats |
| 3. Drag updates time | Drag slider across positions | Time shows segment start times |
| 4. Release seeks correctly | Release slider at position | Audio plays at segment start |
| 5. Button order | Verify jump button order | `-30s, -10m, -1h, +30s, +10m, +1h` |
| 6. Time labels removed | Verify no time labels below timeline | Elements not present |
| 7. Playback continuity | Play for 2 minutes, monitor audio | **No jumps or stops** |
| 8. Live button then slider | Go Live, then drag slider | Correct navigation |
| 9. All segments accessible | Drag from first to last segment | All segments reachable |
| 10. Rapid drag behavior | Drag quickly across timeline | No lag, title updates correctly |

### 4.2 Enhanced Audio Stress Testing

**Critical playback validation sequence:**

1. **Test 7**: Play for 2 minutes → Listen for jumps/stops
2. **Test 8**: Live button → slider interaction
3. **Test 7 (repeat)**: Play for 2 minutes → Listen for jumps/stops
4. **Test 10**: Rapid drag test
5. **Test 7 (repeat)**: Play for 2 minutes → Listen for jumps/stops
6. **Test 10**: Rapid drag test
7. **Test 7 (repeat)**: Play for 2 minutes → Listen for jumps/stops
8. **Test 10**: Rapid drag test
9. **Test 7 (repeat)**: Play for 2 minutes → Listen for jumps/stops
10. **Test 10**: Rapid drag test
11. **Test 7 (repeat)**: Play for 2 minutes → Listen for jumps/stops

**Total:** 5 rapid drag tests + 6 playback continuity tests (interleaved)

This stress tests:
- Audio stability after UI interactions
- Recovery from rapid state changes
- Player switching under stress
- Buffer behavior after drag operations

### 4.3 Manual Testing

- Test on mobile device (touch interaction)
- Test with various segment counts (small/large playlists)
- Test with overlapping timestamp segments
- Test with varying segment durations

### 4.4 Regression Testing

Run existing 45 tests to ensure no breakage:
```bash
npx playwright test --reporter=list
```

---

## Implementation Phases

### Phase 1: Preparation & Backup
- Create backup of current `index.html`
- Read current slider implementation for reference
- Identify all touch points for modification

### Phase 2: HTML Structure Changes
- Remove time-labels HTML section
- Reorder jump buttons (-30s, -10m, -1h, +30s, +10m, +1h)
- Verify button onclick handlers remain intact

### Phase 3: CSS Cleanup
- Remove `.time-labels` CSS styling
- Verify no other styles depend on time-labels

### Phase 4: JavaScript Core Changes
- Update `updateTimeline()` to use segment indices (min=0, max=N-1)
- Update timeline `input` event handler (drag)
- Update timeline `change` event handler (release)
- Remove UI.startTime/UI.endTime references

### Phase 5: State Synchronization
- Update heartbeat timer to set slider value to `currentIndex`
- Ensure `currentTime` continues tracking actual timestamp
- Verify player switching still works correctly

### Phase 6: Testing Infrastructure
- Create `test_validation/tests/slider-improvements.spec.js`
- Add 10 new test cases
- Implement audio monitoring for jumps/stops

### Phase 7: Local Validation
- Serve HTML via `python3 -m http.server 8081`
- Manual testing: drag slider, verify title/time updates
- Manual testing: verify button order
- Manual testing: 2-minute playback check

### Phase 8: Automated Testing
- Run new slider-improvements tests
- Run full regression suite (45 existing tests)
- Fix any failures

### Phase 9: Documentation Update
- Update CLAUDE.md with new feature details
- Update version to v1.4.3 or v1.5.0
- Update release notes

### Phase 10: Release Package
- Create `release/v1.4.3/` or `release/v1.5.0/`
- Copy `index.html`, `recorderd.py`, `start.sh`
- Create RELEASE notes
- Git commit

---

## Design Self-Review

- **No placeholders found** — All sections are complete
- **Internal consistency verified** — Data flow matches component changes
- **Scope appropriate** — Single cohesive feature set, well-bounded
- **No ambiguity** — Each change is specific and actionable

---

## Approval History

- 2026-07-28: Design approved via brainstorming skill
- All 5 sections reviewed and approved by user
