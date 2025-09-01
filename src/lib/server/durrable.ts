import type { BetingEvent, EventEvent, JoinEvent } from "$lib/types"
import type { BottomGearObject } from "../../objects"

export function getDurrableObject(env: Env, roomId: number) {
	const durableObjectId = env.BOTTOM_GEAR_DURRABLE_OBJECT.idFromName(roomId + "")
	const roomDurableObject: DurableObjectStub<BottomGearObject> = env.BOTTOM_GEAR_DURRABLE_OBJECT.get(durableObjectId)
	return roomDurableObject
}

export async function mockDurableForDev(message: EventEvent | JoinEvent | BetingEvent) {
	await fetch(`http:\\localhost:8787/${message.type}`, { method: "POST", body: JSON.stringify(message) })
}

