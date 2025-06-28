import { getUserMoney } from "$lib/server/db/user";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, platform }) => {
    const env = platform?.env!!
    const money = await getUserMoney(env, params.roomId)
    return Response.json(money)
}
