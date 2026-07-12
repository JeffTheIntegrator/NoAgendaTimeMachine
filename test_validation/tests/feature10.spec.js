const { test, expect } = require('@playwright/test');

test.describe('Feature #10: Larger Slider Button', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8081/index.html');

        // Dismiss the overlay to enable autoplay
        await page.click('.overlay');
        await page.waitForSelector('.overlay.hidden', { timeout: 5000 });
    });

    test('CSS rules define larger slider thumb (28px)', async ({ page }) => {
        // Check that the CSS rules include the larger thumb size
        const hasLargerThumb = await page.evaluate(() => {
            // Find all style sheets
            const sheets = document.styleSheets;
            for (let sheet of sheets) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                        const cssText = rule.cssText || '';
                        // Check for webkit-slider-thumb with 28px
                        if (cssText.includes('webkit-slider-thumb') && cssText.includes('28px')) {
                            return true;
                        }
                        // Check for moz-range-thumb with 28px
                        if (cssText.includes('moz-range-thumb') && cssText.includes('28px')) {
                            return true;
                        }
                    }
                } catch (e) {
                    // CORS may block access to some stylesheets
                }
            }
            return false;
        });

        expect(hasLargerThumb).toBe(true);
    });

    test('Timeline slider is touch-friendly (larger than original 20px)', async ({ page }) => {
        const timeline = page.locator('.timeline');

        // Wait for timeline to be visible
        await expect(timeline).toBeVisible();

        // Verify the slider is functional and has proper sizing
        const hasLargerThumb = await page.evaluate(() => {
            const styles = document.querySelectorAll('style');
            for (let style of styles) {
                const cssText = style.innerHTML;
                if (cssText.includes('webkit-slider-thumb') && cssText.includes('width: 28px')) {
                    return true;
                }
            }
            return false;
        });

        expect(hasLargerThumb).toBe(true);
    });

    test('Timeline slider thumb is defined for webkit browsers', async ({ page }) => {
        // Verify webkit-slider-thumb styling exists
        const hasWebkitThumb = await page.evaluate(() => {
            const styles = document.querySelectorAll('style');
            for (let style of styles) {
                const cssText = style.innerHTML;
                if (cssText.includes('::-webkit-slider-thumb')) {
                    return true;
                }
            }
            return false;
        });

        expect(hasWebkitThumb).toBe(true);
    });

    test('Timeline slider thumb is defined for Firefox', async ({ page }) => {
        // Verify moz-range-thumb styling exists
        const hasMozThumb = await page.evaluate(() => {
            const styles = document.querySelectorAll('style');
            for (let style of styles) {
                const cssText = style.innerHTML;
                if (cssText.includes('::-moz-range-thumb')) {
                    return true;
                }
            }
            return false;
        });

        expect(hasMozThumb).toBe(true);
    });

    test('Timeline slider thumb uses accent color', async ({ page }) => {
        // Verify the thumb uses the accent color
        const usesAccent = await page.evaluate(() => {
            const styles = document.querySelectorAll('style');
            for (let style of styles) {
                const cssText = style.innerHTML;
                // Check for accent color in slider thumb styles
                if ((cssText.includes('::-webkit-slider-thumb') || cssText.includes('::-moz-range-thumb')) &&
                    cssText.includes('background: var(--accent)')) {
                    return true;
                }
            }
            return false;
        });

        expect(usesAccent).toBe(true);
    });

    test('Timeline slider is interactive and functional', async ({ page }) => {
        const timeline = page.locator('.timeline');

        // Wait for timeline to be visible
        await expect(timeline).toBeVisible();

        // Verify the timeline has proper attributes
        const hasMin = await timeline.getAttribute('min');
        const hasMax = await timeline.getAttribute('max');
        const hasValue = await timeline.getAttribute('value');

        expect(hasMin).toBeTruthy();
        expect(hasMax).toBeTruthy();
        expect(hasValue).toBeTruthy();

        // Verify it's an input type range
        const inputType = await timeline.getAttribute('type');
        expect(inputType).toBe('range');
    });
});
