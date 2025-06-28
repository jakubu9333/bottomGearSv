import { EventType } from "$lib/components/transition";
import { getAllBetMoneyForDuel, setWinnerMoney } from "$lib/server/db/bet";
import { setWinner } from "$lib/server/db/duel";
import { endDuelRoundInRoom } from "$lib/server/db/room";
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
	const allBettedMoney: { winner: string, money: number }[] = await getAllBetMoneyForDuel(env, params.duelId)
	const firstDuelant = allBettedMoney[0]
	console.log("first", firstDuelant)
	const secondDuelant = allBettedMoney[1]
	console.log("second", secondDuelant)
	const allMoney = firstDuelant?.money ?? secondDuelant?.money ?? 0 + secondDuelant?.money ?? firstDuelant?.money ?? 0
	if (firstDuelant !== undefined && firstDuelant.winner === winner.winner) {
		const howMany = allMoney / firstDuelant.money
		const users = await setWinnerMoney(env, +params.duelId, firstDuelant.winner, howMany)
		const durableObject = getDurrableObject(env, room.id)
		await durableObject.sendEventSocket(EventType.RoundEnd)

		return Response.json(users)

	} else if (secondDuelant !== undefined && secondDuelant.winner === winner.winner) {
		const howMany = allMoney / secondDuelant.money
		const users = await setWinnerMoney(env, +params.duelId, secondDuelant.winner, howMany)
		const durableObject = getDurrableObject(env, room.id)
		await durableObject.sendEventSocket(EventType.RoundEnd)
		return Response.json(users)
	} else {
		const durableObject = getDurrableObject(env, room.id)
		await durableObject.sendEventSocket(EventType.RoundEnd)
		return Response.json(duel)

	}
}
