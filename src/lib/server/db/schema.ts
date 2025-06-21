import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	googleId: text("google_id"),
	roomId: integer("room_id").references(() => room.id),
	isAdmin: integer("is_admin").notNull().default(0) // 0 - false , 1 - true
});

export const room = sqliteTable('room', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text().notNull(),
});
