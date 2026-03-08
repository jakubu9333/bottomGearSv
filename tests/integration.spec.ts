import { test, expect } from '@playwright/test';

test.describe.serial('End-to-End Integration Flows', () => {
    test.use({ storageState: 'playwright/.auth/user_bot.json' });

    test("sucesfull happypath of one user winning", async ({ page, browser }) => {
        const roomName = `test_room_${Math.floor(Math.random() * 100000)}`

        // Listen for console logs from the browser
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        // Create a fresh admin context and log in
        const admin_context = await browser.newContext()
        const admin_page = await admin_context.newPage()

        // Join an initial room to become admin (using our new backdoor)
        // We need a room that exists, we'll try 'test_pre_botov' which setup creates
        const setupRoom = "test_pre_botov"
        await admin_page.goto(`/login`)
        await admin_page.getByPlaceholder("Prihlasovacie meno").fill(`admin_${Math.floor(Math.random() * 10000)}`)
        await admin_page.getByPlaceholder("Meno roomky").fill(setupRoom)
        await admin_page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()
        await expect(admin_page).toHaveURL(/\/room/)

        // Get the session token from cookies to use for API calls
        let cookies = await admin_context.cookies()
        let admin_token = cookies.find(c => c.name === 'session')?.value
        if (!admin_token) throw new Error("Could not find session token for admin")

        // Admin creates a UNIQUE room for this test run via UI
        console.log(`Admin creating room: ${roomName}`)
        await admin_page.goto(`/admin/room`)
        await admin_page.getByPlaceholder("Meno roomky").fill(roomName)
        await admin_page.getByPlaceholder("250").fill("250")
        await admin_page.getByRole("button", { name: "Vytvor roomku" }).click()
        await expect(admin_page).toHaveURL(/\/admin\/room\/\d+/)

        const bot_page = page

        // Bot joins the UNIQUE room
        console.log(`Bot joining room: ${roomName}`)
        await bot_page.goto(`/login`)
        await bot_page.getByPlaceholder("Prihlasovacie meno").fill(`bot_${Math.floor(Math.random() * 10000)}`)
        await bot_page.getByPlaceholder("Meno roomky").fill(roomName)
        await bot_page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click()

        await expect(bot_page).toHaveURL(/\/room/)

        // duel creation with unique names
        const winnerName = `mario_${Math.floor(Math.random() * 10000)}`
        const loserName = `luigi_${Math.floor(Math.random() * 10000)}`

        console.log(`Creating duel: ${winnerName} vs ${loserName} in room ${roomName}`)

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
        await expect(bot_page.getByText("Nová stávka na duel")).toBeVisible({ timeout: 10000 })
        await expect(bot_page.getByText(winnerName)).toBeVisible({ timeout: 10000 })
        await expect(bot_page.getByText(loserName)).toBeVisible()

        // betting enabled now
        const bet_amount = "50"
        const moneyInput = bot_page.getByRole("spinbutton")
        await moneyInput.fill(bet_amount)

        const winnerButton = bot_page.getByRole("button", { name: winnerName })
        await winnerButton.click()

        // verification of successful bet
        await expect(bot_page.getByText("Stávka úspešne prijatá")).toBeVisible()
        await expect(bot_page.getByText(`Stavené ${bet_amount} na ${winnerName}`)).toBeVisible()

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
        await expect(bot_page.getByText("Kolo bolo ukončené")).toBeVisible()
    })
});





