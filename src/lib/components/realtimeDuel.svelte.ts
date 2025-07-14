import { createPersistentStore } from "$lib/persistentStorage.svelte"
import type { Duel } from "$lib/types"

export class RealtimeDuel {
  private duel: { value: Duel; };
  private betItem: { value: { name: string; money: number } }
  private allMoney: { value: number; };
  private secondMoney: { value: number; };
  private firstMoney: { value: number; };
  private firstPayoutIndex
  private secondPayoutIndex
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
    this.firstPayoutIndex = $derived(this.allMoney.value / this.firstMoney.value)
    this.secondPayoutIndex = $derived(this.allMoney.value / this.secondMoney.value)
  }

  setDuel(duel: Duel) {
    this.duel.value = duel
  }

  addBet(money: number, winner: string) {
    this.allMoney.value += money
    if (this.duel.value.firstName === winner) {
      this.firstMoney.value += money
    }
    else {
      this.secondMoney.value += money
    }
  }


  getEstimatedPayoutIndex(name: string) {
    if (name === this.duel.value.firstName) {
      return this.firstPayoutIndex
    }
    return this.secondPayoutIndex
  }

  getMyEstimatedPayout() {
    return this.getEstimatedPayoutIndex(this.betItem.value.name) * this.betItem.value.money
  }

  addMybet(money: number, winner: string) {
    this.betItem.value = { name: winner, money }
    this.addBet(money, winner)
  }

  getBetItem() {
    return this.betItem.value
  }
}
