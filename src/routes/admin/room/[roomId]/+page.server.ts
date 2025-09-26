import { getRoomById } from "$lib/server/db/room";
import { getUsersByRoomId } from "$lib/server/db/user";
import { getPendingMoneyRequests } from "$lib/server/db/money_request";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ params, platform }) => {
	const roomId = params.roomId
	const env = platform?.env!!
	const [room, users, moneyRequests] = await Promise.all([
        getRoomById(env, roomId),
        getUsersByRoomId(env, roomId),
        getPendingMoneyRequests(env)
    ])

	return { room, users, moneyRequests }
}