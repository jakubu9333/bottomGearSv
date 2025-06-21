import { getDurrableObject } from "$lib/server/durrable";
import type { RequestEvent } from "../$types";


export async function GET(event: RequestEvent): Promise<Response> {
	const env = event.platform?.env!!
	const durrableObject = getDurrableObject(env, +event.params.roomid)
	return durrableObject.fetch(event.request)
}
