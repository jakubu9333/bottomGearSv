import { changeNameAndAvatar, getUser } from "$lib/server/db/user";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const actions = {
    changeName: async ({ request, platform, locals }) => {
        const data = await request.formData();
        const name = data.get('name');
        if (!name) {
            return fail(400, { name, missing: true });
        }
        var avatarUrl = data.get('avatarUrl')?.toString();
        if (!avatarUrl || avatarUrl.length == 0) {
            avatarUrl = null
        }
        await changeNameAndAvatar(platform?.env!!, locals.userId, name.toString(), avatarUrl);
        throw redirect(303, "/")
    }
} satisfies Actions;

export const load: PageServerLoad = async ({ locals, platform }) => {
    const userId = locals.userId
    const user = await getUser(platform?.env!!, userId)

    return {
        user
    }
}
