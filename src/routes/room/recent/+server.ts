import { getRoomsCreatedToday } from "$lib/server/db/room";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ platform }) => {
    const env = platform?.env!!
    const result = await getRoomsCreatedToday(env)
    if (result.length == 0) {
        return error(404, "no rooms were found")
    }
    return json(result)
}
