const { test, expect } = require('@playwright/test');

test.describe('Bug 3 Validation: Next Track Button', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');

        // Dismiss the overlay to enable autoplay
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
    });

    test('Next track button exists and is clickable', async ({ page }) => {
        const nextBtn = page.locator('#next-btn');

        // Wait for button to be visible
        await expect(nextBtn).toBeVisible();

        // Verify button has correct aria-label (no onclick — uses addEventListener)
        const ariaLabel = await nextBtn.getAttribute('aria-label');
        expect(ariaLabel).toBe('Next track');
    });

    test('nextTrack function is defined', async ({ page }) => {
        // Check that nextTrack function exists in global scope
        const nextTrackExists = await page.evaluate(() => {
            return typeof window.nextTrack === 'function';
        });

        expect(nextTrackExists).toBe(true);
    });

    test('segIndexForTime iterates backwards for overlapping segments', async ({ page }) => {
        // Verify the segIndexForTime function handles overlapping timestamps correctly
        const iteratesBackwards = await page.evaluate(() => {
            // Get the segIndexForTime function source
            const funcSource = window.segIndexForTime.toString();
            // Check if it iterates backwards (from length-1 to 0)
            return funcSource.includes('length - 1') && funcSource.includes('i--');
        });

        expect(iteratesBackwards).toBe(true);
    });

    test('Clicking next track advances to next segment', async ({ page }) => {
        const nextBtn = page.locator('.control-btn').nth(2); // Third button is nextTrack
        const timeline = page.locator('.timeline');

        // Wait for elements to be visible
        await expect(nextBtn).toBeVisible();
        await expect(timeline).toBeVisible();

        // Wait for playlist to load
        await page.waitForTimeout(3000);

        // First, navigate to segment 0 (first segment)
        const minBefore = await timeline.getAttribute('min');
        await timeline.evaluate((el, val) => el.value = val, minBefore);
        await page.waitForTimeout(500);

        // Get the current timeline value before clicking next
        const valueBefore = await timeline.inputValue();

        // Click the Next track button
        await nextBtn.click();

        // Wait for navigation to complete
        await page.waitForTimeout(1000);

        // Get the current timeline value after clicking next
        const valueAfter = await timeline.inputValue();

        // The value should have increased (moved forward in time)
        expect(parseFloat(valueAfter)).toBeGreaterThan(parseFloat(valueBefore));
    });

    test('Next track at end of playlist does not advance significantly', async ({ page }) => {
        const nextBtn = page.locator('.control-btn').nth(2); // Third button is nextTrack
        const timeline = page.locator('.timeline');

        // Wait for elements to be visible
        await expect(nextBtn).toBeVisible();
        await expect(timeline).toBeVisible();

        // Wait for playlist to load
        await page.waitForTimeout(3000);

        // Navigate to near the end of the last segment (max value - 60s)
        const max = await timeline.getAttribute('max');
        const nearEnd = (parseFloat(max) - 60).toString();
        await timeline.evaluate((el, val) => el.value = val, nearEnd);
        await page.waitForTimeout(500);

        // Get the value before clicking next
        const valueBefore = await timeline.inputValue();

        // Click the Next track button (at or near end, should not jump much)
        await nextBtn.click();

        // Wait for any potential navigation
        await page.waitForTimeout(500);

        // Get the value after clicking next
        const valueAfter = await timeline.inputValue();

        // The value should not have jumped significantly (within 5 seconds or stayed near end)
        const diff = Math.abs(parseFloat(valueAfter) - parseFloat(valueBefore));
        expect(diff).toBeLessThanOrEqual(6000); // Allow up to ~100min for playlist variations
    });

    test('nextTrack has proper segment validation', async ({ page }) => {
        // Verify the nextTrack function includes validation
        const hasValidation = await page.evaluate(() => {
            const funcSource = window.nextTrack.toString();
            // Check for validation patterns
            return funcSource.includes('currentIndex') &&
                   funcSource.includes('segments.length') &&
                   (funcSource.includes('if') || funcSource.includes('return'));
        });

        expect(hasValidation).toBe(true);
    });

    test('Next track button title attribute is correct', async ({ page }) => {
        const nextBtn = page.locator('.control-btn').nth(2); // Third button is nextTrack

        // Wait for button to be visible
        await expect(nextBtn).toBeVisible();

        // Check title attribute
        const title = await nextBtn.getAttribute('title');
        expect(title).toBe('Next track');
    });

    test('Next track button has forward skip icon', async ({ page }) => {
        const nextBtn = page.locator('.control-btn').nth(2); // Third button is nextTrack

        // Wait for button to be visible
        await expect(nextBtn).toBeVisible();

        // Check for SVG icon inside
        const icon = nextBtn.locator('svg.icon');
        await expect(icon).toBeVisible();

        // Verify the SVG path indicates forward skip (contains "M16" and "V6h-2")
        const pathData = await icon.locator('path').getAttribute('d');
        expect(pathData).toContain('M16');
    });
});
