import { createSession, generateSessionToken } from "$lib/server/auth";
import { getUser } from "$lib/server/db/user";
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
    }
} satisfies Actions;
