import { createNewBet } from "$lib/server/db/bet";
import { getUser } from "$lib/server/db/user";
import { getDuelById } from "$lib/server/db/duel";
import { removeUserMoney } from "$lib/server/db/user";
import type { RequestHandler } from "@sveltejs/kit";
import { getDurrableObject } from "$lib/server/durrable";


type Bet = { winner: string, money: number, duelId: number }
export const POST: RequestHandler = async ({ request, locals, platform }) => {
    const env = platform?.env!!
    const betFromJson: Bet = await request.json()
    if (!betFromJson.winner || !betFromJson.duelId || betFromJson.money === undefined || betFromJson.money === null) {
        return Response.json({ desc: "invalid bet object correct {money,duelId,winner}" }, { status: 400 })
    }
    const user = await getUser(env, locals.userId)
    if (user.money < betFromJson.money) {
        return Response.json({ desc: "not enought money" }, {
            status: 400
        })
    }
    if (!user.roomId) {
        return Response.json({ desc: "not in room" }, {
            status: 400
        })
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

    const durableObject = getDurrableObject(env, user.roomId)
    await durableObject.sendBettedInfo(betFromJson.money, betFromJson.winner)


    return Response.json(bet)
}


