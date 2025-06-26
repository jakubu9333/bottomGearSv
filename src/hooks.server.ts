
import { validateSessionToken } from '$lib/server/auth';
import { getUser } from '$lib/server/db/user';
import { fail, redirect, , type Handle } from '@sveltejs/kit';
import type { RequestEvent } from './routes/$types';

const freeUrls = [
    "/login",
    "/login/google",
    "/login/google/callback"
]


export const handle: Handle = async ({ event, resolve }) => {
    const isFreeUrl = freeUrls.includes(event.url.pathname)
    if (isFreeUrl) {
        const response = await resolve(event);
        return response;
    }

    if (event.platform !== undefined) {

        const session = await getSession(event.platform.env, event)
        if (session !== null) {
            event.locals.userId = session.userId
        }
    }

    const userId = event.locals.userId
    if (!userId) {
        return redirect(303, "/login")
    }

    const isAdminUrl = event.url.pathname.startsWith("/admin") && event.url.pathname !== "/"
    //todo api token



    if (isAdminUrl) {
        if (!userId) {
            return redirect(303, "/login")
        }
        const isUserAdmin = (await getUser(event.platform?.env!!, userId)).isAdmin
        if (!isUserAdmin) {
            return fail(403, { message: "not admin" })
        }

    }



    const response = await resolve(event);
    return response;
};

async function getSession(env: Env, event: RequestEvent) {
    if (event.url.pathname.startsWith("/api")) {
        let authHeader = event.request.headers.get("Authorization")
        if (authHeader === null) {
            return null
        }

        if (authHeader?.startsWith('Bearer ')) {
            authHeader = authHeader.substring(7);
        }

        const session = await validateSessionToken(env, authHeader)
        return session
    }
    const sessionToken = event.cookies.get('session')
    if (sessionToken === undefined) {
        return null
    }
    const session = await validateSessionToken(env, sessionToken)
    return session
}

