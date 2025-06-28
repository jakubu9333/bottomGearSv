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
		console.log(body);
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
		const betResponse = await fetch('/me/bet', {
			method: 'post',
			body: JSON.stringify({
				duelId: duel.value.id,
				winner,
				money: moneyToBet
			})
		});
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

<div class="rounded-box mx-auto max-w-md space-y-6">
	<h1 class="text-base-content text-center text-3xl font-bold">⚔️ Stávka na duel</h1>
	{#if errorLook}
		<div class="alert alert-error">
			<span>⚠️ Niečo sa pokazilo. Skús znova.</span>
		</div>
	{/if}

	<MoneyInput {money} bind:moneyToBet />
	<div class="flex flex-col gap-4">
		<button
			class="btn btn-primary w-full"
			disabled={!duel.value}
			on:click={() => duelBet(duel.value?.firstName)}
		>
			{duel.value?.firstName ?? 'Hráč 1'}
		</button>
		<button
			class="btn btn-secondary w-full"
			disabled={!duel.value}
			on:click={() => duelBet(duel.value?.secondName)}
		>
			{duel.value?.secondName ?? 'Hráč 2'}
		</button>
	</div>
</div>
