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

  getEstimatedPayoutIndex = (money: number, index: number) => {
    if (money === 0) {
      return 1
    }
    if (index === 0) {
      return (this.allMoney.value + money) / (this.firstMoney.value + money)
    }
    return (this.allMoney.value + money) / (this.secondMoney.value + money)
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
    this.addBet(money, winner)
  }

  getBetItem = () => {
    return this.betItem.value
  }
}
