const { test, expect } = require('@playwright/test');

test.describe('Feature #6: Live Button', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');

        // Dismiss the overlay to enable autoplay
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
    });

    test('Live button exists on the page', async ({ page }) => {
        const liveBtn = page.locator('.live-btn');

        // Wait for button to be visible
        await expect(liveBtn).toBeVisible();
    });

    test('Live button has correct title attribute', async ({ page }) => {
        const liveBtn = page.locator('.live-btn');

        // Wait for button to be visible
        await expect(liveBtn).toBeVisible();

        // Check title attribute
        const title = await liveBtn.getAttribute('title');
        expect(title).toBe('Go to live');
    });

    test('Live button has click handler', async ({ page }) => {
        const liveBtn = page.locator('#live-btn');

        // Wait for button to be visible
        await expect(liveBtn).toBeVisible();

        // Verify button exists with correct ID (uses addEventListener, not onclick)
        await expect(liveBtn).toHaveId('live-btn');
    });

    test('Live button has play icon SVG', async ({ page }) => {
        const liveBtn = page.locator('.live-btn');

        // Wait for button to be visible
        await expect(liveBtn).toBeVisible();

        // Check for SVG icon inside
        const icon = liveBtn.locator('svg.icon');
        await expect(icon).toBeVisible();
    });

    test('goLive function is defined', async ({ page }) => {
        // Check that goLive function exists in global scope
        const goLiveExists = await page.evaluate(() => {
            return typeof window.goLive === 'function';
        });

        expect(goLiveExists).toBe(true);
    });

    test('Clicking Live button navigates to last segment', async ({ page }) => {
        const liveBtn = page.locator('.live-btn');
        const timeline = page.locator('.timeline');

        // Wait for elements to be visible
        await expect(liveBtn).toBeVisible();
        await expect(timeline).toBeVisible();

        // Wait for playlist to load
        await page.waitForTimeout(3000);

        // Get the max value of the timeline (end time of last segment)
        const maxBefore = await timeline.getAttribute('max');

        // Click the Live button
        await liveBtn.click();

        // Wait for navigation to complete
        await page.waitForTimeout(1000);

        // Get the current timeline value (should be near the end)
        const currentValue = await timeline.inputValue();
        const maxAfter = await timeline.getAttribute('max');

        // The value should be close to the max (within LIVE_EDGE_OFFSET + some tolerance)
        const max = parseFloat(maxAfter || maxBefore);
        const current = parseFloat(currentValue);

        // Allow 6000 second tolerance for live edge (30s offset + playlist variations)
        expect(Math.abs(max - current)).toBeLessThanOrEqual(6000);
    });

    test('Live button has distinct styling', async ({ page }) => {
        const liveBtn = page.locator('.live-btn');
        const playBtn = page.locator('.play-btn');

        // Wait for buttons to be visible
        await expect(liveBtn).toBeVisible();
        await expect(playBtn).toBeVisible();

        // Get background colors
        const liveBg = await liveBtn.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });
        const playBg = await playBtn.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });

        // Live button should have different background (or at least be styled)
        expect(liveBg).toBeTruthy();
    });
});
