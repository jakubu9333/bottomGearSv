import { serve } from 'bun'
import { Hono } from 'hono'

import { createBunWebSocket } from 'hono/bun'
import { WSContext } from 'hono/ws'

const { upgradeWebSocket, websocket } = createBunWebSocket()
const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get(
  '/room/*/ws',
  upgradeWebSocket((c) => {
    return {
      onOpen(_event, ws) {
        console.log("opened socket")
        userSocket.push(ws)
      },
      onClose(_event, ws) {
        console.log("closed ws")
      }
    }
  })
)

app.get(
  '/admin/room/*/ws',
  upgradeWebSocket((c) => {
    return {
      onOpen(_event, ws) {
        console.log("opened socket admin")
        userSocket.push(ws)
      },
      onClose(_event, ws) {
        console.log("closed ws admin")
      }
    }
  })
)


app.post("/bet", async (c) => {
  const { money, winner }: { money: number, winner: string } = await c.req.json()
  sendMessage({ type: "bet", money, winner })
  console.log("bet money ", money, " winner: ", winner)
})

app.post("/join", async (c) => {
  const { user }: { user: string } = await c.req.json()
  sendMessage({ type: "join", user })
  console.log("join name ", user)
})

app.post("/event", async (c) => {
  const { event }: { event: EventType } = await c.req.json()
  sendMessage({ type: "event", event })
  console.log("event", event)
})
app.get("/sockets", async (c) => {
  console.log("sockets", userSocket.length)
})

serve({
  websocket,
  fetch: app.fetch,
  port: 8787,
})





function sendMessage(message: EventEvent | BetingEvent | JoinEvent) {
  userSocket.forEach(socket => {
    socket.send(JSON.stringify(message))
  })
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

let userSocket: WSContext<unknown>[] = []

