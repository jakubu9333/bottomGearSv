import { EventType } from "$lib/types";
import { createNewDuel } from "$lib/server/db/duel";
import { addDuelInRoom } from "$lib/server/db/room";
import { sendSocketMessage } from "$lib/server/durrable";
import type { RequestHandler } from "@sveltejs/kit";


type DuelPost = { firstName: string; secondName: string };
export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const duel: DuelPost = await request.json()
	const env = platform?.env!!
	if (!duel.firstName || !duel.secondName) {
		return new Response("", { status: 400 })
	}
	const newDuel = await createNewDuel(env, duel.firstName, duel.secondName)
	const room = await addDuelInRoom(env, locals.userId, newDuel.id)
	const eventToSend = EventType.DuelBetStart
    const message = {
        type: 'event',
        event: eventToSend,
    };
    await sendSocketMessage(env, room.id, message);

	return Response.json(newDuel)
}