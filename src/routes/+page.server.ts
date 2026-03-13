import { createSession, generateSessionToken } from "$lib/server/auth";
import { getUser, joinRoomByName } from "$lib/server/db/user";
import { getPendingMoneyRequests } from "$lib/server/db/money_request";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
    const userId = locals.userId
    const user = await getUser(platform?.env!!, userId)

    return {
        user
    }
}

export const actions = {
    token: async (event) => {
        const token = generateSessionToken()
        await createSession(event.platform?.env!!, token, event.locals.userId)
        return { token }
    },
    joinRoom: async ({ request, platform, locals }) => {
        const data = await request.formData();
        const roomName = data.get('roomName');
        if (!roomName) {
            return fail(400, { roomName, missing: true });
        }
        const result = await joinRoomByName(platform?.env!!, roomName.toString(), locals.userId);
        if ('error' in result) {
            return fail(404, { error: result.error });
        }
        throw redirect(303, `/room`)
    }
} satisfies Actions;
