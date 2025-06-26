import { getRoomByUserId } from "$lib/server/db/room";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
    const env = platform?.env!!
    const result = await getRoomByUserId(env, locals.userId)
    if (result.room == null) {
        return redirect(303, "/room")
    }
    return {
        room: result.room,
        user: result.user
    }
}
