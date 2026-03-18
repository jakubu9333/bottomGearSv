import { db } from "."
import { duel, room } from "./schema"
import { and, eq, ne } from "drizzle-orm"
import { IsBettable } from "$lib/types"

export const createNewDuel = async (env: Env, firstName: string, secondName: string) => {
	return (await db(env).insert(duel).values({ firstName, secondName, isBettable: IsBettable.YES }).returning())[0]
}

export const getBettableDuelById = async (env: Env, duelId: number) => {
	return (await db(env).select().from(duel).where(and(eq(duel.id, duelId), eq(duel.isBettable, IsBettable.YES))))[0]
}

export const getDuelByRoomId = async (env: Env, roomId: number) => {
	return (await db(env).select({ id: duel.id, firstName: duel.firstName, secondName: duel.secondName })
		.from(room)
		.where(eq(room.id, roomId))
		.innerJoin(duel, and(eq(room.duelNow, duel.id), ne(duel.isBettable, IsBettable.DUEL_ENDED)))
	)[0]
}

export const endBettingForDuel = async (env: Env, duelId: number) => {
	const duelFromDb = await db(env)
		.update(duel)
		.set({ isBettable: IsBettable.NO })
		.where(and(eq(duel.id, duelId), eq(duel.isBettable, IsBettable.YES)))
		.returning()
	return duelFromDb[0]
}

export const setWinner = async (env: Env, duelId: number, winner: string) => {
	const duelFromDb = await db(env)
		.update(duel)
		.set({ winner, isBettable: IsBettable.DUEL_ENDED })
		.where(and(eq(duel.id, duelId), eq(duel.isBettable, IsBettable.NO)))
		.returning()
	return duelFromDb[0]
}

export const resetDuelStatus = async (env: Env, duelId: number) => {
	const duelFromDb = await db(env)
		.update(duel)
		.set({ isBettable: IsBettable.DUEL_ENDED })
		.where(and(eq(duel.id, duelId), ne(duel.isBettable, IsBettable.DUEL_ENDED)))
		.returning()
	return duelFromDb[0]
}


