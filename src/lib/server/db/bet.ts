import { eq, sum, and, inArray, sql } from "drizzle-orm"
import { db } from "."
import { duelBet, user } from "./schema"


export const createNewBet = async (env: Env, money: number, winner: string, duelId: number, userId: number
) => {
	return (await db(env).insert(duelBet).values({
		money,
		winner,
		duelId,
		userId
	}).returning())[0]
}

export const getAllBetMoneyForDuel = async (env: Env, duelId: number) => {
	const duels = (await db(env).select({ winner: duelBet.money, money: sum(duelBet.money) }).from(duelBet).where(eq(duelBet.duelId, duelId)).groupBy(duelBet.winner))
	return duels
}

export const setWinnerMoney = async (env: Env, duelId: number, winner: string, howManyIndex: number) => {
	const result = await db(env)
		.update(user)
		.set({
			money: sql`${user.money} * ${howManyIndex}`
		})
		.where(
			inArray(
				user.id,
				db(env).select({ userId: duelBet.userId })
					.from(duelBet)
					.where(
						and(
							eq(duelBet.duelId, duelId),
							eq(duelBet.winner, winner)
						)
					)
			)
		)
		.returning();
	return result
}
