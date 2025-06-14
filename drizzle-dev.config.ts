import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	out: './drizzle/migration/dev',
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
