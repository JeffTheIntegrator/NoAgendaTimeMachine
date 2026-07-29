const { test, expect } = require('@playwright/test');

test.describe('Feature #2: 12-hour Time Format with Date', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');

        // Dismiss the overlay to enable autoplay
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
    });

    test('Time display uses 12-hour format with AM/PM', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');

        // Wait for time to populate
        await expect(timeDisplay).not.toHaveText('--:--:--');

        const timeText = await timeDisplay.textContent();

        // Should contain AM or PM
        expect(timeText).toMatch(/(AM|PM)/);

        // Should be in format like "9:30:15 AM" or "12:00:00 PM"
        expect(timeText).toMatch(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/);
    });

    test('Date display shows day name, month, and day number', async ({ page }) => {
        const dateDisplay = page.locator('#date-display');

        // Wait for date to populate (might be empty initially)
        await page.waitForTimeout(2000);
        const dateText = await dateDisplay.textContent();

        // Should be in format like "Sat Jul 11"
        // Day name (3 letters), space, Month (3 letters), space, day number
        expect(dateText).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}$/);
    });

    test('Start time label removed (slider improvements)', async ({ page }) => {
        const startTime = page.locator('#start-time');

        // Time labels were removed in slider improvements
        await expect(startTime).toHaveCount(0);
    });

    test('End time label removed (slider improvements)', async ({ page }) => {
        const endTime = page.locator('#end-time');

        // Time labels were removed in slider improvements
        await expect(endTime).toHaveCount(0);
    });

    test('Time display has no leading zero for hour (1 AM not 01 AM)', async ({ page }) => {
        const timeDisplay = page.locator('#time-display');

        // Wait for time to populate
        await page.waitForTimeout(2000);
        const timeText = await timeDisplay.textContent();

        // Should NOT start with "0" for the hour (like "01:30:00 AM")
        // It should be like "1:30:00 AM"
        expect(timeText).not.toMatch(/^0\d:/);
    });
});
