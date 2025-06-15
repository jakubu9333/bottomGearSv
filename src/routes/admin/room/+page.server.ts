import { createRoom } from "$lib/server/db/room";
import { fail, type Actions } from "@sveltejs/kit";

export const actions = {
	default: async ({ request, platform }) => {
		if (platform === undefined) {
			return fail(400)
		}
		const data = await request.formData()
		const room = data.get('room')
		if (!room || room instanceof File || room.length == 0) {
			return fail(400, { room, missing: true });
		}
		const createdRoom = await createRoom(platform.env, room)
		return createdRoom

	}
} satisfies Actions;
