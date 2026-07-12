const { test, expect } = require('@playwright/test');

test.describe('Feature #8: White Button Text/Icons', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');

        // Dismiss the overlay to enable autoplay
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
    });

    test('Jump buttons have white text', async ({ page }) => {
        const jumpBtns = page.locator('.jump-btn');

        // Wait for buttons to be visible
        await expect(jumpBtns.first()).toBeVisible();

        // Get the computed color of the first jump button
        const color = await jumpBtns.first().evaluate((el) => {
            return window.getComputedStyle(el).color;
        });

        // Should be white (rgb(255, 255, 255))
        expect(color).toBe('rgb(255, 255, 255)');
    });

    test('Control buttons have white text/icons', async ({ page }) => {
        const controlBtns = page.locator('.control-btn');

        // Wait for buttons to be visible
        await expect(controlBtns.first()).toBeVisible();

        // Get the computed color of the first control button
        const color = await controlBtns.first().evaluate((el) => {
            return window.getComputedStyle(el).color;
        });

        // Should be white (rgb(255, 255, 255))
        expect(color).toBe('rgb(255, 255, 255)');
    });

    test('Jump buttons have gold/accent background', async ({ page }) => {
        const jumpBtns = page.locator('.jump-btn');

        // Get the computed background color
        const bgColor = await jumpBtns.first().evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });

        // Should match the accent color (rgb(176, 140, 79) for #b08c4f)
        // Allow some tolerance for browser rendering
        expect(bgColor).toMatch(/rgb\(176,\s*140,\s*79\)/);
    });

    test('Control buttons have gold/accent background', async ({ page }) => {
        const controlBtns = page.locator('.control-btn');

        // Get the computed background color (excluding play-btn which has different styling)
        const firstControl = controlBtns.nth(0); // prevTrack button
        const bgColor = await firstControl.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });

        // Should match the accent color
        expect(bgColor).toMatch(/rgb\(176,\s*140,\s*79\)/);
    });

    test('Jump button hover maintains white text', async ({ page }) => {
        const jumpBtn = page.locator('.jump-btn').first();

        // Hover over the button
        await jumpBtn.hover();

        // Get the computed color during hover
        const color = await jumpBtn.evaluate((el) => {
            return window.getComputedStyle(el).color;
        });

        // Should still be white during hover
        expect(color).toBe('rgb(255, 255, 255)');
    });

    test('Control button hover maintains white text', async ({ page }) => {
        const controlBtn = page.locator('.control-btn').nth(0); // prevTrack

        // Hover over the button
        await controlBtn.hover();

        // Get the computed color during hover
        const color = await controlBtn.evaluate((el) => {
            return window.getComputedStyle(el).color;
        });

        // Should still be white during hover
        expect(color).toBe('rgb(255, 255, 255)');
    });
});
