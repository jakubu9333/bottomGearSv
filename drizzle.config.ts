import { defineConfig } from 'drizzle-kit';


export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: 'drizzle/migrations',
	dbCredentials: {
		accountId: process.env.ACC_ID,
		databaseId: process.env.DB_ID,
		token: process.env.DB_TOKEN,
	},
	verbose: true,
	strict: true,
	dialect: 'sqlite',
	driver: "d1-http"
});

