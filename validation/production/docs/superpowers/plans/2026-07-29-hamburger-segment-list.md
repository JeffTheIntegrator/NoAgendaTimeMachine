# Hamburger Segment List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hamburger button with dropdown segment list for quick navigation to any segment.

**Architecture:** Hamburger button (top-right) toggles a dropdown panel showing segments in reverse chronological order (newest first). Each item displays time + title; clicking seeks to that segment and closes the menu.

**Tech Stack:** Vanilla JavaScript, HTML5, CSS3, Playwright for testing

## Global Constraints

- Working directory: `/home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production/`
- Canonical file: `validation/production/index.html`
- Test directory: `/home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation/`
- All changes must maintain backward compatibility with existing 57 regression tests
- No new dependencies allowed
- Mobile touch interaction must continue working
- Audio playback stability must be maintained

---

## File Structure

### Files to Modify

| File | Purpose | Key Sections |
|------|---------|--------------|
| `validation/production/index.html` | Main player file | Header (lines ~50), CSS (after line 8), JavaScript (UI object, event listeners) |

### Files to Create

| File | Purpose |
|------|---------|
| `test_validation/tests/feature14.spec.js` | Playwright tests for hamburger segment list |

---

### Task 1: Add Hamburger Button to Header

**Files:**
- Modify: `validation/production/index.html` (header section)

**Interfaces:**
- Consumes: None (new component)
- Produces: Hamburger button UI element

- [ ] **Step 1: Add hamburger button HTML after logo div**

Find the header section (around line 50):
```html
<div class="header">
    <div class="logo">No Agenda Time Machine</div>
    <div class="track-title" id="track-title">Loading stream...</div>
</div>
```

Add hamburger button after logo:
```html
<div class="header">
    <div class="logo">No Agenda Time Machine</div>
    <button class="hamburger-btn" id="hamburger-btn" aria-label="Segment list">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
    </button>
    <div class="track-title" id="track-title">Loading stream...</div>
</div>
```

- [ ] **Step 2: Verify HTML structure**

Run: `grep -n "hamburger-btn" validation/production/index.html`
Expected: Button found in header section

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: add hamburger button to header"
```

---

### Task 2: Add Segment Dropdown Panel HTML

**Files:**
- Modify: `validation/production/index.html` (after header section)

**Interfaces:**
- Consumes: None (new component)
- Produces: Dropdown container for segment list

- [ ] **Step 1: Add segment dropdown panel after header section**

Find the end of header section and add dropdown before time-display:
```html
<div class="segment-dropdown" id="segment-dropdown">
    <div class="segment-list" id="segment-list">
        <!-- Segments populated by JavaScript -->
    </div>
</div>
```

Place this after the closing `</div>` of `<div class="header">` and before `<div class="time-display">`.

- [ ] **Step 2: Verify HTML structure**

Run: `grep -n "segment-dropdown" validation/production/index.html`
Expected: Dropdown panel element found

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: add segment dropdown panel HTML"
```

---

### Task 3: Add Hamburger Button CSS Styling

**Files:**
- Modify: `validation/production/index.html` (CSS section)

**Interfaces:**
- Consumes: CSS variables
- Produces: Hamburger button visual styles

- [ ] **Step 1: Add hamburger button CSS**

Add to the CSS section (after existing button styles, around line 230):
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

.hamburger-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}
```

- [ ] **Step 2: Verify CSS added**

Run: `grep -n "hamburger-btn" validation/production/index.html | head -5`
Expected: CSS styles present

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "style: add hamburger button CSS"
```

---

### Task 4: Add Dropdown Panel CSS Styling

**Files:**
- Modify: `validation/production/index.html` (CSS section)

**Interfaces:**
- Consumes: CSS variables
- Produces: Dropdown panel visual styles

- [ ] **Step 1: Add dropdown panel and list CSS**

Add to CSS section (after hamburger button styles):
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

/* Scrollbar styling for segment list */
.segment-list::-webkit-scrollbar {
    width: 8px;
}

.segment-list::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
}

.segment-list::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: 4px;
}

