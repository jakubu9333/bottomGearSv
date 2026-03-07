import { resetRoomByAdminId } from "$lib/server/db/user";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, platform }) => {
	const env = platform?.env!!
	const id = locals.userId;

	if (!id) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}

	const resetRoomResult = await resetRoomByAdminId(env, id)

	if ("error" in resetRoomResult) {
		return error(400, "there was error during reset")
	}
	return json(resetRoomResult)
}
