import { test, expect } from '@playwright/test';

test.describe('Admin Dashboards and Controls', () => {
    test.use({ storageState: 'playwright/.auth/admin_bot.json' });
    test.skip('Edge Case: Start a duel with invalid runner names', async ({ page }) => {
        // Implementation for runner name validation check
    });

    test.skip('Admin can reset a room if something goes wrong', async ({ page }) => {
        // Implementation for room reset check
    });

    test.skip('Edge case: reset room goes wrong', async ({ page }) => {
        // Implementation for room reset check
    });
});

test.describe('Admin Dashboards and Controls user', () => {
    test.use({ storageState: 'playwright/.auth/user_bot.json' });

    test('Unauthorized users are blocked from admin routes', async ({ page }) => {
        await page.goto("/room")
        await page.waitForURL('/room');
        await expect(page).toHaveURL('/room');

        const pageResponse = await page.goto("/admin/room")
        await expect(page).toHaveURL('/admin/room');
        expect(pageResponse?.status()).toBe(403)
    });
});
