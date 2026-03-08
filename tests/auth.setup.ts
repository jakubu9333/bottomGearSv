import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user_bot.json';
const adminFile = 'playwright/.auth/admin.json';

setup('authenticate as bot', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder("Prihlasovacie meno").fill("bot1");
    await page.getByPlaceholder("Meno roomky").fill("test_pre_botov");
    await page.getByRole("button", { name: 'Prihlásiť sa', exact: true }).click();

    await page.waitForURL('/room');
    await expect(page).toHaveURL('/room');

    // Save authentication state.
    await page.context().storageState({ path: authFile });
});
setup("auth as dev admin", async ({ page }) => {

    // Join an initial room to become admin (using our new backdoor)
    // We need a room that exists, we'll try 'test_pre_botov' which setup creates
    const setupRoom = "test_pre_botov"
    await page.goto(`/login`)
    await page.getByPlaceholder("Prihlasovacie meno").fill(`admin_${Math.floor(Math.random() * 10000)}`)
    await page.getByPlaceholder("Meno roomky").fill(setupRoom)
    await page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()
    await expect(page).toHaveURL(/\/room/)
    await page.context().storageState({ path: adminFile });
})
