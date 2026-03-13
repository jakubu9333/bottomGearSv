import { test, expect, type Browser, type Page, type BrowserContext } from '@playwright/test';

test.describe.serial('Betting Functionality and Edge Cases', () => {
    // No top-level storageState - each test is responsible for its own login

    async function getRoomIntoBetting(browser: Browser) {
        const roomName = `bet_room_${Math.floor(Math.random() * 100000)}`
        const admin_context = await browser.newContext()
        const admin_page = await admin_context.newPage()

        // Login as new admin (admin_ name automatically makes it admin in dev)
        await admin_page.goto(`/login`)
        await admin_page.getByPlaceholder("Prihlasovacie meno").fill(`admin_bet_${Math.floor(Math.random() * 10000)}`)
        await admin_page.getByPlaceholder("Meno roomky").fill("test_pre_botov")
        await admin_page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()
        await expect(admin_page).toHaveURL(/\/room/)

        await admin_page.waitForTimeout(1000);

        await admin_page.goto(`/admin/room`)
        await expect(admin_page).toHaveURL(/\/admin\/room/)
        await admin_page.getByPlaceholder("Meno roomky").fill(roomName)
        await admin_page.getByPlaceholder("250").fill("250")
        await admin_page.getByRole("button", { name: "Vytvor roomku" }).click()
        await expect(admin_page).toHaveURL(/\/admin\/room\/\d+/)
        const roomId = admin_page.url().split("/").pop()!

        let cookies = await admin_context.cookies()
        let admin_token = cookies.find(c => c.name === 'session')?.value!

        const winnerName = `mario_0`
        const loserName = `luigi_0`

        const admin_req = await admin_context.request.post(`/api/duel`,
            {
                data: { firstName: winnerName, secondName: loserName },
                headers: { Authorization: `Bearer ${admin_token}` }
            })

        expect(admin_req.ok()).toBe(true)
        const duel = await admin_req.json()

        return { roomName, roomId, admin_token, admin_page, admin_context, duel }
    }

    async function joinRoom(browser: Browser, roomName: string) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const bot_name = `bet_bot_${Math.floor(Math.random() * 10000)}`
        await page.goto(`/login`)
        await page.getByPlaceholder("Prihlasovacie meno").fill(bot_name)
        await page.getByPlaceholder("Meno roomky").fill(roomName)

        const openPromise = page.waitForEvent('console', {
            filter: msg => msg.text() === 'open',
            timeout: 10000
        });

        await page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()
        await expect(page).toHaveURL(/\/room/)
        await openPromise;

        // extra wait to ensure socket is registered in DO
        await page.waitForTimeout(1000);

        // Wait for duel screen to be fully loaded
        await expect(page.getByTestId("moneyInput")).toBeVisible({ timeout: 15000 })
        return { page, context, bot_name }
    }

    test('Edge Case: Bet with 0 amount should be rejected or have no effect', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        const moneyInput = page.getByTestId("moneyInput")
        await moneyInput.fill("0")
        await page.getByTestId("duelBtn_0").click()
        await expect(page.getByTestId("zeroWarning")).toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('Edge Case: Bet with negative amount should be rejected', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        const moneyInput = page.getByTestId("moneyInput")
        await moneyInput.fill("-10")
        await page.waitForTimeout(500)
        await page.getByTestId("duelBtn_0").click()
        await expect(page.getByTestId("zeroWarning")).toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('Edge Case: Bet more than the current balance should be rejected', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        const moneyInput = page.getByTestId("moneyInput")
        await moneyInput.fill("500")
        await page.waitForTimeout(500)
        const val = await moneyInput.inputValue()
        expect(Number(val)).toBeLessThanOrEqual(250)

        await context.close()
        await admin_context.close()
    });

    test('Edge Case: Bet with a non-numeric value in the amount field', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        const moneyInput = page.getByTestId("moneyInput")
        await moneyInput.type("abc")
        const val = await moneyInput.inputValue()
        expect(Number(val) === 0 || val === "" || isNaN(Number(val))).toBe(true)

        await context.close()
        await admin_context.close()
    });

    test('User can skip betting on a round and their balance remains unchanged', async ({ browser }) => {
        const { roomName, roomId, admin_token, admin_page, admin_context, duel } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        const initialMoneyText = await page.getByText(/^Tvoj zostatok:/).first().innerText()
        const initialMoney = parseInt(initialMoneyText.match(/\d+/)?.[0] || "0")

        // Start the duel
        await page.request.post(`/api/duel/${duel.id}/start`, {
            headers: { Authorization: `Bearer ${admin_token}` }
        })

        await page.waitForTimeout(1000)

        // End the duel
        await page.request.post(`/api/duel/${duel.id}/end`, {
            data: { winner: duel.firstName },
            headers: { Authorization: `Bearer ${admin_token}` }
        })

        await expect(page.getByText("Kolo bolo ukončené")).toBeVisible({ timeout: 25000 })
        const finalMoneyText = await page.getByText(/^Tvoj zostatok:/).first().innerText()
        const finalMoney = parseInt(finalMoneyText.match(/\d+/)?.[0] || "0")
        expect(finalMoney).toBe(initialMoney)

        await context.close()
        await admin_context.close()
    });

    test('Multiple users placing bets concurrently updates the pool and ratios correctly', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)

        const { page: bot1Page, context: bot1Context } = await joinRoom(browser, roomName)
        const { page: bot2Page, context: bot2Context } = await joinRoom(browser, roomName)

        await bot1Page.getByTestId("moneyInput").fill("100")
        await bot1Page.getByTestId("duelBtn_0").click()

        await bot2Page.getByTestId("moneyInput").fill("100")
        await bot2Page.getByTestId("duelBtn_1").click()

        await expect(bot1Page.getByText("Kurz: 2.00")).toBeVisible({ timeout: 15000 })
        await expect(bot2Page.getByText("Kurz: 2.00")).toBeVisible({ timeout: 15000 })

        await bot1Context.close()
        await bot2Context.close()
        await admin_context.close()
    });

    test('Real-time: User sees their balance update after a bet is placed', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        const initialMoneyText = await page.getByText(/^Tvoj zostatok:/).first().innerText()
        const initialMoney = parseInt(initialMoneyText.match(/\d+/)?.[0] || "0")

        await page.getByTestId("moneyInput").fill("50")
        await page.getByTestId("duelBtn_0").click()

        await expect(page.getByText("Stávka úspešne prijatá")).toBeVisible()
        await expect(page.getByText(`${initialMoney - 50} 🪙`)).toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('Real-time: real time bet test happy refresh, change name', async ({ browser }) => {
        const { roomName, admin_context } = await getRoomIntoBetting(browser)
        const { page, context } = await joinRoom(browser, roomName)

        await page.getByTestId("moneyInput").fill("50")
        await page.getByTestId("duelBtn_0").click()
        await expect(page.getByText("Stávka úspešne prijatá")).toBeVisible()

        await page.reload()
        await expect(page.getByText("Stávka úspešne prijatá")).toBeVisible()

        // Change name
        await page.goto("/name")
        await page.getByPlaceholder("Nove meno").fill("NewName_bet")
        await page.getByRole("button", { name: "Zmenit" }).click()

        await page.goto("/room")
        await expect(page.getByText("Stávka úspešne prijatá")).toBeVisible()
        await expect(page.getByTestId("headerAvatar")).toHaveText("N")

        await context.close()
        await admin_context.close()
    });

    test.skip('Edge Case: Betting after the duel has been started/locked should be rejected', async ({ page }) => {
    });

    test.skip('Edge Case: bet is not reseted when user skip the stages', async ({ page }) => {
    });
});
