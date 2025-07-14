import { getLeaderBoard } from "$lib/server/db/user";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, platform }) => {
    const env = platform?.env!!
    const leaderBoard = await getLeaderBoard(env, params.roomId)
    return Response.json(leaderBoard)
}
