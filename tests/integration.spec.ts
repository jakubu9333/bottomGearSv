import { test, expect } from '@playwright/test';

test.describe.serial('End-to-End Integration Flows', () => {
    test.use({ storageState: 'playwright/.auth/user_bot.json' });

    test("sucesfull happypath of one user winning", async ({ page, browser }) => {
        // ... (implementation same as before)
        const admin_context = await browser.newContext()
        const bot_page = page
        await bot_page.goto(`/room`)
        await bot_page.waitForTimeout(1000)

        // duel creation
        const winnerName = "mario"
        const loserName = "luigi"
        const admin_req = await admin_context.request.post(`/api/duel`,
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

        // betting enabled now
        const bet_amount = "50"
        await bot_page.getByLabel("💰 Vybraná suma").fill(bet_amount)
        await bot_page.getByRole("button", { name: winnerName }).click()

        // no other bets
        await expect(bot_page.getByText("Stávka zaregistrovaná")).toBeVisible()
        await expect(bot_page.getByText(`vsadil si ${bet_amount} na ${winnerName}`)).toBeVisible()

        await expect(bot_page.getByText(`vyhra je ${bet_amount}`)).toBeVisible()
        await expect(bot_page.getByText(`zisk je 0`)).toBeVisible()

        const duelID = await admin_req.json().then(duel => duel.id)

        const admin_req_end_betting = await admin_context.request.post(`/api/duel/${duelID}/start`,
            {
                headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
            })
        expect(admin_req_end_betting.ok()).toBe(true)

        const admin_req_end_duel = await admin_context.request.post(`/api/duel/${duelID}/end`,
            {
                data: {
                    winner: winnerName
                },
                headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
            })
        expect(admin_req_end_duel.ok()).toBe(true)
    })

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const winnerName = "cleanup-winner"
        const loserName = "cleanup-loser"
        const admin_req = await context.request.post(`/api/duel`,
            {
                data: {
                    firstName: winnerName,
                    secondName: loserName
                },
                headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
            })

        if (admin_req.ok()) {
            const duelID = await admin_req.json().then(duel => duel.id)
            await context.request.post(`/api/duel/${duelID}/start`,
                {
                    headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
                })
            await context.request.post(`/api/duel/${duelID}/end`,
                {
                    data: {
                        winner: winnerName
                    },
                    headers: { Authorization: "Bearer xqm3wbskvhuo5cpautlfccnsqenxxp25" }
                })
        }
    })
});
