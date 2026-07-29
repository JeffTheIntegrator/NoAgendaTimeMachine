# Hamburger Segment List Design

**Date:** 2026-07-29
**Status:** Approved
**Version:** v1.5.0

## Overview

Add a hamburger button in the top-right corner of the player card. When clicked, a dropdown menu appears showing a scrollable list of segments ordered newest first. Each item displays the segment start time and title. Tapping a segment seeks to it and closes the menu.

**Components:**
- Hamburger button (top-right, opposite logo)
- Dropdown panel with scrollable segment list
- Segment items with time + title

---

## Component Changes

### 2.1 HTML Changes

**Add hamburger button in header (after logo div):**
```html
<div class="header">
    <div class="logo">No Agenda Time Machine</div>
    <button class="hamburger-btn" id="hamburger-btn" aria-label="Segment list">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
    </button>
</div>
```

**Add segment dropdown panel (after header, before time-display):**
```html
<div class="segment-dropdown" id="segment-dropdown">
    <div class="segment-list" id="segment-list">
        <!-- Segments populated by JavaScript -->
    </div>
</div>
```

### 2.2 CSS Changes

**Hamburger button styling:**
```css
.hamburger-btn {
    position: absolute;
    top: 24px;
    right: 32px;
    background: transparent;
    border: none;
    color: var(--accent);
    cursor: pointer;
    padding: 8px;
    transition: color 0.15s ease;
}

.hamburger-btn:hover {
    color: var(--link);
}
```

**Dropdown panel styling:**
```css
.segment-dropdown {
    position: absolute;
    top: 60px;
    right: 32px;
    width: 320px;
    max-height: 400px;
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: none;
    z-index: 50;
}

.segment-dropdown.show {
    display: block;
}

.segment-list {
    max-height: 380px;
    overflow-y: auto;
    padding: 8px;
}

.segment-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s ease;
}

.segment-item:hover {
    background: #f5f5f5;
}

.segment-item-time {
    font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    color: var(--text-muted);
    min-width: 60px;
}

.segment-item-title {
    font-size: 14px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}
```

### 2.3 JavaScript Changes

**New DOM elements:**
```javascript
const UI = {
    // ... existing elements ...
    hamburgerBtn: document.getElementById('hamburger-btn'),
    segmentDropdown: document.getElementById('segment-dropdown'),
    segmentList: document.getElementById('segment-list'),
};
```

**Toggle dropdown function:**
```javascript
function toggleSegmentList() {
    UI.segmentDropdown.classList.toggle('show');
    const isVisible = UI.segmentDropdown.classList.contains('show');
    UI.hamburgerBtn.setAttribute('aria-expanded', isVisible);
}
```

**Render segment list (newest first):**
```javascript
function renderSegmentList() {
    if (!segments.length) {
        UI.segmentList.innerHTML = '<div class="segment-item">No segments available</div>';
        return;
    }

    // Create items in reverse order (newest first)
    const items = segments.slice().reverse().map((seg, idx) => {
        const originalIndex = segments.length - 1 - idx;
        return `
            <div class="segment-item" data-index="${originalIndex}">
                <span class="segment-item-time">${fmtTime12Hour(seg.start).split(' ')[0]}</span>
                <span class="segment-item-title">${seg.title || 'No Agenda Stream'}</span>
            </div>
        `;
    }).join('');

    UI.segmentList.innerHTML = items;
}
```

**Segment click handler:**
```javascript
function setupSegmentListHandlers() {
    UI.segmentList.addEventListener('click', (e) => {
        const item = e.target.closest('.segment-item');
        if (!item) return;

        const index = parseInt(item.dataset.index);
        if (segments[index]) {
            seekToTime(segments[index].start);
            toggleSegmentList(); // Close menu
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!UI.segmentDropdown.contains(e.target) && !UI.hamburgerBtn.contains(e.target)) {
            UI.segmentDropdown.classList.remove('show');
            UI.hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });
}
```

**Integration points:**
- Call `renderSegmentList()` after `fetchPlaylist()` updates segments
- Call `setupSegmentListHandlers()` in `init()`
- Add click listener to `UI.hamburgerBtn` for `toggleSegmentList()`

---

## Data Flow

