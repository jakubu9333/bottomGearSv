import { dev } from "$app/environment"
import { EventType } from "$lib/types"
import { endDuelBetting } from "$lib/server/db/room"
import { getDurrableObject, mockDurableForDev } from "$lib/server/durrable"
import type { RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ locals, platform }) => {
	const env = platform?.env!!
	const room = await endDuelBetting(env, locals.userId)

	const eventToSend = EventType.DuelBetEnd
	if (dev) {
		await mockDurableForDev({ type: "event", event: eventToSend })
	} else {
		const durableObject = getDurrableObject(env, room.id)
		await durableObject.sendEventSocket(eventToSend)
	}
	return Response.json({})
}