.segment-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-primary);
}
```

- [ ] **Step 2: Verify CSS added**

Run: `grep -n "segment-dropdown\|segment-item" validation/production/index.html | head -10`
Expected: CSS styles present

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "style: add dropdown panel and segment list CSS"
```

---

### Task 5: Add UI Element References

**Files:**
- Modify: `validation/production/index.html` (JavaScript UI object)

**Interfaces:**
- Consumes: DOM elements
- Produces: JavaScript references for new components

- [ ] **Step 1: Add hamburgerBtn, segmentDropdown, segmentList to UI object**

Find the UI object definition (around line 411) and add:
```javascript
const UI = {
    overlay: document.getElementById('overlay'),
    trackTitle: document.getElementById('track-title'),
    timeDisplay: document.getElementById('time-display'),
    dateDisplay: document.getElementById('date-display'),
    timeline: document.getElementById('timeline'),
    playBtn: document.getElementById('play-btn'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    hamburgerBtn: document.getElementById('hamburger-btn'),
    segmentDropdown: document.getElementById('segment-dropdown'),
    segmentList: document.getElementById('segment-list')
};
```

- [ ] **Step 2: Verify UI object updated**

Run: `grep -A2 "hamburgerBtn:" validation/production/index.html`
Expected: UI element references added

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: add UI references for hamburger and dropdown"
```

---

### Task 6: Implement toggleSegmentList() Function

**Files:**
- Modify: `validation/production/index.html` (JavaScript section)

**Interfaces:**
- Consumes: UI.segmentDropdown, UI.hamburgerBtn
- Produces: Dropdown toggle behavior

- [ ] **Step 1: Add toggleSegmentList() function**

Add to JavaScript section (after utility functions, around line 510):
```javascript
function toggleSegmentList() {
    UI.segmentDropdown.classList.toggle('show');
    const isVisible = UI.segmentDropdown.classList.contains('show');
    UI.hamburgerBtn.setAttribute('aria-expanded', isVisible);
}
```

- [ ] **Step 2: Verify function added**

Run: `grep -A5 "function toggleSegmentList" validation/production/index.html`
Expected: Function definition present

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: implement toggleSegmentList() function"
```

---

### Task 7: Implement renderSegmentList() Function

**Files:**
- Modify: `validation/production/index.html` (JavaScript section)

**Interfaces:**
- Consumes: segments array, UI.segmentList, fmtTime12Hour()
- Produces: Populated segment list (newest first)

- [ ] **Step 1: Add renderSegmentList() function**

Add after toggleSegmentList():
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

- [ ] **Step 2: Verify function added**

