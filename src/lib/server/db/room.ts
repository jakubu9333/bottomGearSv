import { eq } from "drizzle-orm"
import { db } from "."
import { room, user } from "./schema"


export const getRoomByName = async (env: Env, name: string) => {
	return (await db(env).select().from(room).where(eq(room.name, name)))[0]
}

export const getRoomById = async (env: Env, id: number) => {
	return (await db(env).select().from(room).where(eq(room.id, id)))[0]
}

export const createRoom = async (env: Env, name: string) => {
	return (await db(env).insert(room).values({ name }).returning())[0]
}
export const getRoomByUserId = async (env: Env, userId: number) => {
	return (await db(env).select().from(user).leftJoin(room, eq(room.id, user.roomId)).where(eq(user.id, userId)))[0]
}
