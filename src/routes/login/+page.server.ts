import { createUser, createUserAdmin } from '$lib/server/db/user';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { createRoom, getRoomByName } from '$lib/server/db/room';
import { getDurrableObject } from '$lib/server/durrable';
import { ROBEK } from "$env/static/private"

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
        const env = platform?.env
        let user;
        let roomFromDb
        if (false && ROBEK === "ROBEK_DEV" && room.includes("test")) {
            roomFromDb = await createRoom(env, room)
            user = await createUserAdmin(env, username, roomFromDb.id)
        }
        else {
            roomFromDb = await getRoomByName(env, room)
            if (!roomFromDb) {
                return fail(400, { room, missing: true });
            }
            user = await createUser(env, username, roomFromDb.id)
        }
        const roomDurableObject = getDurrableObject(env, roomFromDb.id)
        const result = await roomDurableObject.joinRoom(username)
        console.log("after stub", result)
        const token = generateSessionToken();
        const session = await createSession(platform.env, token, user.id);
        setSessionTokenCookie(cookies, token, session.expiresAt);
        redirect(303, "/room")
    }
} satisfies Actions;