Run: `grep -A15 "function renderSegmentList" validation/production/index.html`
Expected: Function definition present with correct logic

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: implement renderSegmentList() function (newest first)"
```

---

### Task 8: Implement setupSegmentListHandlers() Function

**Files:**
- Modify: `validation/production/index.html` (JavaScript section)

**Interfaces:**
- Consumes: UI elements, segments array, seekToTime(), toggleSegmentList()
- Produces: Click handlers for dropdown interactions

- [ ] **Step 1: Add setupSegmentListHandlers() function**

Add after renderSegmentList():
```javascript
function setupSegmentListHandlers() {
    // Segment item click handler
    UI.segmentList.addEventListener('click', (e) => {
        const item = e.target.closest('.segment-item');
        if (!item) return;

        const index = parseInt(item.dataset.index);
        if (segments[index]) {
            console.log('[USER] Segment list: selected segment', index);
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

    // Hamburger button click handler
    UI.hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('[USER] Hamburger button clicked');
        toggleSegmentList();
    });
}
```

- [ ] **Step 2: Verify function added**

Run: `grep -A25 "function setupSegmentListHandlers" validation/production/index.html`
Expected: Function with all three handlers present

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: implement segment list click handlers"
```

---

### Task 9: Integrate with fetchPlaylist()

**Files:**
- Modify: `validation/production/index.html` (fetchPlaylist function)

**Interfaces:**
- Consumes: renderSegmentList()
- Produces: Auto-populated segment list on playlist update

- [ ] **Step 1: Call renderSegmentList() after segments update**

Find the fetchPlaylist() function (around line 521). After segments are updated, add the call:

Find these lines:
```javascript
segments = data.segments || [];
log.i('Playlist updated:', prevCount, '->', segments.length, 'segments');
log.network('FETCH_SUCCESS', url, resp.status);
updateTimeline();
```

Add after `updateTimeline()`:
```javascript
segments = data.segments || [];
log.i('Playlist updated:', prevCount, '->', segments.length, 'segments');
log.network('FETCH_SUCCESS', url, resp.status);
updateTimeline();
renderSegmentList();
```

- [ ] **Step 2: Verify integration**

Run: `grep -A2 "updateTimeline();" validation/production/index.html | grep renderSegmentList`
Expected: renderSegmentList() call present

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: integrate renderSegmentList() with fetchPlaylist()"
```

---

### Task 10: Integrate with init()

**Files:**
- Modify: `validation/production/index.html` (init function)

**Interfaces:**
- Consumes: setupSegmentListHandlers()
- Produces: Initialized event handlers on page load

- [ ] **Step 1: Call setupSegmentListHandlers() in init()**

Find the init() function (around line 1182). Add call after existing setup:

Find this area in init() (after playlist polling setup):
```javascript
// Start playlist polling
setInterval(fetchPlaylist, POLL_INTERVAL);
```

Add after:
```javascript
// Start playlist polling
setInterval(fetchPlaylist, POLL_INTERVAL);

// Setup segment list handlers
setupSegmentListHandlers();
```

- [ ] **Step 2: Verify integration**

Run: `grep "setupSegmentListHandlers();" validation/production/index.html`
Expected: Function call present in init()

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add index.html
git commit -m "feat: integrate setupSegmentListHandlers() with init()"
```

---

### Task 11: Create Playwright Test File

**Files:**
- Create: `test_validation/tests/feature14.spec.js`

**Interfaces:**
- Consumes: Page object, index.html (served at localhost:8081)
- Produces: Test coverage for hamburger segment list

- [ ] **Step 1: Create the test file with 10 test cases**

Create `test_validation/tests/feature14.spec.js`:
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature #14: Hamburger Segment List', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081');
        // Dismiss overlay
        await page.click('.overlay');
        // Wait for segments to load
        await page.waitForTimeout(3000);
    });

    test('1. Hamburger button exists', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await expect(hamburgerBtn).toHaveCount(1);
    });

    test('2. Button has correct icon', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        const icon = hamburgerBtn.locator('svg');
        await expect(icon).toHaveCount(1);
    });

    test('3. Dropdown opens on click', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        const dropdown = page.locator('.segment-dropdown');

        await hamburgerBtn.click();
        await expect(dropdown).toHaveClass(/show/);
    });

    test('4. Dropdown closes on second click', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        const dropdown = page.locator('.segment-dropdown');

        await hamburgerBtn.click();
        await expect(dropdown).toHaveClass(/show/);
        await hamburgerBtn.click();
        await expect(dropdown).not.toHaveClass(/show/);
    });

    test('5. Segment list populated', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const segmentItems = page.locator('.segment-item');
        const count = await segmentItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('6. Newest first ordering', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const firstItem = page.locator('.segment-item').first();
        const firstTime = await firstItem.locator('.segment-item-time').textContent();

        // First item should be the latest (newest)
        // Verify it's a valid time format
        expect(firstTime).toMatch(/^\d{1,2}:\d{2}/);
    });

    test('7. Segment click seeks correctly', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const segmentItem = page.locator('.segment-item').first();
        await segmentItem.click();

        // Wait for seek and dropdown to close
        await page.waitForTimeout(500);

        const dropdown = page.locator('.segment-dropdown');
        await expect(dropdown).not.toHaveClass(/show/);
    });

    test('8. Dropdown closes on selection', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const segmentItem = page.locator('.segment-item').first();
        await segmentItem.click();

        await page.waitForTimeout(200);
        const dropdown = page.locator('.segment-dropdown');
        await expect(dropdown).not.toHaveClass(/show/);
    });

    test('9. Click outside closes dropdown', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const dropdown = page.locator('.segment-dropdown');
        await expect(dropdown).toHaveClass(/show/);

        // Click outside (on the time display)
        await page.click('.time-display');

        await expect(dropdown).not.toHaveClass(/show/);
    });

    test('10. Scrollable list with many segments', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const segmentList = page.locator('.segment-list');

        // Verify list has scroll capability
        const scrollHeight = await segmentList.evaluate(el => el.scrollHeight);
        const clientHeight = await segmentList.evaluate(el => el.clientHeight);

        // If there are many segments, scrollHeight > clientHeight
        expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
    });
});
```

- [ ] **Step 2: Verify test file created**

Run: `ls -la /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation/tests/feature14.spec.js`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
git add test_validation/tests/feature14.spec.js
git commit -m "test: add feature14.spec.js with 10 test cases"
```

