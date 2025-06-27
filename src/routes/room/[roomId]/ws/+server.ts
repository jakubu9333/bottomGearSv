import { getDurrableObject } from "$lib/server/durrable";
import type { RequestHandler } from "@sveltejs/kit";


export const GET: RequestHandler = async ({ platform, request, params }) => {
	const env = platform?.env!!
	const durrableObject = getDurrableObject(env, +params.roomId)
	return durrableObject.fetch(request)
}
