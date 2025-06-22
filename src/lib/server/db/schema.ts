import { AppState } from '$lib';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
const DEFAULT_MONEY = 250
export const user = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	googleId: text("google_id"),
	roomId: integer("room_id").references(() => room.id),
	isAdmin: integer("is_admin").notNull().default(0), // 0 - false , 1 - true
	money: integer().notNull().default(DEFAULT_MONEY)
});

export const room = sqliteTable('room', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	state: integer().notNull().default(AppState.NoRound),
	round: integer().notNull().default(0)
});