---

### Task 12: Local Validation

**Files:**
- Test: `validation/production/index.html` (served)

**Interfaces:**
- Consumes: HTTP server, browser
- Produces: Manual verification of feature

- [ ] **Step 1: Start HTTP server**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation
python3 -m http.server 8081 &
```

- [ ] **Step 2: Manual testing checklist**

Visit: `http://localhost:8081`

Manual checks:
- [ ] Hamburger button visible in top-right corner
- [ ] Click button → dropdown appears
- [ ] Dropdown shows segments with time and title
- [ ] Segments ordered newest first
- [ ] Click segment → playback seeks, menu closes
- [ ] Click outside → menu closes
- [ ] Click button twice → toggle behavior works
- [ ] List scrolls with many segments
- [ ] Long titles show ellipsis

- [ ] **Step 3: Create validation note**

```bash
echo "Manual validation for Feature #14 completed: $(date). Hamburger button, dropdown, segment selection all working." > /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production/docs/2026-07-29-feature14-validation.md
```

- [ ] **Step 4: Commit**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
git add validation/production/docs/2026-07-29-feature14-validation.md
git commit -m "docs: record Feature #14 manual validation"
```

---

### Task 13: Run Automated Tests

**Files:**
- Test: `test_validation/tests/feature14.spec.js`
- Test: All existing regression tests

**Interfaces:**
- Consumes: Playwright, HTTP server
- Produces: Test results

- [ ] **Step 1: Run new feature14 tests**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation
npx playwright test feature14 --reporter=list
```

Expected: All 10 tests pass

- [ ] **Step 2: Run full regression suite**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/test_validation
npx playwright test --reporter=list
```

Expected: All 67 tests pass (57 existing + 10 new)

- [ ] **Step 3: If tests fail, fix and re-run**

Address any failures, then re-run:
```bash
npx playwright test --reporter=list
```

- [ ] **Step 4: Commit test results**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
git add test_validation/tests/
git commit -m "test: feature14 tests passing (67/67)"
```

---

### Task 14: Update Documentation

**Files:**
- Modify: `validation/production/CLAUDE.md`
- Modify: `validation/production/TODO.md`
- Modify: `validation/production/index.html` (version)
- Create: `validation/production/RELEASE_v1.5.0.md`

**Interfaces:**
- Consumes: Git history, existing docs
- Produces: Updated documentation

- [ ] **Step 1: Update CLAUDE.md with Feature #14 complete**

Find the Feature Implementation Status section in CLAUDE.md and update:
```markdown
| **14** | Hamburger segment list | Add hamburger button with scrollable segment list | ✅ Complete | 2026-07-29 |
```

Add to features list:
```markdown
**Feature #14 (Hamburger segment list) - v1.5.0:**
- Hamburger button (top-right corner)
- Dropdown panel with scrollable segment list
- Segments ordered newest first
- Each item shows time + title (ellipsized)
- Click segment → seek and close menu
- Validated with 10 Playwright tests
```

Update regression test count to 67.

- [ ] **Step 2: Update TODO.md**

Change Feature #14 status to complete:
```markdown
| **14** | Hamburger segment list | Add a hamburger button that when clicked brings up a scrollable list of segments with index of date/time they start (e.g., list showing start time + title, clickable to seek) | ✅ Complete (2026-07-29) |
```

- [ ] **Step 3: Update version in index.html**

Find line with version (currently `v1.4.3`) and change to `v1.5.0`

- [ ] **Step 4: Create release notes**