### 3.1 Dropdown Toggle Flow
```
User clicks hamburger → toggleSegmentList()
  → Toggle 'show' class on dropdown
  → Update aria-expanded attribute
```

### 3.2 Segment List Population Flow
```
fetchPlaylist() completes → segments array updated
  → renderSegmentList() called
  → Create items from segments (reversed for newest first)
  → innerHTML set on segmentList element
```

### 3.3 Segment Selection Flow
```
User clicks segment item → click handler
  → Get data-index attribute
  → seekToTime(segments[index].start)
  → toggleSegmentList() to close dropdown
  → Playback begins at segment start
```

### 3.4 State Variables

| Variable | Purpose |
|-----------|---------|
| `segments` | Source array (reversed for display) |
| `UI.segmentDropdown` | Dropdown panel DOM element |
| `UI.hamburgerBtn` | Hamburger button DOM element |
| `UI.segmentList` | Scrollable list container |

---

## Testing Strategy

### 4.1 Playwright Test Cases

Create `test_validation/tests/feature14.spec.js`:

| Test | Description | Expected Result |
|------|-------------|-----------------|
| 1. Hamburger button exists | Verify button is present in header | Button with correct class/icon |
| 2. Button position | Verify top-right placement | Correct CSS positioning |
| 3. Dropdown opens on click | Click button → dropdown appears | 'show' class added |
| 4. Dropdown closes on second click | Click twice → toggle behavior | 'show' class removed |
| 5. Segment list populated | Verify segments displayed | Items match segments array |
| 6. Newest first ordering | Verify list order | First item = last segment |
| 7. Segment click seeks | Click item → playback seeks | seekToTime called with correct time |
| 8. Dropdown closes on selection | Click item → menu closes | 'show' class removed |
| 9. Click outside closes | Click outside → menu closes | 'show' class removed |
| 10. Scrollable list | With many segments, list scrolls | max-height CSS works |

### 4.2 Manual Testing

- Test on mobile device (touch interaction)
- Test with large playlist (100+ segments)
- Test scrolling behavior
- Test with very long titles (ellipsis behavior)
- Test accessibility (keyboard navigation, aria attributes)

### 4.3 Regression Testing

Run existing 57 tests + 10 new = 67 total tests:
```bash
npx playwright test --reporter=list
```

---

## Implementation Phases

### Phase 1: Preparation & Backup
- Create backup of current `index.html`
- Review current header structure
- Identify insertion points for new elements

### Phase 2: HTML Structure Changes
- Add hamburger button to header
- Add segment dropdown panel after header
- Verify HTML structure is valid

### Phase 3: CSS Styling
- Add hamburger button styles
- Add dropdown panel styles
- Add segment list and item styles
- Ensure proper z-index layering

### Phase 4: JavaScript Core Changes
- Add UI element references (hamburgerBtn, segmentDropdown, segmentList)
- Implement `toggleSegmentList()` function
- Implement `renderSegmentList()` function
- Implement segment click handler

### Phase 5: Event Listeners
- Add hamburger button click listener
- Add document click listener (close on outside click)
- Add segment list click delegation

### Phase 6: Integration
- Call `renderSegmentList()` after `fetchPlaylist()`
- Call `setupSegmentListHandlers()` in `init()`
- Test dropdown opens/closes correctly

### Phase 7: Testing Infrastructure
- Create `test_validation/tests/feature14.spec.js`
- Add 10 test cases
- Implement test helpers

### Phase 8: Local Validation
- Serve HTML via HTTP server
- Manual testing: hamburger button, dropdown, segment selection
- Verify newest-first ordering
- Test scrolling with many segments

### Phase 9: Automated Testing
- Run new feature14 tests
- Run full regression suite (67 total tests)
- Fix any failures

### Phase 10: Documentation & Release
- Update CLAUDE.md with Feature #14 complete
- Update version to v1.5.0
- Update TODO.md
- Create release package
- Git tag v1.5.0

---

## Design Self-Review

- **No placeholders found** — All sections are complete
- **Internal consistency verified** — Data flow matches component changes
- **Scope appropriate** — Single cohesive feature, well-bounded
- **No ambiguity** — Each change is specific and actionable

---

## Approval History

- 2026-07-29: Design approved via brainstorming skill
- All 5 sections reviewed and approved by user
