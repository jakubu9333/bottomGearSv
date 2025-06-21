import { eq } from "drizzle-orm"
import { db } from "."
import { room } from "./schema"


export const getRoomByName = async (env: Env, name: string) => {
	return (await db(env).select().from(room).where(eq(room.name, name)))[0]
}

export const getRoomById = async (env: Env, id: number) => {
	return (await db(env).select().from(room).where(eq(room.id, id)))[0]
}

export const createRoom = async (env: Env, name: string) => {
	return (await db(env).insert(room).values({ name }).returning())[0]
}
