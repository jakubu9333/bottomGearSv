import { createNewBet } from "$lib/server/db/bet";
import { getUser } from "$lib/server/db/user";
import { getBettableDuelById } from "$lib/server/db/duel";
import { removeUserMoney } from "$lib/server/db/user";
import type { RequestHandler } from "@sveltejs/kit";
import { sendSocketMessage } from "$lib/server/durrable";
import { IsBettable } from "$lib/types";


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
    const bettableDuel = await getBettableDuelById(env, betFromJson.duelId)
    if (!bettableDuel) {
        return Response.json({ desc: "duel is not bettable" }, { status: 400 })
    }
    const bet = createNewBet(env,
        betFromJson.money,
        betFromJson.winner,
        betFromJson.duelId,
        locals.userId)
    await removeUserMoney(env, locals.userId, betFromJson.money)

    const message = {
        type: 'bet',
        money: betFromJson.money,
        winner: betFromJson.winner,
    };
    await sendSocketMessage(env, user.roomId, message);


    return Response.json(bet)
}
