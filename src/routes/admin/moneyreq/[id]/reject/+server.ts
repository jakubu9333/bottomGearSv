import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMoneyRequestById, rejectMoneyRequest } from '$lib/server/db/money_request';

export const POST: RequestHandler = async ({ platform, params }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return json({ error: 'Invalid id' }, { status: 400 });
    }
    const env = platform?.env!!;

    const moneyRequest = await getMoneyRequestById(env, id);

    if (!moneyRequest) {
        return error(404, { message: 'Money request not found or is already resolved' });
    }

    await rejectMoneyRequest(env, id);

    return json({ success: true });
};
