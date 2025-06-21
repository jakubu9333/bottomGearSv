import type { BottomGearObject } from "../../objects"

export function getDurrableObject(env: Env, roomId: number) {
	const durableObjectId = env.BOTTOM_GEAR_DURRABLE_OBJECT.idFromName(roomId + "")
	const roomDurableObject: DurableObjectStub<BottomGearObject> = env.BOTTOM_GEAR_DURRABLE_OBJECT.get(durableObjectId)
	return roomDurableObject
}
