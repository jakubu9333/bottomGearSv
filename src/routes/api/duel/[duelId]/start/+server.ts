import { EventType } from "$lib/types"
import { endDuelBetting } from "$lib/server/db/room"
import { endBettingForDuel } from "$lib/server/db/duel"
import { sendSocketMessage } from "$lib/server/durrable"
import type { RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ locals, platform, params }) => {
	const env = platform?.env!!
	const updatedDuel = await endBettingForDuel(env, +params.duelId)
	if (!updatedDuel) {
		return Response.json({ message: "Duel not found or already started" }, { status: 400 })
	}
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
