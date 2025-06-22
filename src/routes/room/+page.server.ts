import { getRoomByUserId } from "$lib/server/db/room";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
    const env = platform?.env!!
    const result = await getRoomByUserId(env, locals.userId)
    //todo no room
    return {
        room: result.room,
        user: result.user
    }
}
