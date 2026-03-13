import { db } from ".";
import { user, room } from "./schema";
import { eq, sql, desc, and, lt } from "drizzle-orm";

export const getUser = async (env: Env, userId: number) => {
	return (await db(env).select().from(user).where(eq(user.id, userId)))[0]
}

export const getLeaderBoard = async (env: Env, roomId: number) => {
	return (await db(env).select({ id: user.id, name: user.name, money: user.money, avatarUrl: user.avatarUrl }).from(user)
		.where(eq(user.roomId, roomId))
		.orderBy(desc(user.money)))
}

export const getUserByName = async (env: Env, userName: string) => {
	return (await db(env).select().from(user).where(eq(user.name, userName)))[0]
}


export const getUserByGoogleId = async (env: Env, googleId: string) => {
	return (await db(env).select().from(user).where(eq(user.googleId, googleId)))[0]
}

export const getUsersByRoomId = async (env: Env, roomId: string) => {
	return (await db(env).select().from(user).where(eq(user.roomId, +roomId)))
}

export const createUser = async (env: Env, userName: string, roomId: number, money: number, avatarUrl: string | null) => {
	return (await db(env).insert(user).values({ name: userName, roomId, money, avatarUrl }).returning())[0]
}

export const createUserAdmin = async (env: Env, userName: string, roomId: number) => {
	return (await db(env).insert(user).values({ name: userName, roomId, isAdmin: 1 }).returning())[0]
}

export const createUserWithGoogleId = async (env: Env, googleId: string, userName: string) => {
	return (await db(env).insert(user).values({ name: userName, googleId }).returning())[0]
}

export const changeNameAndAvatar = async (env: Env, userId: number, username: string, avatarUrl: string | null) => {
	return (await db(env).update(user).set({ name: username, avatarUrl }).where(eq(user.id, userId)).returning())[0]
}

export const setUserAdmin = async (env: Env, userId: number) => {
	return (await db(env).update(user).set({ isAdmin: 1 }).where(eq(user.id, userId)).returning())[0]
}

export const joinAdminIntoRoom = async (env: Env, userId: number, roomId: number, defaultMoney: number) => {
	return (await db(env).update(user).set({ roomId, money: defaultMoney }).where(eq(user.id, userId)).returning())[0]
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
		dbEnv.select({ id: room.id, money: room.defaultMoney }).from(room).where(eq(room.name, roomName))
	);

	const updatedUsers = await dbEnv.with(roomCte).update(user).set({
		roomId: sql`(select id from ${roomCte})`,
		money: sql`(select ${roomCte.money} from ${roomCte})`,
	}).where(eq(user.id, userId)).returning({ id: user.id, roomId: user.roomId });

	if (updatedUsers.length > 0 && updatedUsers[0].roomId !== null) {
		return updatedUsers[0];
	} else {
		return { error: "Room not found" };
	}
}

export const resetRoomByAdminId = async (env: Env, adminId: number) => {
	const dbEnv = db(env);

	const admin = dbEnv.$with('admin').as(
		dbEnv.select({ roomId: user.roomId, money: room.defaultMoney }).from(user).where(eq(user.id, adminId)).innerJoin(room, eq(user.roomId, room.id))
	);

	const updatedUsers = await dbEnv.with(admin).update(user).set({
		roomId: sql`(select ${admin.roomId} from ${admin})`,
		money: sql`(select ${admin.money} from ${admin})`,
	}).where(eq(user.roomId, sql`(select ${admin.roomId} from ${admin})`)).returning({ id: user.id, roomId: user.roomId });

	if (updatedUsers.length > 0 && updatedUsers[0].roomId !== null) {
		return updatedUsers[0];
	} else {
		return { error: "Room not found" };
	}
}



export const addUserMoney = async (env: Env, userId: number, money: number) => {
	return (await db(env).update(user).set({ money: sql`${user.money} + ${money}` }).where(eq(user.id, userId)).returning())[0]
}
