import { test, expect } from '@playwright/test';

test.describe('Code Review Fix: XSS via innerHTML', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081');
        // Dismiss overlay
        await page.click('.overlay');
        // Wait for segments to load
        await page.waitForTimeout(3000);
    });

    test('1. HTML in segment titles is rendered as text, not parsed', async ({ page }) => {
        // Inject a segment with a malicious title and verify rendering via evaluate
        const result = await page.evaluate(() => {
            // Note: 'segments' is a top-level 'let' in the script, not on window
            // Override fetchPlaylist to prevent it from overwriting test data
            const origFetchPlaylist = fetchPlaylist;
            fetchPlaylist = async () => {}; // no-op during test

            // Replace segments with a fake one containing HTML in the title
            // Need to clear and push since 'segments' is a let binding
            segments.length = 0;
            segments.push({
                url: 'audio/segments/fake.mp3',
                start: 1000000,
                end: 1000100,
                title: '<img src=x onerror="window.__xssTriggered=true">',
                final: true
            });
            // Force re-render
            renderSegmentList();

            // Check what was rendered in the dropdown
            const titleEl = document.querySelector('.segment-item-title');
            const titleText = titleEl ? titleEl.textContent : '';
            const imgCount = document.querySelectorAll('.segment-item img').length;

            // Restore
            fetchPlaylist = origFetchPlaylist;

            return { titleText, imgCount };
        });

        // The malicious title should appear as text content, not as HTML
        expect(result.titleText).toContain('<img src=x onerror=');
        // Verify no img elements were injected
        expect(result.imgCount).toBe(0);

        // Verify the XSS payload was NOT executed
        const xssTriggered = await page.evaluate(() => window.__xssTriggered);
        expect(xssTriggered).toBeUndefined();
    });

    test('2. Normal segment titles render correctly after XSS fix', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        // Regular segments should still have titles
        const segmentItems = page.locator('.segment-item');
        const count = await segmentItems.count();
        expect(count).toBeGreaterThan(0);

        // Each item should have a visible title
        const firstTitle = page.locator('.segment-item-title').first();
        await expect(firstTitle).toBeVisible();
    });

    test('3. Segment items remain clickable after DOM-based rendering', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        // Click a segment item
        const segmentItem = page.locator('.segment-item').first();
        await segmentItem.click();

        // Dropdown should close after selection
        const dropdown = page.locator('.segment-dropdown');
        await expect(dropdown).not.toHaveClass(/show/);

        // Track title should update to the selected segment
        const trackTitle = page.locator('#track-title');
        await expect(trackTitle).not.toHaveText('Loading stream...');
    });

    test('4. Empty segments list shows "No segments available"', async ({ page }) => {
        // Clear segments and re-render (suppress fetchPlaylist to prevent overwrite)
        await page.evaluate(() => {
            const origFetchPlaylist = fetchPlaylist;
            fetchPlaylist = async () => {};
            segments.length = 0;
            renderSegmentList();
            fetchPlaylist = origFetchPlaylist;
        });

        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const emptyMessage = page.locator('.segment-item').first();
        await expect(emptyMessage).toHaveText('No segments available');
    });
});
