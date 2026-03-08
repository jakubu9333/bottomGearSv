import { test, expect, type Browser, type Page, type BrowserContext } from '@playwright/test';

test.describe.serial('Money Requests (Microtransactions)', () => {
    // Isolation: Each test starts from scratch

    async function setupRoom(browser: Browser) {
        const roomName = `req_room_${Math.floor(Math.random() * 100000)}`
        const admin_context = await browser.newContext()
        const admin_page = await admin_context.newPage()

        // Login as new admin (admin_ prefix for dev mode)
        await admin_page.goto(`/login`)
        await admin_page.getByPlaceholder("Prihlasovacie meno").fill(`admin_req_${Math.floor(Math.random() * 10000)}`)
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

        return { roomName, roomId, admin_token, admin_page, admin_context }
    }

    async function joinRoom(browser: Browser, roomName: string) {
        const context = await browser.newContext();
        const page = await context.newPage();
        // Use a longer random suffix to avoid "req_bot_9" matching "req_bot_91"
        const bot_name = `req_bot_${Math.floor(Math.random() * 1000000)}`
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
        return { page, context, bot_name }
    }

    async function openRequestDialog(page: Page) {
        // Direct approach: Trigger the modal via JavaScript to avoid flakey dropdowns
        await page.evaluate(() => {
            const headings = Array.from(document.querySelectorAll('h3'));
            const reqHeading = headings.find(h => h.textContent === 'Request coins');
            if (reqHeading) {
                const d = reqHeading.closest('dialog');
                if (d) d.showModal();
            }
        });

        await expect(page.getByRole("heading", { name: "Request coins" })).toBeVisible({ timeout: 15000 });
    }

    test('Successful user creation of a money request', async ({ browser }) => {
        const { roomName, admin_context } = await setupRoom(browser)
        const { page, context } = await joinRoom(browser, roomName)

        await openRequestDialog(page);

        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("500")
        await page.getByRole("button", { name: "Confirm Request" }).click()

        await expect(page.getByRole("heading", { name: "Request coins" })).not.toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('Request is disabled when betting is in progress', async ({ browser }) => {
        const { roomName, admin_token, admin_context } = await setupRoom(browser)
        const { page, context } = await joinRoom(browser, roomName)

        // Start a duel to change state
        await page.request.post(`/api/duel`, {
            data: { firstName: "A", secondName: "B" },
            headers: { Authorization: `Bearer ${admin_token}` }
        })

        await page.reload();
        const avatar = page.getByTestId("headerAvatar");
        await avatar.click({ force: true });
        // Header button for requesting coins should NOT be visible when betting is in progress
        await expect(page.getByRole("button", { name: "Request Coins" })).not.toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('Edge Case: Requesting 0 or negative money is rejected', async ({ browser }) => {
        const { roomName, admin_context } = await setupRoom(browser)
        const { page, context } = await joinRoom(browser, roomName)

        await openRequestDialog(page);

        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("-100")
        await page.getByRole("button", { name: "Confirm Request" }).click()
        await expect(page.getByRole("heading", { name: "Request coins" })).not.toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('Edge Case: Requesting more than the allowed maximum amount', async ({ browser }) => {
        const { roomName, admin_context } = await setupRoom(browser)
        const { page, context } = await joinRoom(browser, roomName)

        await openRequestDialog(page);

        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("2000")

        await page.getByRole("button", { name: "Confirm Request" }).click()
        await expect(page.getByRole("heading", { name: "Request coins" })).not.toBeVisible()

        await context.close()
        await admin_context.close()
    });

    async function openAdminPendingDialog(page: Page) {
        await page.evaluate(() => {
            const headings = Array.from(document.querySelectorAll('h3'));
            const reqHeading = headings.find(h => h.textContent === 'Pending Money Requests');
            if (reqHeading) {
                const d = reqHeading.closest('dialog');
                if (d) d.showModal();
            }
        });

        await expect(page.getByRole("heading", { name: "Pending Money Requests" })).toBeVisible({ timeout: 15000 });
    }

    test('Admin: List pending money requests for approval', async ({ browser }) => {
        const { roomName, admin_page, admin_context } = await setupRoom(browser)
        const { page, context, bot_name } = await joinRoom(browser, roomName)

        await openRequestDialog(page);
        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("300")
        await page.getByRole("button", { name: "Confirm Request" }).click()

        // Admin checks
        await admin_page.goto(`/room`)
        await openAdminPendingDialog(admin_page);

        // Wait for list item to be visible
        await expect(admin_page.locator("li").filter({ hasText: new RegExp("^" + bot_name + " requested") })).toBeVisible({ timeout: 15000 })

        await context.close()
        await admin_context.close()
    });

    test('Admin: Successfully approve a money request', async ({ browser }) => {
        const { roomName, admin_page, admin_context } = await setupRoom(browser)
        const { page, context, bot_name } = await joinRoom(browser, roomName)

        const initialMoney = 250 // default

        await openRequestDialog(page);
        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("100")
        await page.getByRole("button", { name: "Confirm Request" }).click()

        // Admin approves
        await admin_page.goto(`/room`)
        await openAdminPendingDialog(admin_page);
        const listItem = admin_page.locator("li").filter({ hasText: new RegExp("^" + bot_name + " requested") });
        await expect(listItem).toBeVisible({ timeout: 15000 });
        await listItem.getByRole("button", { name: "✅" }).click()

        // Bot sees update
        await expect(page.getByText(`${initialMoney + 100} 🪙`)).toBeVisible({ timeout: 20000 })

        await context.close()
        await admin_context.close()
    });

    test('Admin: Successfully reject a money request', async ({ browser }) => {
        const { roomName, admin_page, admin_context } = await setupRoom(browser)
        const { page, context, bot_name } = await joinRoom(browser, roomName)

        await openRequestDialog(page);
        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("100")
        await page.getByRole("button", { name: "Confirm Request" }).click()

        // Admin rejects
        await admin_page.goto(`/room`)
        await openAdminPendingDialog(admin_page);
        const listItem = admin_page.locator("li").filter({ hasText: new RegExp("^" + bot_name + " requested") });
        await expect(listItem).toBeVisible({ timeout: 15000 });
        await listItem.getByRole("button", { name: "❌" }).click()

        // Verify it disappears for admin
        await expect(listItem).not.toBeVisible({ timeout: 10000 })

        // Bot balance unchanged
        await expect(page.getByText(`250 🪙`)).toBeVisible()

        await context.close()
        await admin_context.close()
    });

    test('User: sees their balance increase immediately after an admin approves the request', async ({ browser }) => {
        const { roomName, admin_page, admin_context } = await setupRoom(browser)
        const { page, context, bot_name } = await joinRoom(browser, roomName)

        await openRequestDialog(page);
        const amountInput = page.locator("#amount")
        await expect(amountInput).toBeVisible()
        await amountInput.fill("150")
        await page.getByRole("button", { name: "Confirm Request" }).click()

        // Admin approves
        await admin_page.goto(`/room`)
        await openAdminPendingDialog(admin_page);
        const listItem = admin_page.locator("li").filter({ hasText: new RegExp("^" + bot_name + " requested") });
        await expect(listItem).toBeVisible({ timeout: 15000 });
        await listItem.getByRole("button", { name: "✅" }).click()

        await expect(page.getByText("400 🪙")).toBeVisible({ timeout: 20000 })

        await context.close()
        await admin_context.close()
    });

    test.skip('Edge Case: Approving or rejecting an already processed request should fail', async ({ page }) => {
    });

    test.skip('Edge Case: creation during the state change', async ({ page }) => {
    });

    test.skip('User: cannot create money request when request is in progress', async ({ page }) => {
    });
});
