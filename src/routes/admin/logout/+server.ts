import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import { json, type RequestHandler } from "@sveltejs/kit";


export const POST: RequestHandler = async ({ cookies, platform }) => {
	const sessionToken = cookies.get("session")
	deleteSessionTokenCookie(cookies)
	const env = platform?.env!!
	if (sessionToken !== undefined) {
		invalidateSession(env, sessionToken)
	}

	return json("/login")
}
