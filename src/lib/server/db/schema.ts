import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: integer('id').primaryKey(),
	name: text().notNull(),
	googleId: text("google_id"),
	roomId: integer("room_id").references(() => room.id)
});

export const room = sqliteTable('room', {
	id: integer('id').primaryKey(),
	name: text().notNull(),
});
