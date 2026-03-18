import { EventType } from "$lib/types"
import { setWinnerMoney } from "$lib/server/db/bet";
import { setWinner } from "$lib/server/db/duel";
import { endDuelRoundInRoom } from "$lib/server/db/room";
import { giveFreeMoneyToBrokeBoys } from "$lib/server/db/user";
import { sendSocketMessage } from "$lib/server/durrable";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ platform, locals, params, request }) => {
	const winner: { winner: string } = await request.json()
	const env = platform?.env!!
	const room = await endDuelRoundInRoom(env, locals.userId)
	if (!room) {
		return Response.json({ message: "User not in a room" }, { status: 400 })
	}
	if (!winner.winner) {
		return new Response(JSON.stringify({ message: "winner not set" }), { status: 400 })
	}
	const updatedDuel = await setWinner(env, +params.duelId, winner.winner)
	if (!updatedDuel) {
		return Response.json({ message: "Duel not found or already ended" }, { status: 400 })
	}
	const users = await setWinnerMoney(env, +params.duelId, winner.winner)
	await giveFreeMoneyToBrokeBoys(env, room.id)
	const eventToSend = EventType.RoundEnd
	const message = {
		type: 'event',
		event: eventToSend,
	};
	await sendSocketMessage(env, room.id, message);

	return Response.json(users)

}
