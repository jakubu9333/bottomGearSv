import { dev } from '$app/environment';
import { createUser } from '$lib/server/db/user';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { getRoomByName } from '$lib/server/db/room';
import { sendSocketMessage } from '$lib/server/durrable';

export const actions = {
    default: async ({ cookies, request, platform }) => {
        if (platform === undefined) {
            return fail(400)
        }
        const data = await request.formData()
        const username = data.get('username')
        if (!username || username instanceof File || username.length == 0) {
            return fail(400, { error: "username is missing" });
        }

        const room = data.get('room')
        if (!room || room instanceof File || room.length == 0) {
            return fail(400, { error: "room is missing" });
        }
        var avatarUrl = data.get("avatarUrl")
        if (!avatarUrl || avatarUrl instanceof File || avatarUrl.length == 0) {
            avatarUrl = null;
        }
        const env = platform?.env
        let user;
        const roomFromDb = await getRoomByName(env, room)
        if (!roomFromDb) {
            return fail(400, { error: "room not found" });
        }
        user = await createUser(env, username, roomFromDb.id, roomFromDb.defaultMoney, avatarUrl)

        // In dev mode, names starting with admin_ become admins automatically for testing
        if (dev && username.startsWith("admin_")) {
            const { setUserAdmin } = await import('$lib/server/db/user');
            await setUserAdmin(env, user.id);
            user.isAdmin = true;
        }

        const message = {
            type: 'join',
            user: username,
        };
        await sendSocketMessage(env, roomFromDb.id, message);

        const token = generateSessionToken();
        const session = await createSession(platform.env, token, user.id);
        setSessionTokenCookie(cookies, token, session.expiresAt);
        redirect(303, "/room")
    }
} satisfies Actions;
