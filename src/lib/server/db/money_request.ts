import { db } from ".";
import { moneyRequest, user } from "./schema";
import { eq, and } from "drizzle-orm";

export const createMoneyRequest = async (env: Env, userId: number, amount: number, price: number) => {
    return (await db(env).insert(moneyRequest).values({ userId, amount, price }).returning())[0];
};

export const getMoneyRequestById = async (env: Env, id: number) => {
    return (await db(env).select().from(moneyRequest).where(eq(moneyRequest.id, id)))[0];
};

export const getPendingMoneyRequests = async (env: Env) => {
    return await db(env)
        .select({
            id: moneyRequest.id,
            amount: moneyRequest.amount,
            price: moneyRequest.price,
            status: moneyRequest.status,
            user: {
                id: user.id,
                name: user.name,
            },
        })
        .from(moneyRequest)
        .leftJoin(user, eq(moneyRequest.userId, user.id))
        .where(eq(moneyRequest.status, "pending"));
};

export const approveMoneyRequest = async (env: Env, id: number) => {
    return (await db(env).update(moneyRequest).set({ status: "approved" }).where(eq(moneyRequest.id, id)).returning())[0];
};

export const rejectMoneyRequest = async (env: Env, id: number) => {
    return (await db(env).update(moneyRequest).set({ status: "rejected" }).where(eq(moneyRequest.id, id)).returning())[0];
};
