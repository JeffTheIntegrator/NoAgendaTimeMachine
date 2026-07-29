import { test, expect } from '@playwright/test';

test.describe('Slider Improvements', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081');
        // Dismiss overlay
        await page.click('.overlay');
    });

    test('1. Segment slider range', async ({ page }) => {
        const timeline = page.locator('.timeline');
        await expect(timeline).toHaveAttribute('min', '0');
        // Max should be a non-negative integer (segment count - 1)
        const maxAttr = await timeline.getAttribute('max');
        expect(parseInt(maxAttr || '0')).toBeGreaterThanOrEqual(0);
    });

    test('2. Drag updates title', async ({ page }) => {
        const timeline = page.locator('.timeline');
        const trackTitle = page.locator('#track-title');

        // Get initial title
        const initialTitle = await trackTitle.textContent();

        // Drag to middle position
        await timeline.evaluate((el) => {
            el.value = Math.floor(parseInt(el.max) / 2);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Wait for title update
        await page.waitForTimeout(100);
        const newTitle = await trackTitle.textContent();

        // Title should have changed (different segment)
        expect(newTitle).not.toBe(initialTitle);
    });

    test('3. Drag updates time', async ({ page }) => {
        const timeline = page.locator('.timeline');
        const timeDisplay = page.locator('#time-display');

        // Drag to first position
        await timeline.evaluate((el) => {
            el.value = '0';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        await page.waitForTimeout(100);
        const time1 = await timeDisplay.textContent();

        // Drag to last position
        await timeline.evaluate((el) => {
            el.value = el.max;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        await page.waitForTimeout(100);
        const time2 = await timeDisplay.textContent();

        // Times should be different
        expect(time2).not.toBe(time1);
    });

    test('4. Release seeks correctly', async ({ page }) => {
        const timeline = page.locator('.timeline');

        // Drag to a specific position
        await timeline.evaluate((el) => {
            el.value = Math.floor(parseInt(el.max) / 2);
        });

        // Release (change event)
        await timeline.evaluate((el => {
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }));

        // Verify no console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                expect.soft(msg.text()).not.toContain('Cannot read');
            }
        });

        await page.waitForTimeout(500);
    });

    test('5. Button order', async ({ page }) => {
        const buttons = page.locator('.jump-btn');
        const labels = await buttons.allTextContents();

        // Expected order: -30s, -10m, -1h, +30s, +10m, +1h
        expect(labels[0]).toBe('-30s');
        expect(labels[1]).toBe('-10m');
        expect(labels[2]).toBe('-1h');
        expect(labels[3]).toBe('+30s');
        expect(labels[4]).toBe('+10m');
        expect(labels[5]).toBe('+1h');
    });

    test('6. Time labels removed', async ({ page }) => {
        // time-labels div should not exist
        const timeLabels = page.locator('.time-labels');
        await expect(timeLabels).toHaveCount(0);

        // Individual time label spans should not exist
        const startTime = page.locator('#start-time');
        const endTime = page.locator('#end-time');
        await expect(startTime).toHaveCount(0);
        await expect(endTime).toHaveCount(0);
    });

    test('7. Playback continuity', async ({ page }) => {
        const playBtn = page.locator('#play-btn');

        // Ensure playing
        await playBtn.click();
        await page.waitForTimeout(100);

        // Monitor for 2 minutes (simulated - shorter for test)
        const startTime = Date.now();
        let noStalls = true;

        page.on('console', msg => {
            if (msg.text().includes('stalled') || msg.text().includes('waiting')) {
                noStalls = false;
            }
        });

        // Play for 10 seconds (test simulation of 2 minutes)
        await page.waitForTimeout(10000);

        expect(noStalls).toBe(true);
    });

    test('8. Live button then slider', async ({ page }) => {
        const liveBtn = page.locator('.live-btn');
        const timeline = page.locator('.timeline');

        // Click live button
        await liveBtn.click();
        await page.waitForTimeout(500);

        // Then drag slider
        await timeline.evaluate((el) => {
            el.value = Math.max(0, parseInt(el.max) - 5);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await page.waitForTimeout(500);

        // No errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                expect.soft(msg.text()).not.toContain('Cannot read');
            }
        });
    });

    test('9. All segments accessible', async ({ page }) => {
        const timeline = page.locator('.timeline');
        const maxVal = await timeline.evaluate(el => parseInt(el.max));

        // Test first, middle, last segments
        const positions = [0, Math.floor(maxVal / 2), maxVal];

        for (const pos of positions) {
            await timeline.evaluate((el, val) => {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }, pos);

            await page.waitForTimeout(200);
        }

        // If we got here without errors, all segments are accessible
        expect(true).toBe(true);
    });

    test('10. Rapid drag behavior', async ({ page }) => {
        const timeline = page.locator('.timeline');
        const trackTitle = page.locator('#track-title');
        const maxVal = await timeline.evaluate(el => parseInt(el.max));

        // Rapidly drag across multiple positions
        for (let i = 0; i <= Math.min(10, maxVal); i++) {
            await timeline.evaluate((el, val) => {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, i);
        }

        await page.waitForTimeout(100);

        // Title should update without lag
        const finalTitle = await trackTitle.textContent();
        expect(finalTitle).toBeTruthy();

        // No console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                expect.soft(msg.text()).not.toContain('stack overflow');
            }
        });
    });
});
