import { db } from ".";
import { user, room } from "./schema";
import { eq, sql, desc, and, lt } from "drizzle-orm";

export const getUser = async (env: Env, userId: number) => {
	return (await db(env).select({ id: user.id, name: user.name, isAdmin: user.isAdmin }).from(user).where(eq(user.id, userId)))[0]
}

export const getUserMoney = async (env: Env, roomId: number) => {
	return (await db(env).select({ id: user.id, name: user.name, money: user.money }).from(user).where(eq(user.roomId, roomId)).orderBy(desc(user.money)))
}


export const getUserByGoogleId = async (env: Env, googleId: string) => {
	return (await db(env).select().from(user).where(eq(user.googleId, googleId)))[0]
}

export const getUsersByRoomId = async (env: Env, roomId: string) => {
	return (await db(env).select().from(user).where(eq(user.roomId, +roomId)))
}

export const createUser = async (env: Env, userName: string, roomId: number) => {
	return (await db(env).insert(user).values({ name: userName, roomId }).returning())[0]
}

export const createUserAdmin = async (env: Env, userName: string, roomId: number) => {
	return (await db(env).insert(user).values({ name: userName, roomId, isAdmin: 1 }).returning())[0]
}

export const createUserWithGoogleId = async (env: Env, googleId: string, userName: string) => {
	return (await db(env).insert(user).values({ name: userName, googleId }).returning())[0]
}

export const changeName = async (env: Env, userId: number, username: string) => {
	return (await db(env).update(user).set({ name: username, }).where(eq(user.id, userId)).returning())[0]
}

export const setUserAdmin = async (env: Env, userId: number) => {
	return (await db(env).update(user).set({ isAdmin: 1 }).where(eq(user.id, userId)).returning())[0]
}

export const setUserRoomId = async (env: Env, userId: number, roomId: number) => {
	return (await db(env).update(user).set({ roomId }).where(eq(user.id, userId)).returning())[0]
}

export const removeUserMoney = async (env: Env, userId: number, money: number) => {
	return (await db(env).update(user).set({ money: sql`MAX(${user.money} - ${money}, 0)` }).where(eq(user.id, userId)).returning())[0]
}

export const giveFreeMoneyToBrokeBoys = async (env: Env, roomId: number) => {
	const MIN_MONEY = 25;

	await db(env).update(user).set(
		{ money: MIN_MONEY }
	).where(
		and(
			eq(user.roomId, roomId),
			lt(user.money, MIN_MONEY)
		)
	);
}

export const joinRoomByName = async (env: Env, roomName: string, userId: number) => {
    const dbEnv = db(env);

    const roomCte = dbEnv.$with('room_cte').as(
        dbEnv.select({ id: room.id }).from(room).where(eq(room.name, roomName))
    );

    const updatedUsers = await dbEnv.with(roomCte).update(user).set({
        roomId: sql`(select id from ${roomCte})`
    }).where(eq(user.id, userId)).returning({ id: user.id, roomId: user.roomId });

    if (updatedUsers.length > 0 && updatedUsers[0].roomId !== null) {
        return updatedUsers[0];
    } else {
        return { error: "Room not found" };
    }
}
