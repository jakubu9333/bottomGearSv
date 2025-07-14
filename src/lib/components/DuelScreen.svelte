<script lang="ts">
	import { onMount } from 'svelte';
	import MoneyInput from './MoneyInput.svelte';
	import type { Duel } from '$lib/types';
	let {
		money = $bindable(),
		setBetItem,
		makeBetState,
		getEstimatedPayout: getEstimatedPayoutIndex,
		roomId
	}: {
		money: number;
		userId: number;
		roomId: number;
		setBetItem: (money: number, name: string) => void;
		getEstimatedPayout: (name: string) => number;
		makeBetState: () => void;
	} = $props();
	let moneyToBet = $state(0);
	let duel: {
		value: null | Duel;
	} = $state({ value: null });

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
	let moneyWarning = $state(false);

	async function duelBet(winner: string | undefined) {
		if (moneyToBet === 0) {
			moneyWarning = true;
			return;
		}
		moneyWarning = false;
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
		setBetItem(money, winner);
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
	{#if moneyWarning}
		<div class="alert alert-warning">
			<span>⚠️ NStavka s nulou nie je povolená.</span>
		</div>
	{/if}

	<MoneyInput {money} bind:moneyToBet />
	<div class="flex flex-col gap-4">
		<button
			class="btn btn-primary w-full"
			disabled={!duel.value}
			onclick={() => duelBet(duel.value?.firstName)}
		>
			{duel.value?.firstName ?? 'Hráč 1'}
		</button>
		{#if duel.value}
			<p class="text-base-content/70 text-center text-sm">
				Zisk: {Math.round(getEstimatedPayoutIndex(duel.value.firstName) * moneyToBet)}💰
			</p>
		{/if}
		<button
			class="btn btn-secondary w-full justify-between"
			disabled={!duel.value}
			onclick={() => duelBet(duel.value?.secondName)}
		>
			<p class="font-semibold">{duel.value?.secondName}</p>
			<span class="text-sm">Stav</span>
		</button>
	</div>
</div>
