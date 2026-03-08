import { test, expect } from '@playwright/test';

test.describe('Authentication and User Profile unloged user', () => {
    // Override storageState for this describe block to ensure we are logged out
    test.use({ storageState: { cookies: [], origins: [] } });

    test("when not logged the login screen is redirected", async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(`/login`);
        await expect(page).toHaveTitle(/Login/);
    });

    test('Accessing /room directly when not logged in redirects to /login', async ({ page }) => {
        await page.goto("/room")
        await page.waitForURL('/login');
        await expect(page).toHaveURL('/login');
    });
})

test.describe('Authentication and User Profile logged user', () => {
    test.use({ storageState: 'playwright/.auth/user_bot.json' });

    test.skip('User can log out and is redirected to login page', async ({ page }) => {
        // Implementation for logout
        // not implemented
    });

    test('Session persistence: user remains logged in after page refresh', async ({ page }) => {
        await page.goto("/room")
        await page.waitForURL('/room');
        await expect(page).toHaveURL('/room');
        await page.reload()
        await expect(page).toHaveURL('/room');
    });

    test('User can change their display name', async ({ page }) => {
        await page.goto("/")
        await page.waitForURL('/');
        await page.getByTestId("headerAvatar").click()
        await page.getByTestId("headerChangeName").click()
        await page.waitForURL("/name")
        const newName = "janko spaniel"

        await page.getByPlaceholder("Nove meno").fill(newName)
        await page.getByRole("button", { name: "Zmenit" }).click()

        await page.waitForURL("/")
        await expect(page.getByText(newName)).toBeVisible()
    });

});
