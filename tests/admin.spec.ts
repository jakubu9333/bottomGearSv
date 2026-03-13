import { test, expect } from '@playwright/test';

test.describe('Admin Dashboards and Controls', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.skip('Admin can reset a room if something goes wrong', async ({ page }) => {
        // Implementation for room reset check
        // reset room realtime for user
    });
});

test.describe('Admin Dashboards and Controls user', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Unauthorized users are blocked from admin routes', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Login as regular user (NO admin_ prefix)
        const username = `regular_user_${Math.floor(Math.random() * 10000)}`;
        await page.goto(`/login`);
        await page.getByPlaceholder("Prihlasovacie meno").fill(username);
        await page.getByPlaceholder("Meno roomky").fill("test_pre_botov");
        await page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click();

        await expect(page).toHaveURL(/\/room/);

        const pageResponse = await page.goto("/admin/room")
        expect(pageResponse?.status()).toBe(403)

        await context.close();
    });
});
