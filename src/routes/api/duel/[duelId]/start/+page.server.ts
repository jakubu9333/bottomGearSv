import { EventType } from "$lib/components/transition"
import { endDuelBetting } from "$lib/server/db/room"
import { getDurrableObject } from "$lib/server/durrable"
import type { RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ params, request, locals, platform }) => {
	const env = platform?.env!!
	const room = await endDuelBetting(env, locals.userId)

	const durableObject = getDurrableObject(env, room.id)
	await durableObject.sendEventSocket(EventType.DuelBetEnd)
	return Response.json({})
}
