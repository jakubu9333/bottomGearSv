import { eq, sum, sql } from "drizzle-orm"
import { db } from "."
import { duelBet, user } from "./schema"


export const createNewBet = async (env: Env, money: number, winner: string, duelId: number, userId: number
) => {
  return (await db(env).insert(duelBet).values({
    money,
    winner,
    duelId,
    userId
  }).returning())[0]
}

export const getAllBetMoneyForDuel = async (env: Env, duelId: number) => {
  const duels = (await db(env).select({ winner: duelBet.winner, money: sum(duelBet.money) }).from(duelBet).where(eq(duelBet.duelId, duelId)).groupBy(duelBet.winner))
  return duels
}

export const setWinnerMoney = async (env: Env, duelId: number, winner: string) => {
  const dbEnv = db(env)
  const result = await dbEnv.run(sql`
    WITH bet_calculations AS (
      SELECT 
        b.user_id,
        b.money as my_bet,
        pools.total_pool,
        pools.winning_pool,
        CASE 
          WHEN pools.winning_pool > 0 
          THEN Cast(((pools.total_pool * b.money) / pools.winning_pool + 0.9999) as integer)
          ELSE 0 
        END as payout
      FROM ${duelBet} b
      CROSS JOIN (
        SELECT 
          SUM(money) as total_pool,
          SUM(CASE WHEN winner = ${winner} THEN money ELSE 0 END) as winning_pool
        FROM ${duelBet}
        WHERE duel_id = ${duelId}
      ) as pools
      WHERE b.duel_id = ${duelId} 
        AND b.winner = ${winner}
    )
    UPDATE ${user} 
    SET money = money + bet_calculations.payout
    FROM bet_calculations
    WHERE ${user.id} = bet_calculations.user_id
    RETURNING ${user.id}, ${user.money}
  `);

  return result.results;
}
