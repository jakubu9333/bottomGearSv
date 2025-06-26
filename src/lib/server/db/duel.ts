import { db } from "."
import { duel, room } from "./schema"
import { eq } from "drizzle-orm"

export const createNewDuel = async (env: Env, firstName: string, secondName: string) => {
	return (await db(env).insert(duel).values({ firstName, secondName }).returning())[0]
}
export const getDuelByRoomId = async (env: Env, roomId: number) => {
	return (await db(env).select({ id: duel.id, firstName: duel.firstName, secondName: duel.secondName })
		.from(room)
		.where(eq(room.id, roomId))
		.innerJoin(duel, eq(room.duelNow, duel.id))
	)
}

export const endBettingForDuel = async (env: Env, duelId: number) => {
	const duelFromDb = await db(env)
		.update(duel)
		.set({ isBettable: 0 })
		.where(eq(duel.id, duelId))
		.returning()
	return duelFromDb[0]
}

export const setWinner = async (env: Env, duelId: number, winner) => {
	const duelFromDb = await db(env)
		.update(duel)
		.set({ winner })
		.where(eq(duel.id, duelId))
		.returning()
	return duelFromDb[0]
}


