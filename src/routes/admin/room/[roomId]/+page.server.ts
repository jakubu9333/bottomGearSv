import { getRoomById } from "$lib/server/db/room";
import { getUsersByRoomId } from "$lib/server/db/user";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ params, platform }) => {
	const roomId = params.roomId
	const env = platform?.env!!
	const [room, users] = await Promise.all([await getRoomById(env, roomId), await getUsersByRoomId(env, roomId)])

	return { room, users }
}
