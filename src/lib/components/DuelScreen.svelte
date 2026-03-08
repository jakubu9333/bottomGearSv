<script lang="ts">
	import { onMount } from 'svelte';
	import MoneyInput from './MoneyInput.svelte';
	import DuelButton from './DuelButton.svelte';
	import type { Duel, DuelParticipant } from '$lib/types';
	let {
		money = $bindable(),
		setBetItem,
		setDuel,
		makeBetState,
		getEstimatedPayoutIndex,
		roomId
	}: {
		money: number;
		userId: number;
		roomId: number;
		setDuel: (duel: Duel) => void;
		setBetItem: (money: number, name: string) => void;
		getEstimatedPayoutIndex: (money: number, index: number) => number;
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
		return body;
	}

	onMount(async () => {
		const duelData = await getDuel();
		if (duelData === null) {
			return;
		}
		duel.value = duelData;
		participants = [
			{
				name: duelData.firstName,
				winnerIndex: 0,
				buttonClass: 'btn-primary'
			},
			{
				name: duelData.secondName,
				winnerIndex: 1,
				buttonClass: 'btn-secondary'
			}
		] satisfies DuelParticipant[];
		setDuel(duelData);
	});
	let participants: DuelParticipant[] = $state([]);
	let errorLook = $state(false);
	let moneyWarning = $state(false);

	async function duelBet(winnerIndex: number | undefined) {
		if (moneyToBet === 0) {
			moneyWarning = true;
			return;
		}
		moneyWarning = false;
		if (duel === null || duel.value === null || winnerIndex === undefined) {
			return;
		}
		let winner;
		if (winnerIndex === 0) {
			winner = duel.value.firstName;
		} else {
			winner = duel.value.secondName;
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
		setBetItem(moneyToBet, winner);
		money -= moneyToBet;
		makeBetState();

		moneyToBet = 0;
	}
</script>

<div class="flex flex-col gap-6">
	<div class="text-center">
		<h2 class="text-base-content text-2xl font-bold tracking-tight uppercase">
			Nová stávka na duel
		</h2>
	</div>

	{#if errorLook}
		<div class="alert alert-error py-2 shadow-sm">
			<span>Chyba pri spracovaní. Skús to znova.</span>
		</div>
	{/if}
	{#if moneyWarning}
		<div class="alert alert-warning py-2 shadow-sm" data-testid="zeroWarning">
			<span>Suma stávky musí byť vyššia ako nula.</span>
		</div>
	{/if}

	<div class="bg-base-200 flex items-center justify-center rounded-xl py-2 shadow-inner">
		<p class="text-base-content/70 text-sm">
			Tvoj zostatok: <span class="font-bold">{Math.round(money)} 🪙</span>
		</p>
	</div>

	<div class="space-y-4">
		<MoneyInput {money} bind:moneyToBet />
		<div class="flex flex-col gap-3">
			{#each participants as participant}
				<DuelButton {duelBet} money={moneyToBet} {participant} {getEstimatedPayoutIndex} />
			{/each}
		</div>
	</div>
</div>
