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
            return fail(400, { error: "username is missing" });
        }
        if (!room || room instanceof File || room.length == 0) {
            return fail(400, { error: "room is missing" });
        }
        const env = platform?.env
        let user;
        const roomFromDb = await getRoomByName(env, room)
        if (!roomFromDb) {
            return fail(400, { error: "room not found" });
        }
        user = await createUser(env, username, roomFromDb.id)

        const roomDurableObject = getDurrableObject(env, roomFromDb.id)
        const result = await roomDurableObject.joinRoom(username)
        console.log("after stub", result)
        const token = generateSessionToken();
        const session = await createSession(platform.env, token, user.id);
        setSessionTokenCookie(cookies, token, session.expiresAt);
        redirect(303, "/room")
    }
} satisfies Actions;

