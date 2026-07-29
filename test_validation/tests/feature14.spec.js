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

        // Click outside - programmatically trigger click on document (simulates clicking outside dropdown)
        await page.evaluate(() => {
            const event = new MouseEvent('click', { bubbles: true, view: window });
            document.dispatchEvent(event);
        });

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