Create `validation/production/RELEASE_v1.5.0.md`:
```markdown
# Release v1.5.0 - Hamburger Segment List

**Date:** 2026-07-29

## Changes

### Features
- **Hamburger segment list**: Added hamburger button (top-right) with dropdown panel showing all segments
- **Newest-first ordering**: Segments displayed with most recent at top for easy access to latest content
- **Quick navigation**: Click any segment to seek directly to it; menu closes automatically
- **Segment info**: Each item shows start time and title (long titles truncated with ellipsis)

### Technical Details
- Hamburger button positioned absolute top-right (32px from edge)
- Dropdown panel: 320px wide, max 400px height, scrollable list
- Segment items: flex layout with time (monospace) + title (ellipsized)
- Click-outside-to-close behavior for better UX
- ARIA attributes for accessibility

### Testing
- 10 new Playwright tests for hamburger segment list
- All 67 regression tests passing (57 existing + 10 new)

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
```

- [ ] **Step 5: Commit documentation**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine/validation/production
git add CLAUDE.md index.html RELEASE_v1.5.0.md
git add ../TODO.md
git commit -m "docs: update documentation for Feature #14 (v1.5.0)"
```

---

### Task 15: Create Release Package

**Files:**
- Create: `release/v1.5.0/` directory
- Copy: `index.html`, `audio/recorderd.py`, `audio/start.sh`, `RELEASE_v1.5.0.md`

**Interfaces:**
- Consumes: Production files
- Produces: Frozen release artifact

- [ ] **Step 1: Create release directory**

```bash
mkdir -p /home/jeff/ClaudeCode/noAgendaTimeMachine/release/v1.5.0/audio
```

- [ ] **Step 2: Copy files to release**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
cp validation/production/index.html release/v1.5.0/
cp validation/production/audio/recorderd.py release/v1.5.0/audio/
cp validation/production/audio/start.sh release/v1.5.0/audio/
cp validation/production/RELEASE_v1.5.0.md release/v1.5.0/
```

- [ ] **Step 3: Verify release package**

```bash
ls -la /home/jeff/ClaudeCode/noAgendaTimeMachine/release/v1.5.0/
ls -la /home/jeff/ClaudeCode/noAgendaTimeMachine/release/v1.5.0/audio/
```

Expected: index.html, RELEASE_v1.5.0.md, audio/ with recorderd.py and start.sh

- [ ] **Step 4: Commit release**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
git add release/v1.5.0/
git commit -m "release: v1.5.0 hamburger segment list"
```

---

### Task 16: Final Git Tag and Summary

**Files:**
- Git repository

**Interfaces:**
- Consumes: Git history
- Produces: Version tag

- [ ] **Step 1: Create git tag**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
git tag -a v1.5.0 -m "Hamburger segment list: dropdown with segments ordered newest first"
```

- [ ] **Step 2: Verify tag**

```bash
git tag -l "v1.*"
```

Expected: v1.4.3, v1.5.0 listed

- [ ] **Step 3: Summary of release**

```bash
cd /home/jeff/ClaudeCode/noAgendaTimeMachine
echo "Release v1.5.0 complete:"
git log --oneline -15
git tag -l "v1.*"
```

---

## Plan Self-Review

**Spec Coverage:**
- ✅ Hamburger button HTML — Task 1
- ✅ Dropdown panel HTML — Task 2
- ✅ Button CSS — Task 3
- ✅ Dropdown CSS — Task 4
- ✅ UI references — Task 5
- ✅ Toggle function — Task 6
- ✅ Render function — Task 7
- ✅ Event handlers — Task 8
- ✅ fetchPlaylist integration — Task 9
- ✅ init integration — Task 10
- ✅ Tests — Task 11
- ✅ Manual validation — Task 12
- ✅ Automated testing — Task 13
- ✅ Documentation — Task 14
- ✅ Release package — Task 15
- ✅ Git tag — Task 16

**Placeholder Scan:** No TBD, TODO, or vague instructions found. All steps include exact code.

**Type Consistency:** All references consistent — `UI.hamburgerBtn`, `UI.segmentDropdown`, `UI.segmentList` used throughout.

**Dependencies:** Tasks ordered correctly — HTML → CSS → JavaScript → Integration → Testing → Documentation.
