import { getDuelByRoomId } from "$lib/server/db/duel"
import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const env = platform?.env!!
	const duel = await getDuelByRoomId(env, params.roomId)
	return Response.json(duel)
}
