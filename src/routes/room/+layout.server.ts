import { getUser } from "$lib/server/db/user";
import { getPendingMoneyRequests } from "$lib/server/db/money_request";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, platform }) => {
    const userId = locals.userId;
    const user = await getUser(platform?.env!!, userId);

    if (user.isAdmin) {
        const moneyRequests = await getPendingMoneyRequests(platform?.env!!);
        return {
            user,
            moneyRequests
        };
    }

    return {
        user
    };
};
