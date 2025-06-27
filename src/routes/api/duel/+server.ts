import { EventType } from "$lib/components/transition";
import { createNewDuel } from "$lib/server/db/duel";
import { addDuelInRoom } from "$lib/server/db/room";
import { getDurrableObject } from "$lib/server/durrable";
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
	const durableObject = getDurrableObject(env, room.id)
	await durableObject.sendEventSocket(EventType.DuelBetStart)

	return Response.json(newDuel)
}
