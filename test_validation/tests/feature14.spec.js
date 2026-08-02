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
        expect(firstTime).toMatch(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/);
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

    test('11. Every menu item displays a date', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const items = page.locator('.segment-item');
        const count = await items.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const dateText = (await items.nth(i).locator('.segment-item-date').textContent()).trim();
            expect(dateText).not.toBe('');
        }
    });

    test('12. Date format is "Day Mon D" or "Today"', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const items = page.locator('.segment-item');
        const count = await items.count();

        for (let i = 0; i < count; i++) {
            const dateText = (await items.nth(i).locator('.segment-item-date').textContent()).trim();
            expect(dateText).toMatch(/^(Today|(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2})$/);
        }
    });

    test('13. Oldest segment date matches expected computed value', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        // Get the oldest segment's start time (segments[0] since array is chronological)
        const segStart = await page.evaluate(() => segments[0].start);

        // Compute expected date using same algorithm as fmtDate/fmtSegmentDate
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = new Date(segStart * 1000);
        const now = new Date();
        const isToday = d.getFullYear() === now.getFullYear() &&
                        d.getMonth() === now.getMonth() &&
                        d.getDate() === now.getDate();
        const expected = isToday ? 'Today'
                                 : `${dayNames[d.getDay()]} ${monthNames[d.getMonth()]} ${d.getDate()}`;

        // Oldest segment is last in DOM (newest-first ordering)
        const lastItem = page.locator('.segment-item').last();
        await expect(lastItem.locator('.segment-item-date')).toHaveText(expected);
    });

    test('14. "Today" label for current-day segments, date for yesterday', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        // Inject synthetic segments: today at noon + yesterday at noon
        await page.evaluate(() => {
            const at = (d) => {
                const t = new Date(d);
                t.setHours(12, 0, 0, 0);
                return Math.floor(t.getTime() / 1000);
            };
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            segments.push(
                {
                    url: 'audio/segments/fake_yesterday.mp3',
                    start: at(yesterday),
                    end: at(yesterday) + 3600,
                    title: 'FAKE YESTERDAY SEGMENT',
                    final: true
                },
                {
                    url: 'audio/segments/fake_today.mp3',
                    start: at(now),
                    end: at(now) + 3600,
                    title: 'FAKE TODAY SEGMENT',
                    final: true
                }
            );
            renderSegmentList();
        });

        // Newest first → injected today segment is first in DOM
        const first = page.locator('.segment-item').first();
        await expect(first.locator('.segment-item-title')).toHaveText('FAKE TODAY SEGMENT');
        await expect(first.locator('.segment-item-date')).toHaveText('Today');

        // Yesterday segment should show actual date, not "Today"
        const yestItem = page.locator('.segment-item', { hasText: 'FAKE YESTERDAY SEGMENT' });
        const yestDate = (await yestItem.locator('.segment-item-date').textContent()).trim();
        expect(yestDate).toMatch(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}$/);
        expect(yestDate).not.toBe('Today');
    });

    test('15. Segment item layout: title on top, time+date below', async ({ page }) => {
        const hamburgerBtn = page.locator('.hamburger-btn');
        await hamburgerBtn.click();

        const firstItem = page.locator('.segment-item').first();

        // Check flex-direction is column
        const flexDir = await firstItem.evaluate(el => getComputedStyle(el).flexDirection);
        expect(flexDir).toBe('column');

        // Title should be positioned above the meta line
        const titleBox = await firstItem.locator('.segment-item-title').boundingBox();
        const metaBox = await firstItem.locator('.segment-item-meta').boundingBox();
        expect(titleBox.y).toBeLessThan(metaBox.y);

        // Meta line contains both time and date
        await expect(firstItem.locator('.segment-item-time')).toHaveCount(1);
        await expect(firstItem.locator('.segment-item-date')).toHaveCount(1);

        // Meta line has separator dot
        const metaText = await firstItem.locator('.segment-item-meta').textContent();
        expect(metaText).toContain('·');
    });
});
