<script lang="ts">
	import { onMount } from 'svelte';
	import MoneyInput from './MoneyInput.svelte';
	let {
		money = $bindable(),
		userId,
		betItemToShow = $bindable(),
		makeBetState
	}: {
		money: number;
		userId: number;
		betItemToShow: { name: string; money: number };
		makeBetState: () => void;
	} = $props();
	let moneyToBet = $state(0);
	let duel: {
		value: null | Duel;
	} = $state({ value: null });
	type Duel = { id: number; nameFirst: string; nameSecond: string };

	async function getDuel(): Promise<Duel | null> {
		const response = await fetch('/me/duel');
		if (response.status !== 200) {
			return null;
		}
		const body: Duel = await response.json();
		return body;
	}

	onMount(async () => {
		const duelData = await getDuel();
		if (duelData === null) {
			return;
		}
		duel.value = duelData;
	});
	let errorLook = $state(false);

	async function duelBet(winner: number) {
		if (duel.value === null) {
			return;
		}
		errorLook = false;
		/* const { data, error } = await actions.makeDuelBet({
			winner,
			userId,
			money: moneyToBet,
			duelId: duel.value.id
		});
		if (error) {
			errorLook = true;
			return;
		}
        */
		const bettedFor = winner === 1 ? duel.value.nameFirst : duel.value.nameSecond;
		betItemToShow.name = bettedFor;
		betItemToShow.money = moneyToBet;
		money -= moneyToBet;
		makeBetState();

		moneyToBet = 0;
	}
</script>

<h1 class="mb-4 text-2xl font-bold">Make duel bet</h1>
{#if errorLook}
	<div class="alert alert-error">
		<span>Something went wrong</span>
	</div>
{/if}
<MoneyInput {money} bind:moneyToBet />
<div class="mt-4 flex flex-col gap-4">
	<button class="btn btn-primary" disabled={!duel.value} onclick={() => duelBet(1)}>
		{duel.value?.nameFirst ?? ''}
	</button>
	<button class="btn btn-primary" disabled={!duel.value} onclick={() => duelBet(2)}>
		{duel.value?.nameSecond ?? ''}
	</button>
</div>
