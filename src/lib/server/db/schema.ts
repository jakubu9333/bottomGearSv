import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
const DEFAULT_MONEY = 250
export const user = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	googleId: text("google_id"),
	roomId: integer("room_id").references(() => room.id),
	isAdmin: integer("is_admin").notNull().default(0), // 0 - false , 1 - true
	money: real().notNull().default(DEFAULT_MONEY)
});

export const room = sqliteTable('room', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	state: integer().notNull().default(0),
	round: integer().notNull().default(0),
	duelNow: integer("duel_now"),
	defaultMoney: integer().notNull().default(DEFAULT_MONEY)
});

export const duel = sqliteTable('duel', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	firstName: text("first_name").notNull(),
	secondName: text("second_name").notNull(),
	winner: text(),
	isBettable: integer("is_betable").notNull(), // 0 - false , 1 - true 
})

export const duelBet = sqliteTable('duelBet', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	winner: text().notNull(),
	money: real().notNull(),
	duelId: integer("duel_id").notNull().references(() => duel.id),
	userId: integer("user_id").notNull().references(() => user.id)
})

export const moneyRequest = sqliteTable('moneyRequest', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull().references(() => user.id),
	amount: real('amount').notNull(),
	price: real('price').notNull(),
	status: text('status').notNull().default('pending'), // pending, approved, rejected
});
