import { changeName } from "$lib/server/db/user";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
    changeName: async ({ request, platform, locals }) => {
        const data = await request.formData();
        const name = data.get('name');
        if (!name) {
            return fail(400, { name, missing: true });
        }
        await changeName(platform?.env!!, locals.userId, name.toString());
        throw redirect(303, "/")
    }
} satisfies Actions;
