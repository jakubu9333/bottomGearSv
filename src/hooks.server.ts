
import { validateSessionToken } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

const freeUrls = [
    "/login",
    "/login/google",
    "/login/google/callback"
]

export const handle: Handle = async ({ event, resolve }) => {
    const sessionToken = event.cookies.get('session')
    if (event.platform !== undefined && sessionToken !== undefined) {
        const session = await validateSessionToken(event.platform.env, sessionToken);
        if (session !== null) {
            event.locals.userId = session.userId
        }
    }

    const isFreeUrl = freeUrls.includes(event.url.pathname)
    if (!event.locals.userId && !isFreeUrl) {
        return redirect(303, "/login")
    }

    const response = await resolve(event);
    return response;
};  
