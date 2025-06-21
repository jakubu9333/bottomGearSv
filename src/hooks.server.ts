
import { validateSessionToken } from '$lib/server/auth';
import { getUser } from '$lib/server/db/user';
import { fail, redirect, type Handle } from '@sveltejs/kit';

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

    const userId = event.locals.userId
    const isFreeUrl = freeUrls.includes(event.url.pathname)
    if (!userId && !isFreeUrl) {
        return redirect(303, "/login")
    }
    const isAdminUrl = event.url.pathname.startsWith("/admin") && event.url.pathname !== "/"


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
