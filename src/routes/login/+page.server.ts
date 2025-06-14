import { createUser } from '$lib/server/db/user';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { getRoomByName } from '$lib/server/db/room';

export const actions = {
    default: async ({ cookies, request, platform }) => {
        if (platform === undefined) {
            return fail(400)
        }
        const data = await request.formData()
        const username = data.get('username')
        const room = data.get('room')
        if (!username || username instanceof File || username.length == 0) {
            return fail(400, { username, missing: true });
        }
        if (!room || room instanceof File || room.length == 0) {
            return fail(400, { room, missing: true });
        }
        const roomFromDb = await getRoomByName(platform?.env, room)
        if (!roomFromDb) {
            return fail(400, { room, missing: true });
        }
        const user = await createUser(platform?.env, username, roomFromDb.id)
        const token = generateSessionToken();
        const session = await createSession(platform.env, token, user.id);
        setSessionTokenCookie(cookies, token, session.expiresAt);
        redirect(303, "/")
    }
} satisfies Actions;

