import { createRoom } from "$lib/server/db/room";
import { setUserRoomId } from "$lib/server/db/user";
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const actions = {
	default: async ({ request, platform, locals }) => {
		if (platform === undefined) {
			return fail(400)
		}
		const data = await request.formData()
		const room = data.get('room')
		const defaultMoney = data.get("defaultMoney")
		if (!room || room instanceof File || room.length == 0) {
			return fail(400, { room, missing: true });
		}
		if (!defaultMoney || defaultMoney instanceof File || typeof (+defaultMoney) != "number") {
			return fail(400, { defaultMoney, missing: true });
		}
		const createdRoom = await createRoom(platform.env, room, +defaultMoney)
		await setUserRoomId(platform.env, locals.userId, createdRoom.id)
		if (createdRoom) {
			return redirect(303, `/admin/room/${createdRoom.id}`)
		}
		else {
			return fail(400, { message: "room can't ber created" })
		}

	}
} satisfies Actions;

