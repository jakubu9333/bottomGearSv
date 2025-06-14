import { db } from "."
import { user } from "./schema"
import { eq } from "drizzle-orm"

export const getUser = async (env: Env, userId: number) => {
	return (await db(env).select({ id: user.id, name: user.name }).from(user).where(eq(user.id, userId)))[0]
}

export const getUserByGoogleId = async (env: Env, googleId: string) => {
	return (await db(env).select().from(user).where(eq(user.googleId, googleId)))[0]
}

export const createUser = async (env: Env, userName: string, roomId: number) => {
	return (await db(env).insert(user).values({ name: userName, roomId }).returning())[0]
}

export const createUserWithGoogleId = async (env: Env, googleId: string, userName: string) => {
	return (await db(env).insert(user).values({ name: userName, googleId }).returning())[0]
}

export const changeName = async (env: Env, userId: number, username: string) => {
	return (await db(env).update(user).set({ name: username, }).where(eq(user.id, userId)).returning())[0]
}
