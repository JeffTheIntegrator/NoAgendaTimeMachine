const { test, expect } = require('@playwright/test');

test.describe('Feature #9: Equal Button Sizes', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');

        // Dismiss the overlay to enable autoplay
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
    });

    test('All control buttons have equal width (64px)', async ({ page }) => {
        const controlBtns = page.locator('.control-btn');

        // Wait for buttons to be visible
        await expect(controlBtns.first()).toBeVisible();

        // Get the width of each button
        const widths = await controlBtns.all().then((btns) =>
            Promise.all(btns.map((btn) => btn.evaluate((el) => el.offsetWidth)))
        );

        // All buttons should be 64px wide
        widths.forEach((width) => {
            expect(width).toBe(64);
        });
    });

    test('All control buttons have equal height (64px)', async ({ page }) => {
        const controlBtns = page.locator('.control-btn');

        // Wait for buttons to be visible
        await expect(controlBtns.first()).toBeVisible();

        // Get the height of each button
        const heights = await controlBtns.all().then((btns) =>
            Promise.all(btns.map((btn) => btn.evaluate((el) => el.offsetHeight)))
        );

        // All buttons should be 64px tall
        heights.forEach((height) => {
            expect(height).toBe(64);
        });
    });

    test('Previous track button is 64x64px', async ({ page }) => {
        const prevBtn = page.locator('.control-btn').nth(0); // First button is prevTrack

        // Wait for button to be visible
        await expect(prevBtn).toBeVisible();

        // Get dimensions
        const { width, height } = await prevBtn.boundingBox();

        // Should be 64x64
        expect(width).toBe(64);
        expect(height).toBe(64);
    });

    test('Play/pause button is 64x64px', async ({ page }) => {
        const playBtn = page.locator('.play-btn');

        // Wait for button to be visible
        await expect(playBtn).toBeVisible();

        // Get dimensions
        const { width, height } = await playBtn.boundingBox();

        // Should be 64x64
        expect(width).toBe(64);
        expect(height).toBe(64);
    });

    test('Next track button is 64x64px', async ({ page }) => {
        const nextBtn = page.locator('.control-btn').nth(2); // Third button is nextTrack

        // Wait for button to be visible
        await expect(nextBtn).toBeVisible();

        // Get dimensions
        const { width, height } = await nextBtn.boundingBox();

        // Should be 64x64
        expect(width).toBe(64);
        expect(height).toBe(64);
    });

    test('All control buttons have same dimensions', async ({ page }) => {
        const controlBtns = page.locator('.control-btn');

        // Wait for buttons to be visible
        await expect(controlBtns.nth(0)).toBeVisible();

        // Get bounding boxes for all buttons
        const boxes = await controlBtns.all().then((btns) =>
            Promise.all(btns.map((btn) => btn.boundingBox()))
        );

        // All buttons should have the same dimensions
        const firstBox = boxes[0];
        boxes.forEach((box) => {
            expect(box.width).toBe(firstBox.width);
            expect(box.height).toBe(firstBox.height);
        });
    });
});
