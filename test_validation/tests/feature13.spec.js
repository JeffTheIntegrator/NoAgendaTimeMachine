const { test, expect } = require('@playwright/test');

test.describe('Feature #13: Slider drag updates title', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
        await page.waitForTimeout(2000); // playlist loads
    });

    test('title element exists and has content after load', async ({ page }) => {
        const title = page.locator('#track-title');
        await expect(title).toBeVisible();
        const text = await title.textContent();
        expect(text.length).toBeGreaterThan(0);
    });

    test('dragging slider via input event updates time display', async ({ page }) => {
        const result = await page.evaluate(() => {
            const tl = document.getElementById('timeline');
            const min = parseFloat(tl.min);
            const max = parseFloat(tl.max);
            if (!isFinite(min) || !isFinite(max) || max <= min) return { skip: true };

            const dragPos = min + (max - min) * 0.25;
            tl.value = dragPos;
            tl.dispatchEvent(new Event('input', { bubbles: true }));

            return {
                skip: false,
                dragPos,
                timeText: document.getElementById('time-display').textContent,
            };
        });

        if (result.skip) { test.skip(); return; }

        expect(result.timeText).not.toBe('--:--:--');
        expect(result.timeText).toMatch(/(AM|PM|Noon|Midnight)/);
    });

    test('title during drag matches segment at dragged position', async ({ page }) => {
        const result = await page.evaluate(() => {
            const tl = document.getElementById('timeline');
            const min = parseInt(tl.min);
            const max = parseInt(tl.max);
            if (!isFinite(min) || !isFinite(max) || max <= min) return { skip: true };

            // Access the global segments array
            if (typeof segments === 'undefined' || segments.length < 2) return { skip: true };

            // Pick a segment index in the middle (different from start)
            const targetIdx = Math.max(0, Math.floor(max / 2));

            tl.value = targetIdx;
            tl.dispatchEvent(new Event('input', { bubbles: true }));

            return {
                skip: false,
                targetIdx,
                expectedTitle: segments[targetIdx] ? segments[targetIdx].title : 'N/A',
                displayedTitle: document.getElementById('track-title').textContent,
            };
        });

        if (result.skip) { test.skip(); return; }

        expect(result.displayedTitle).toBe(result.expectedTitle);
    });

    test('dragging across timeline shows title changes (multi-position)', async ({ page }) => {
        const result = await page.evaluate(() => {
            const tl = document.getElementById('timeline');
            const min = parseFloat(tl.min);
            const max = parseFloat(tl.max);
            if (!isFinite(min) || !isFinite(max) || max <= min) return { skip: true };
            if (typeof segments === 'undefined' || segments.length < 1) return { skip: true };

            const positions = [
                min + (max - min) * 0.05,
                min + (max - min) * 0.50,
                min + (max - min) * 0.95,
            ];

            const titles = [];
            for (const pos of positions) {
                tl.value = pos;
                tl.dispatchEvent(new Event('input', { bubbles: true }));
                titles.push(document.getElementById('track-title').textContent || '');
            }

            return {
                skip: false,
                titles,
                segmentCount: segments.length,
            };
        });

        if (result.skip) { test.skip(); return; }

        // All positions should produce non-empty titles
        for (const title of result.titles) {
            expect(title.length).toBeGreaterThan(0);
        }
    });

    test('time display maintains 12-hour format during drag', async ({ page }) => {
        const result = await page.evaluate(() => {
            const tl = document.getElementById('timeline');
            const min = parseFloat(tl.min);
            const max = parseFloat(tl.max);
            if (!isFinite(min) || !isFinite(max)) return { skip: true };

            tl.value = min + (max - min) * 0.5;
            tl.dispatchEvent(new Event('input', { bubbles: true }));

            return {
                skip: false,
                timeText: document.getElementById('time-display').textContent,
            };
        });

        if (result.skip) { test.skip(); return; }

        expect(result.timeText).toMatch(/(AM|PM|Noon|Midnight)/);
    });

    test('input handler code includes Feature #13 segment title lookup', async ({ page }) => {
        const hasFeature13Code = await page.evaluate(() => {
            const tl = document.getElementById('timeline');
            // Get all scripts, check for the feature #13 pattern
            const html = document.documentElement.innerHTML;
            // The input handler should use segment index directly and update trackTitle
            const hasSegmentLookup = html.includes('trackTitle') &&
                                     html.includes('segIndex') &&
                                     html.includes('addEventListener(\'input\'');
            return {
                hasSegmentLookup,
                hasInputHandler: html.includes("addEventListener('input'"),
                hasSegIndexVar: html.includes('segIndex'),
            };
        });

        expect(hasFeature13Code.hasInputHandler).toBe(true);
        expect(hasFeature13Code.hasSegIndexVar).toBe(true);
        expect(hasFeature13Code.hasSegmentLookup).toBe(true);
    });

    test('dragging does not trigger seek (change event not fired)', async ({ page }) => {
        // Input events update display but should not seek until change
        const result = await page.evaluate(() => {
            const tl = document.getElementById('timeline');
            const min = parseFloat(tl.min);
            const max = parseFloat(tl.max);
            if (!isFinite(min) || !isFinite(max) || max <= min) return { skip: true };

            // Track if seekToTime was called - check that audio src doesn't change during input-only events
            const pA = document.getElementById('playerA');
            const pB = document.getElementById('playerB');
            if (!pA && !pB) return { skip: true };

            // Use active player src as indicator - pick whichever has src
            const getSrc = () => {
                const a = document.getElementById('playerA');
                const b = document.getElementById('playerB');
                return (a && a.src) || (b && b.src) || '';
            };

            const srcBefore = getSrc();

            const dragPos = min + (max - min) * 0.1;
            tl.value = dragPos;
            tl.dispatchEvent(new Event('input', { bubbles: true }));

            const srcAfter = getSrc();

            return {
                skip: false,
                srcBefore,
                srcAfter,
                sameSrc: srcBefore === srcAfter,
            };
        });

        if (result.skip) { test.skip(); return; }

        // Audio source should not change during drag (only on release/change)
        expect(result.sameSrc).toBe(true);
    });
});
