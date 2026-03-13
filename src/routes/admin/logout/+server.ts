import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import { type RequestHandler } from "@sveltejs/kit";
import { json } from "stream/consumers";


export const POST: RequestHandler = async ({ cookies, platform }) => {
	const sesionToken = cookies.get("session")
	deleteSessionTokenCookie(cookies)
	const env = platform?.env!!
	if (sessionToken !== undefined) {
		invalidateSession(env, sesionToken)
	}

	return json(200, "/login")
}
