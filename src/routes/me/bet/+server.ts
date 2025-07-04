import { createNewBet } from "$lib/server/db/bet";
import { getDuelById } from "$lib/server/db/duel";
import { removeUserMoney } from "$lib/server/db/user";
import type { RequestHandler } from "@sveltejs/kit";


type Bet = { winner: string, money: number, duelId: number }
export const POST: RequestHandler = async ({ request, locals, platform }) => {
    const env = platform?.env!!
    const betFromJson: Bet = await request.json()
    if (!betFromJson.winner || !betFromJson.duelId || betFromJson.money === undefined || betFromJson.money === null) {
        return Response.json({ desc: "invalid bet object correct {money,duelId,winner}" }, { status: 400 })
    }
    const isDuelBettable = (await getDuelById(env, betFromJson.duelId)).isBettable === 1
    if (!isDuelBettable) {
        return Response.json({ desc: "duel is not bettable" }, { status: 400 })
    }
    const bet = createNewBet(env,
        betFromJson.money,
        betFromJson.winner,
        betFromJson.duelId,
        locals.userId)
    await removeUserMoney(env, locals.userId, betFromJson.money)


    return Response.json(bet)
}


