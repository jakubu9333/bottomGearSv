import { getUser } from "$lib/server/db/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
    const userId = locals.userId
    const user = await getUser(platform?.env!!, userId)
    return {
        user
    }
}
