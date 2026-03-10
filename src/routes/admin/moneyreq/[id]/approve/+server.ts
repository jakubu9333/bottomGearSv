import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { approveMoneyRequest, getMoneyRequestById } from '$lib/server/db/money_request';
import { addUserMoney, getUser } from '$lib/server/db/user';
import { sendSocketMessage } from '$lib/server/durrable';

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

    const updatedUser = await addUserMoney(env, moneyRequest.userId, moneyRequest.amount);
    await approveMoneyRequest(env, id);

    const user = await getUser(env, moneyRequest.userId);
    if (user.roomId) {
        const message = {
            type: 'money_update',
            userId: user.id,
            money: updatedUser.money,
        };
        await sendSocketMessage(env, user.roomId, message);
    }

    return json({ success: true });
};
