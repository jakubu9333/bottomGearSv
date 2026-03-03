import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user_bot.json';

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
