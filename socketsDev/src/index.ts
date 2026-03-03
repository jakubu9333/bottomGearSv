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
        userSocket = userSocket.filter(s => s !== ws)
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
        userSocket = userSocket.filter(s => s !== ws)
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

app.post("/money_request", async (c) => {
    const { user, amount, price, id }: { user: string, amount: number, price: number, id: number } = await c.req.json()
    sendMessage({ type: "money_request", user, amount, price, id })
    console.log("money_request user ", user, " amount: ", amount)
})

app.post("/money_update", async (c) => {
    const { userId, money }: { userId: number, money: number } = await c.req.json()
    sendMessage({ type: "money_update", userId, money })
    console.log("money_update userId ", userId, " money: ", money)
})

app.get("/sockets", async (c) => {
  console.log("sockets", userSocket.length)
})

serve({
  websocket,
  fetch: app.fetch,
  port: 8787,
})

type MoneyRequestEvent = { type: 'money_request'; user: string; amount: number; price: number, id: number };
type MoneyUpdateEvent = { type: 'money_update'; userId: number; money: number };

function sendMessage(message: EventEvent | BetingEvent | JoinEvent | MoneyRequestEvent | MoneyUpdateEvent) {
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
