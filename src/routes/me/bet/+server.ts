import { createNewBet } from "$lib/server/db/bet";
import { getUser } from "$lib/server/db/user";
import { getBettableDuelById } from "$lib/server/db/duel";
import { removeUserMoney } from "$lib/server/db/user";
import { error, type RequestHandler } from "@sveltejs/kit";
import { sendSocketMessage } from "$lib/server/durrable";


type Bet = { winner: string, money: number, duelId: number }
export const POST: RequestHandler = async ({ request, locals, platform }) => {
    const env = platform?.env!!
    const betFromJson: Bet = await request.json()
    if (!betFromJson.winner || !betFromJson.duelId || betFromJson.money === undefined || betFromJson.money === null) {
        return error(400, { message: "Invalid bet object correct {money,duelId,winner}" })
    }
    const user = await getUser(env, locals.userId)
    if (user.money < betFromJson.money) {
        return error(400, { message: "Not enought money" })
    }
    if (!user.roomId) {
        return error(400, { message: "User not in room" })
    }
    const bettableDuel = await getBettableDuelById(env, betFromJson.duelId)
    if (!bettableDuel) {
        return error(400, { message: "Duel is not bettable" })
    }
    const bet = await createNewBet(env,
        betFromJson.money,
        betFromJson.winner,
        betFromJson.duelId,
        locals.userId)
    if (!bet) {
        return error(400, { message: "You already placed bet for this duel" })
    }
    await removeUserMoney(env, locals.userId, betFromJson.money)

    const message = {
        type: 'bet',
        money: betFromJson.money,
        winner: betFromJson.winner,
    };
    await sendSocketMessage(env, user.roomId, message);


    return Response.json(bet)
}
