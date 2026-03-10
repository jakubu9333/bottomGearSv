import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createMoneyRequest, getMoneyRequestByUserId } from '$lib/server/db/money_request';
import { getUser } from '$lib/server/db/user';
import { sendSocketMessage } from '$lib/server/durrable';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
    const { amount, price } = await request.json();
    const userId = locals.userId;

    if (!amount || !price || !userId) {
        return json({ error: 'Missing amount, price or user' }, { status: 400 });
    }

    const env = platform?.env!!;
    const user = await getUser(env, userId);

    if (!user) {
        return json({ error: 'User not found' }, { status: 404 });
    }
    const pendingRequest = await getMoneyRequestByUserId(env, user.id)
    if (pendingRequest) {
        return error(400, { message: 'You have pending request' });
    }

    const moneyRequest = await createMoneyRequest(env, user.id, amount, price);

    if (user.roomId) {
        const message = {
            type: 'money_request',
            user: user.name,
            amount,
            price,
            id: moneyRequest.id,
        };
        await sendSocketMessage(env, user.roomId, message);
    }


    return json({ success: true });
};
