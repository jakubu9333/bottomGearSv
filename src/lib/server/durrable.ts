import type { SocketMessage } from "$lib/types"
import type { BottomGearObject } from "../../objects"
import { dev } from '$app/environment';

export function getDurrableObject(env: Env, roomId: number) {
	const durableObjectId = env.BOTTOM_GEAR_DURRABLE_OBJECT.idFromName(roomId + "")
	const roomDurableObject: DurableObjectStub<BottomGearObject> = env.BOTTOM_GEAR_DURRABLE_OBJECT.get(durableObjectId)
	return roomDurableObject
}

async function mockDurableForDev(roomId: number, message: SocketMessage) {
	await fetch(`http://localhost:8787/${message.type}`, { method: "POST", body: JSON.stringify({ ...message, roomId }) })
}

export async function sendSocketMessage(env: Env, roomId: number, message: SocketMessage) {
	if (dev) {
		await mockDurableForDev(roomId, message);
	} else {
		const durableObject = getDurrableObject(env, roomId);
		await durableObject.broadcast(message);
	}
}
