import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUser } from '$lib/server/db/user';

export const GET: RequestHandler = async ({ locals, platform }) => {
    const userId = locals.userId;
    const user = await getUser(platform?.env!!, userId);
    return json(user);
};
