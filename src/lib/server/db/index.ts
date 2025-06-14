import { drizzle } from 'drizzle-orm/d1';
import { drizzle as bunDrizzle } from 'drizzle-orm/bun-sqlite';
import { dev } from '$app/environment';

export const db = (env: Env) => {
	if (dev) {
		return bunDrizzle(process.env.DATABASE_NAME)
	}

	return drizzle(env.BOTTOM_GEAR_DB)
};
