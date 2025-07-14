import { EventType } from "$lib/components/transition";
import { setWinnerMoney } from "$lib/server/db/bet";
import { setWinner } from "$lib/server/db/duel";
import { endDuelRoundInRoom } from "$lib/server/db/room";
import { giveFreeMoneyToBrokeBoys } from "$lib/server/db/user";
import { getDurrableObject } from "$lib/server/durrable";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ platform, locals, params, request }) => {
	const winner: { winner: string } = await request.json()
	const env = platform?.env!!
	const room = await endDuelRoundInRoom(env, locals.userId)
	if (!winner.winner) {
		return new Response(JSON.stringify({ message: "winner not set" }), { status: 400 })
	}
	const duel = await setWinner(env, params.duelId, winner.winner)
	//@ts-ignore
	const users = await setWinnerMoney(env, +params.duelId, winner.winner)
	await giveFreeMoneyToBrokeBoys(env, room.id)
	const durableObject = getDurrableObject(env, room.id)
	await durableObject.sendEventSocket(EventType.RoundEnd)

	return Response.json(users)

}
