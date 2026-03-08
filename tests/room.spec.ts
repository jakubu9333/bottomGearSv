import { test, expect, type Browser, type Page, type BrowserContext } from '@playwright/test';

test.describe.serial('Room Management and Real-time Updates', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    const ADMIN_PREFIX = 'admin_room_';
    const BOT_PREFIX = 'bot_room_';
    const ROOM_PREFIX = 'test_room_';

    async function createRoomAsAdmin(browser: Browser) {
        const roomName = `${ROOM_PREFIX}${Math.floor(Math.random() * 100000)}`;
        const admin_context = await browser.newContext();
        const admin_page = await admin_context.newPage();

        // Login as new admin (admin_ name automatically makes it admin in dev)
        await admin_page.goto(`/login`);
        await admin_page.getByPlaceholder("Prihlasovacie meno").fill(`${ADMIN_PREFIX}${Math.floor(Math.random() * 10000)}`);
        await admin_page.getByPlaceholder("Meno roomky").fill("test_pre_botov");
        await admin_page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click();
        await expect(admin_page).toHaveURL(/\/room/);

        await admin_page.waitForTimeout(1000);

        await admin_page.goto(`/admin/room`);
        await expect(admin_page).toHaveURL(/\/admin\/room/);
        await admin_page.getByPlaceholder("Meno roomky").fill(roomName);
        await admin_page.getByPlaceholder("250").fill("250");
        await admin_page.getByRole("button", { name: "Vytvor roomku" }).click();
        await expect(admin_page).toHaveURL(/\/admin\/room\/\d+/);
        const roomId = admin_page.url().split("/").pop()!;

        let cookies = await admin_context.cookies();
        let admin_token = cookies.find(c => c.name === 'session')?.value!;

        return { roomName, roomId, admin_token, admin_page, admin_context };
    }

    async function joinRoom(browser: Browser, roomName: string, botName?: string) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const name = botName || `${BOT_PREFIX}${Math.floor(Math.random() * 10000)}`;
        await page.goto(`/login`);
        await page.getByPlaceholder("Prihlasovacie meno").fill(name);
        await page.getByPlaceholder("Meno roomky").fill(roomName);

        const openPromise = page.waitForEvent('console', {
            filter: msg => msg.text() === 'open',
            timeout: 15000
        });

        await page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click();
        await expect(page).toHaveURL(/\/room/);
        await openPromise;
        // extra wait to ensure socket is registered in DO
        await page.waitForTimeout(1000);
        return { page, context, name };
    }

    test('Successful creation of a new room by an admin', async ({ browser }) => {
        const { roomName, admin_page, admin_context } = await createRoomAsAdmin(browser);
        expect(roomName).toContain(ROOM_PREFIX);
        await admin_page.close();
        await admin_context.close();
    });

    test('Edge Case: Joining a non-existent room should result in an error message', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const roomName = "non_existent_room_" + Math.floor(Math.random() * 100000);
        await page.goto(`/login`);
        await page.getByPlaceholder("Prihlasovacie meno").fill(`${BOT_PREFIX}fail`);
        await page.getByPlaceholder("Meno roomky").fill(roomName);
        await page.getByRole("button", { name: "Prihlásiť sa", exact: true }).click();

        await expect(page.getByText("room not found")).toBeVisible();
        await context.close();
    });

    test('Real-time: User joining a room is immediately visible to admin', async ({ browser }) => {
        const { roomName, admin_page, admin_context } = await createRoomAsAdmin(browser);

        const { page: botPage, context: botContext, name: botName } = await joinRoom(browser, roomName);

        await expect(admin_page.getByText(botName)).toBeVisible({ timeout: 5000 });

        await botContext.close();
        await admin_context.close();
    });

    test('Real-time: Receiving leaderboard updates when a duel ends', async ({ browser }) => {
        const { roomName, roomId, admin_token, admin_page, admin_context } = await createRoomAsAdmin(browser);

        const { page: bot1Page, context: bot1Context, name: bot1Name } = await joinRoom(browser, roomName);
        const { page: bot2Page, context: bot2Context, name: bot2Name } = await joinRoom(browser, roomName);

        // Ensure both see the lobby
        await expect(bot1Page.getByText("Žiadne aktívne kolo")).toBeVisible({ timeout: 10000 });
        await expect(bot2Page.getByText("Žiadne aktívne kolo")).toBeVisible({ timeout: 10000 });

        const admin_req = await admin_context.request.post(`/api/duel`, {
            data: { firstName: bot1Name, secondName: bot2Name },
            headers: { Authorization: `Bearer ${admin_token}` }
        });
        const duel = await admin_req.json();

        await expect(bot1Page.getByTestId("moneyInput")).toBeVisible({ timeout: 15000 });
        await expect(bot2Page.getByTestId("moneyInput")).toBeVisible({ timeout: 15000 });

        await bot1Page.getByTestId("moneyInput").fill("100");
        await bot1Page.getByRole("button", { name: bot1Name }).click();
        await bot2Page.getByTestId("moneyInput").fill("100");
        await bot2Page.getByRole("button", { name: bot2Name }).click();

        // Start duel (betting ends)
        await admin_context.request.post(`/api/duel/${duel.id}/start`, {
            headers: { Authorization: `Bearer ${admin_token}` }
        });

        await bot1Page.waitForTimeout(1000);

        // End duel with Bot 1 winning
        await admin_context.request.post(`/api/duel/${duel.id}/end`, {
            data: { winner: bot1Name },
            headers: { Authorization: `Bearer ${admin_token}` }
        });

        // Wait for RoundEnded state and leaderboard refresh
        await expect(bot1Page.getByText("Kolo bolo ukončené")).toBeVisible({ timeout: 20000 });
        await expect(bot2Page.getByText("Kolo bolo ukončené")).toBeVisible({ timeout: 20000 });

        // Tvoj zostatok summary - using .first() to avoid strict mode violation
        await expect(bot1Page.locator('.card-body').getByText(/Tvoj zostatok:/).first().locator('span', { hasText: '350' })).toBeVisible({ timeout: 20000 });
        await expect(bot2Page.locator('.card-body').getByText(/Tvoj zostatok:/).first().locator('span', { hasText: '150' })).toBeVisible({ timeout: 20000 });

        await bot1Context.close();
        await bot2Context.close();
        await admin_context.close();
    });
});
