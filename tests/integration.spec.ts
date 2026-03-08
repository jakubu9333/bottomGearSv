import { test, expect } from '@playwright/test';

test.describe.serial('End-to-End Integration Flows', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("sucesfull happypath of one user winning", async ({ browser }) => {
        const roomName = `int_room_${Math.floor(Math.random() * 100000)}`

        const admin_context = await browser.newContext()
        const admin_page = await admin_context.newPage()

        // Login as admin
        const setupRoom = "test_pre_botov"
        await admin_page.goto(`/login`)
        await admin_page.getByPlaceholder("Prihlasovacie meno").fill(`admin_int_${Math.floor(Math.random() * 10000)}`)
        await admin_page.getByPlaceholder("Meno roomky").fill(setupRoom)
        await admin_page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()
        await expect(admin_page).toHaveURL(/\/room/)

        await admin_page.waitForTimeout(1000);

        let cookies = await admin_context.cookies()
        let admin_token = cookies.find(c => c.name === 'session')?.value
        if (!admin_token) throw new Error("Could not find session token for admin")

        // Admin creates a UNIQUE room
        await admin_page.goto(`/admin/room`)
        await admin_page.getByPlaceholder("Meno roomky").fill(roomName)
        await admin_page.getByPlaceholder("250").fill("250")
        await admin_page.getByRole("button", { name: "Vytvor roomku" }).click()
        await expect(admin_page).toHaveURL(/\/admin\/room\/\d+/)

        const bot_context = await browser.newContext();
        const bot_page = await bot_context.newPage();

        // Bot joins the UNIQUE room
        await bot_page.goto(`/login`)
        const botName = `bot_int_${Math.floor(Math.random() * 10000)}`;
        await bot_page.getByPlaceholder("Prihlasovacie meno").fill(botName)
        await bot_page.getByPlaceholder("Meno roomky").fill(roomName)

        const openPromise = bot_page.waitForEvent('console', {
            filter: msg => msg.text() === 'open',
            timeout: 10000
        });

        await bot_page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()

        await expect(bot_page).toHaveURL(/\/room/)
        await openPromise;
        // extra wait to ensure socket is registered in DO
        await bot_page.waitForTimeout(1000);

        const winnerName = botName;
        const loserName = `luigi_${Math.floor(Math.random() * 10000)}`

        const admin_req = await admin_context.request.post(`/api/duel`,
            {
                data: {
                    firstName: winnerName,
                    secondName: loserName
                },
                headers: { Authorization: `Bearer ${admin_token}` }
            })

        expect(admin_req.ok()).toBe(true)

        // Wait for the UI to transition to the duel screen
        await expect(bot_page.getByText("Nová stávka na duel")).toBeVisible({ timeout: 20000 })
        await expect(bot_page.getByText(winnerName)).toBeVisible({ timeout: 20000 })

        const bet_amount = "50"
        const moneyInput = bot_page.getByRole("spinbutton")
        await moneyInput.fill(bet_amount)

        const winnerButton = bot_page.getByRole("button", { name: winnerName })
        await winnerButton.click()

        await expect(bot_page.getByText("Stávka úspešne prijatá")).toBeVisible()

        const duelID = await admin_req.json().then(duel => duel.id)

        // Start the duel (close betting)
        const admin_req_start = await admin_context.request.post(`/api/duel/${duelID}/start`,
            {
                headers: { Authorization: `Bearer ${admin_token}` }
            })
        expect(admin_req_start.ok()).toBe(true)

        // End the duel with a winner
        const admin_req_end = await admin_context.request.post(`/api/duel/${duelID}/end`,
            {
                data: {
                    winner: winnerName
                },
                headers: { Authorization: `Bearer ${admin_token}` }
            })
        expect(admin_req_end.ok()).toBe(true)

        // Verify user got the money
        await expect(bot_page.getByText("Kolo bolo ukončené")).toBeVisible({ timeout: 20000 })

        // Use .first() to avoid strict mode violation with leaderboard rows
        const balanceArea = bot_page.locator('.card-body').getByText(/Tvoj zostatok:/).first();
        await expect(balanceArea).toBeVisible();
        await expect(balanceArea.locator('span')).toBeVisible();

        await bot_context.close();
        await admin_context.close();
    })
});
