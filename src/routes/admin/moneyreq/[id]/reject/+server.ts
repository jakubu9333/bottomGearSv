import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rejectMoneyRequest } from '$lib/server/db/money_request';

export const POST: RequestHandler = async ({ platform, params }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return json({ error: 'Invalid id' }, { status: 400 });
    }

    const env = platform?.env!!;
    await rejectMoneyRequest(env, id);

    return json({ success: true });
};
