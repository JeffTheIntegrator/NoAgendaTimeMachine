const { test, expect } = require('@playwright/test');

test.describe('AbortError handling (v1.4.3)', () => {
    test('should not log errors during rapid previous track clicks', async ({ page }) => {
        await page.goto('http://localhost:8081');
        await page.click('button:has-text("Start Player")');
        await page.waitForTimeout(2000);

        // Track AbortErrors
        await page.evaluate(() => {
            window.abortErrors = 0;
            window.originalError = console.error;
            console.error = function(...args) {
                const msg = args.join(' ');
                if (msg.includes('AbortError') && msg.includes('[PLAYBACK]')) {
                    window.abortErrors++;
                }
                window.originalError.apply(console, args);
            };
        });

        // Click prev track 5 times rapidly (simulating user behavior from TestResult0011)
        for (let i = 0; i < 5; i++) {
            await page.click('button[title="Previous track"]');
            await page.waitForTimeout(300);
        }

        await page.waitForTimeout(1000);

        // Check for AbortError in logs - should be 0 (debug messages, not errors)
        const abortCount = await page.evaluate(() => window.abortErrors);

        expect(abortCount).toBe(0);
    });

    test('should log user input events', async ({ page }) => {
        await page.goto('http://localhost:8081');

        // Track user clicks
        await page.evaluate(() => {
            window.userClicks = 0;
            const originalLog = console.log;
            console.log = function(...args) {
                const msg = args.join(' ');
                if (msg.includes('[USER]')) {
                    window.userClicks++;
                }
                originalLog.apply(console, args);
            };
        });

        await page.click('button:has-text("Start Player")');
        await page.waitForTimeout(1000);

        // Click various buttons
        await page.click('button[title="Previous track"]');
        await page.waitForTimeout(100);
        await page.click('button[title="Next track"]');
        await page.waitForTimeout(100);
        await page.click('button:has-text("+30s")');
        await page.waitForTimeout(100);

        const clickCount = await page.evaluate(() => window.userClicks);

        // Should have at least 4 user clicks logged
        expect(clickCount).toBeGreaterThanOrEqual(4);
    });

    test('should display version 1.4.3', async ({ page }) => {
        await page.goto('http://localhost:8081');

        const versionText = await page.locator('.version-info').textContent();
        expect(versionText.trim()).toBe('v1.4.3');
    });
});
