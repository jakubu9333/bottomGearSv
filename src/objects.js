import { DurableObject } from "cloudflare:workers";

export class BottomGearObject extends DurableObject {

	constructor(ctx, env) {
		super(ctx, env)
	}
	async fetch(request) {
		// Creates two ends of a WebSocket connection.
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws, message) {
		// we don't handle any messages from the client for now
	}

	async webSocketClose(ws, code, reason, wasClean) {
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(code, "Durable Object is closing WebSocket");
	}

	async broadcast(message) {
		for (const socket of this.ctx.getWebSockets()) {
			socket.send(JSON.stringify(message));
		}
	}
}
