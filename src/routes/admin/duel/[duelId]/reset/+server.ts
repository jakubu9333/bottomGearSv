
import { EventType } from "$lib/types";
import { endDuelRoundInRoom } from "$lib/server/db/room";
import { sendSocketMessage } from "$lib/server/durrable";
import { json, error, type RequestHandler } from "@sveltejs/kit";
import { resetBet } from "$lib/server/db/bet";


export const POST: RequestHandler = async ({ params, locals, platform }) => {
	const env = platform?.env!!
	const room = await endDuelRoundInRoom(env, locals.userId)
	if (!room) {
		return error(400, { message: "User not in a room" })
	}
	const resetedBets = resetBet(env, +params.duelId)
	const eventToSend = EventType.RoundEnd
	const message = {
		type: 'event',
		event: eventToSend,
	};
	await sendSocketMessage(env, room.id, message);

	return json("OK")
}
