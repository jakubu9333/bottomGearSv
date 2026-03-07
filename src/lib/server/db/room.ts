import { desc, eq, gt, sql } from "drizzle-orm"
import { db } from "."
import { room, user } from "./schema"
import { AppState } from "$lib/types"


export const getRoomByName = async (env: Env, name: string) => {
	return (await db(env).select().from(room).where(eq(room.name, name)))[0]
}

export const getRoomById = async (env: Env, id: number) => {
	return (await db(env).select().from(room).where(eq(room.id, id)))[0]
}

export const createRoom = async (env: Env, name: string, defaultMoney: number) => {
	return (await db(env).insert(room).values({ name, defaultMoney }).returning())[0]
}
export const getRoomByUserId = async (env: Env, userId: number) => {
	return (await db(env).select().from(user).leftJoin(room, eq(room.id, user.roomId)).where(eq(user.id, userId)))[0]
}

export const getRoomsCreatedToday = async (env: Env) => {
	const limit = new Date(Date.now() - 4 * 60 /*hour*/ * 60 * 60 * 1000)
	return (await db(env).select().from(room).where(gt(room.createdAt, limit)).orderBy(desc(room.createdAt)))
}

const getRoomByUserIdQuery = (env: Env, userId: number) => {
	const dbLocal = db(env)
	const roomId = dbLocal.$with("userRoom").as(dbLocal.select({ id: user.roomId }).from(user).where(eq(user.id, userId)))
	return roomId
}


export const addDuelInRoom = async (env: Env, userId: number, duelId: number) => {
	const roomQuery = getRoomByUserIdQuery(env, userId)
	const roomFromDb = await db(env)
		.with(roomQuery)
		.update(room)
		.set({
			duelNow: duelId,
			state: AppState.DuelBetStart,
		})
		.where(eq(room.id, sql`(select * from ${roomQuery})`))
		.returning()
	return roomFromDb[0]
}

export const endDuelBetting = async (env: Env, userId: number) => {
	const roomQuery = getRoomByUserIdQuery(env, userId)
	const roomFromDb = await db(env)
		.with(roomQuery)
		.update(room)
		.set({
			state: AppState.DuelBetEnded,
		})
		.where(eq(room.id, sql`(select * from ${roomQuery})`))
		.returning()
	return roomFromDb[0]
}


export const endDuelRoundInRoom = async (env: Env, userId: number) => {
	const roomQuery = getRoomByUserIdQuery(env, userId)
	const roomFromDb = await db(env)
		.with(roomQuery)
		.update(room)
		.set({
			duelNow: null,
			state: AppState.RoundEnded,
			round: sql`${room.round}+1`
		})
		.where(eq(room.id, sql`(select * from ${roomQuery})`))
		.returning()
	return roomFromDb[0]
}
