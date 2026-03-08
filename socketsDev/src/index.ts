import { serve } from 'bun'
import { Hono } from 'hono'

import { createBunWebSocket } from 'hono/bun'
import { WSContext } from 'hono/ws'

const { upgradeWebSocket, websocket } = createBunWebSocket()
const app = new Hono()

// Map to store sockets by roomId
const roomSockets = new Map<string, WSContext<unknown>[]>();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get(
  '/room/:roomId/ws',
  upgradeWebSocket((c) => {
    const roomId = c.req.param('roomId');
    return {
      onOpen(_event, ws) {
        console.log(`opened socket for room ${roomId}`)
        const sockets = roomSockets.get(roomId) || [];
        sockets.push(ws);
        roomSockets.set(roomId, sockets);
      },
      onClose(_event, ws) {
        console.log(`closed ws for room ${roomId}`)
        const sockets = roomSockets.get(roomId) || [];
        const filtered = sockets.filter(s => s !== ws);
        if (filtered.length === 0) {
          roomSockets.delete(roomId);
        } else {
          roomSockets.set(roomId, filtered);
        }
      }
    }
  })
)

app.get(
  '/admin/room/:roomId/ws',
  upgradeWebSocket((c) => {
    const roomId = c.req.param('roomId');
    return {
      onOpen(_event, ws) {
        console.log(`opened socket admin for room ${roomId}`)
        const sockets = roomSockets.get(roomId) || [];
        sockets.push(ws);
        roomSockets.set(roomId, sockets);
      },
      onClose(_event, ws) {
        console.log(`closed ws admin for room ${roomId}`)
        const sockets = roomSockets.get(roomId) || [];
        const filtered = sockets.filter(s => s !== ws);
        if (filtered.length === 0) {
          roomSockets.delete(roomId);
        } else {
          roomSockets.set(roomId, filtered);
        }
      }
    }
  })
)


app.post("/bet", async (c) => {
  const { money, winner, roomId }: { money: number, winner: string, roomId: number } = await c.req.json()
  sendMessage(roomId + "", { type: "bet", money, winner })
  console.log(`bet money ${money} winner: ${winner} in room ${roomId}`)
  return c.json({ success: true })
})

app.post("/join", async (c) => {
  const { user, roomId }: { user: string, roomId: number } = await c.req.json()
  sendMessage(roomId + "", { type: "join", user })
  console.log(`join name ${user} in room ${roomId}`)
  return c.json({ success: true })
})

app.post("/event", async (c) => {
  const { event, roomId }: { event: EventType, roomId: number } = await c.req.json()
  sendMessage(roomId + "", { type: "event", event })
  console.log(`event ${event} in room ${roomId}`)
  return c.json({ success: true })
})

app.post("/money_request", async (c) => {
    const { user, amount, price, id, roomId }: { user: string, amount: number, price: number, id: number, roomId: number } = await c.req.json()
    sendMessage(roomId + "", { type: "money_request", user, amount, price, id })
    console.log(`money_request user ${user} amount: ${amount} in room ${roomId}`)
    return c.json({ success: true })
})

app.post("/money_update", async (c) => {
    const { userId, money, roomId }: { userId: number, money: number, roomId: number } = await c.req.json()
    sendMessage(roomId + "", { type: "money_update", userId, money })
    console.log(`money_update userId ${userId} money: ${money} in room ${roomId}`)
    return c.json({ success: true })
})

app.get("/sockets", async (c) => {
  let total = 0;
  roomSockets.forEach(s => total += s.length);
  console.log("total sockets", total)
  return c.json({ total })
})

serve({
  websocket,
  fetch: app.fetch,
  port: 8787,
})

type MoneyRequestEvent = { type: 'money_request'; user: string; amount: number; price: number, id: number };
type MoneyUpdateEvent = { type: 'money_update'; userId: number; money: number };

function sendMessage(roomId: string, message: EventEvent | BetingEvent | JoinEvent | MoneyRequestEvent | MoneyUpdateEvent) {
  const sockets = roomSockets.get(roomId);
  console.log(`Broadcasting ${message.type} to room ${roomId} (${sockets?.length || 0} sockets)`)
  if (sockets) {
    sockets.forEach(socket => {
      socket.send(JSON.stringify(message))
    })
  }
}

enum EventType {
  DuelBetStart,
  DuelBetPlaced,
  DuelBetEnd,
  RoundEnd,
}
type EventEvent = { type: 'event'; event: EventType };
type BetingEvent = { type: 'bet'; money: number; winner: string };
type JoinEvent = {
  type: 'join';
  user: string;
};
