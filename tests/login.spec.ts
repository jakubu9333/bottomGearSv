import { browser } from '$app/environment';
import { test, expect } from '@playwright/test'

const LOCAL_URL = "http://localhost:5173"
test("when not logged the login screen is redirected", async ({ page }) => {
	await page.goto(LOCAL_URL)

	await page.waitForURL(`${LOCAL_URL}/login`)

	await expect(page).toHaveTitle(/Login/)
});

test("sucesfull login to test room", async ({ page }) => {

	await page.goto(`${LOCAL_URL}/login`)

	await page.getByPlaceholder("Prihlasovacie meno").fill("bot1")
	await page.getByPlaceholder("Meno roomky").fill("test_pre_botov")

	await page.getByRole("button", { name: 'Prihlásiť sa', exact: true }).click()


	await page.waitForURL(`${LOCAL_URL}/room`)
	await expect(page).toHaveURL(`${LOCAL_URL}/room`)
	await page.context().storageState({ path: 'playwright/.auth/user_bot.json' });
});

test("start of betting for one user", async ({ browser }) => {
	const bot_context = await browser.newContext({ storageState: "playwright/.auth/user_bot.json" })

	const admin_context = await browser.newContext()
	const bot_page = await bot_context.newPage()
	await bot_page.goto(`${LOCAL_URL}/room`)
	//await expect(bot_page.getByText("Žiadne kolo")).toBeVisible()

	const admin_req = await admin_context.request.post(`${LOCAL_URL}/api/duel`,
		{
			data: {
				firstName: "mario",
				secondName: "luigi"
			},
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})

	expect(admin_req.ok)
	await expect(bot_page.getByText("Žiadne kolo")).not.toBeVisible()
	await expect(bot_page.getByText("mario")).toBeVisible()


})
