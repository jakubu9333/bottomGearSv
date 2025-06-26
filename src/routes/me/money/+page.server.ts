import { getUser } from "$lib/server/db/user";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, platform }) => {
    const env = platform?.env!!
    const money = await getUser(env, locals.userId)
    return Response.json(money)
}
