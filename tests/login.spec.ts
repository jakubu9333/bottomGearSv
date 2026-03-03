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


test("sucesfull happypath of one user winning", async ({ browser }) => {
	const bot_context = await browser.newContext({ storageState: "playwright/.auth/user_bot.json" })

	const admin_context = await browser.newContext()
	const bot_page = await bot_context.newPage()
	await bot_page.goto(`${LOCAL_URL}/room`)
	await bot_page.waitForTimeout(1000)
	//duel creation
	const winnerName = "mario"
	const loserName = "luigi"
	const admin_req = await admin_context.request.post(`${LOCAL_URL}/api/duel`,
		{
			data: {
				firstName: winnerName,
				secondName: loserName
			},
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})

	expect(admin_req.ok()).toBe(true)
	await expect(bot_page.getByText("Žiadne kolo")).not.toBeVisible()
	await expect(bot_page.getByText("Kolo skončilo")).not.toBeVisible()
	await expect(bot_page.getByText(winnerName)).toBeVisible()
	await expect(bot_page.getByText(loserName)).toBeVisible()
	//beting enabled now
	const bet_amount = "50"
	await bot_page.getByLabel("💰 Vybraná suma").fill(bet_amount)
	await bot_page.getByRole("button", { name: winnerName }).click()
	//no other bets
	await expect(bot_page.getByText("Stávka zaregistrovaná")).toBeVisible()
	await expect(bot_page.getByText(`vsadil si ${bet_amount} na ${winnerName}`)).toBeVisible()

	await expect(bot_page.getByText(`vyhra je ${bet_amount}`)).toBeVisible()
	await expect(bot_page.getByText(`zisk je 0`)).toBeVisible()

	const duelID = await admin_req.json().then(duel => duel.id)

	const admin_req_end_betting = await admin_context.request.post(`${LOCAL_URL}/api/duel/${duelID}/start`,
		{
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})
	expect(admin_req_end_betting.ok()).toBe(true)

	const admin_req_end_duel = await admin_context.request.post(`${LOCAL_URL}/api/duel/${duelID}/end`,
		{
			data: {
				winner: winnerName
			},
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})
	expect(admin_req_end_duel.ok()).toBe(true)


})

test("empty duel for reset", async ({ page }) => {
	const admin_context = page
	const winnerName = "mario"
	const loserName = "luigi"
	const admin_req = await admin_context.request.post(`${LOCAL_URL}/api/duel`,
		{
			data: {
				firstName: winnerName,
				secondName: loserName
			},
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})

	expect(admin_req.ok()).toBe(true)
	const duelID = await admin_req.json().then(duel => duel.id)
	const admin_req_end_betting = await admin_context.request.post(`${LOCAL_URL}/api/duel/${duelID}/start`,
		{
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})
	expect(admin_req_end_betting.ok()).toBe(true)
	const admin_req_end_duel = await admin_context.request.post(`${LOCAL_URL}/api/duel/${duelID}/end`,
		{
			data: {
				winner: winnerName
			},
			headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
		})
	expect(admin_req_end_duel.ok()).toBe(true)
})

//todo zero or more money than i have in bet not corect number in betting, refreshe skipniutie stavky
