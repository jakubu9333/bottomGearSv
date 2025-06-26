<script lang="ts">
	import { onMount } from 'svelte';
	import MoneyInput from './MoneyInput.svelte';
	let {
		money = $bindable(),
		betItemToShow = $bindable(),
		makeBetState,
		roomId
	}: {
		money: number;
		userId: number;
		roomId: number;
		betItemToShow: { name: string; money: number };
		makeBetState: () => void;
	} = $props();
	let moneyToBet = $state(0);
	let duel: {
		value: null | Duel;
	} = $state({ value: null });
	type Duel = { id: number; firstName: string; secondName: string };

	async function getDuel(): Promise<Duel | null> {
		const response = await fetch(`/room/${roomId}/duel`);
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

	async function duelBet(winner: string | undefined) {
		if (duel.value === null || winner === undefined) {
			return;
		}
		errorLook = false;
		const betResponse = await fetch('/me/bet', { method: 'post',body:{
			duelId: duel.value.id,
			winner
			money : moneyToBet
			
		} });
		if (betResponse.status >= 300) {
			errorLook = true;
			return;
		}
		const bettedFor = winner;
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
	<button
		class="btn btn-primary"
		disabled={!duel.value}
		onclick={() => duelBet(duel.value?.firstName)}
	>
		{duel.value?.firstName ?? ''}
	</button>
	<button
		class="btn btn-primary"
		disabled={!duel.value}
		onclick={() => duelBet(duel.value?.secondName)}
	>
		{duel.value?.secondName ?? ''}
	</button>
</div>
