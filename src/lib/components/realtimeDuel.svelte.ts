import { createPersistentStore } from "$lib/persistentStorage.svelte"
import type { Duel } from "$lib/types"

export class RealtimeDuel {
  private duel: { value: Duel; };
  private betItem: { value: { name: string; money: number } }
  private allMoney: { value: number; };
  private secondMoney: { value: number; };
  private firstMoney: { value: number; };
  constructor() {
    const defaultDuel = { firstName: "", secondName: "", id: 0 }
    this.duel = createPersistentStore<Duel>("duel", defaultDuel)
    const defaultBetItem = {
      name: '',
      money: 0
    };
    this.betItem = createPersistentStore(
      'betItem',
      defaultBetItem
    );
    this.allMoney = createPersistentStore("allMoney", 0)
    this.firstMoney = createPersistentStore("firstMoney", 0)
    this.secondMoney = createPersistentStore("secondMoney", 0)
    $inspect(this.allMoney)
    $inspect(this.firstMoney)
    $inspect(this.secondMoney)
  }

  setDuel = (duel: Duel) => {
    this.duel.value = duel
  }

  addBet = (money: number, winner: string) => {
    this.allMoney.value += money
    if (this.duel.value.firstName === winner) {
      this.firstMoney.value += money
    }
    else {
      this.secondMoney.value += money
    }
  }

  resetBet = () => {
    console.log("reset bet")
    const defaultBetItem = {
      name: '',
      money: 0
    };
    this.allMoney.value = 0
    this.firstMoney.value = 0
    this.secondMoney.value = 0
    this.betItem.value = defaultBetItem
  }

  getEstimatedPayoutIndex = (money: number, index: number) => {
    if (index === 0) {
      return (this.allMoney.value + money) / Math.max(this.firstMoney.value + money, 1)
    }
    return (this.allMoney.value + money) / Math.max(this.secondMoney.value + money, 1)
  }


  private getEstimatedPayoutIndexWithName = (name: string) => {
    if (name === this.duel.value.firstName) {
      return this.allMoney.value / this.firstMoney.value
    }
    return this.allMoney.value / this.secondMoney.value
  }

  getMyEstimatedPayout = () => {
    return this.getEstimatedPayoutIndexWithName(this.betItem.value.name) * this.betItem.value.money
  }

  addMybet = (money: number, winner: string) => {
    this.betItem.value = { name: winner, money }
    //bet comes from socket when validated
    //this.addBet(money, winner)
  }

  getBetItem = () => {
    return this.betItem.value
  }
}
