import { createNewBet } from "$lib/server/db/bet";
import type { RequestHandler } from "@sveltejs/kit";


type Bet = { winner: string, money: number, duelId: number }
export const POST: RequestHandler = async ({ request, locals, platform }) => {
    const env = platform?.env!!
    const betFromJson: Bet = await request.json()
    if (!betFromJson.winner || !betFromJson.duelId || betFromJson.money === undefined) {
        return Response.json({ desc: "invalid bet object correct {money,duelId,winner}" }, { status: 400 })
    }
    const bet = createNewBet(env,
        betFromJson.money,
        betFromJson.winner,
        betFromJson.duelId,
        locals.userId)


    return Response.json(bet)
}


