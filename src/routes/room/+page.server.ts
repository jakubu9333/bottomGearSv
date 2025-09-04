import { getRoomByUserId } from "$lib/server/db/room";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { getPendingMoneyRequests } from "$lib/server/db/money_request";

export const load: PageServerLoad = async ({ locals, platform }) => {
    const env = platform?.env!!
    const result = await getRoomByUserId(env, locals.userId)
    if (result.room == null) {
        return redirect(303, "/room")
    }

    if (result.user.isAdmin) {
        const moneyRequests = await getPendingMoneyRequests(env);
        return {
            room: result.room,
            user: result.user,
            moneyRequests
        }
    }

    return {
        room: result.room,
        user: result.user
    }
}