import { EventType } from "$lib/types"
import { endDuelBetting } from "$lib/server/db/room"
import { sendSocketMessage } from "$lib/server/durrable"
import type { RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ locals, platform }) => {
	const env = platform?.env!!
	const room = await endDuelBetting(env, locals.userId)
	if (!room) {
		return Response.json({ message: "User not in a room" }, { status: 400 })
	}

	const eventToSend = EventType.DuelBetEnd
	const message = {
		type: 'event',
		event: eventToSend,
	};
	await sendSocketMessage(env, room.id, message);
	return Response.json({})
}
