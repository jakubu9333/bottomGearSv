<script lang="ts">
	import type { RealtimeDuel } from '$lib/components/realtimeDuel.svelte';
	import { AppState, type User } from '$lib/types';

	let {
		betDataHolder,
		user,
		roomState = $bindable()
	}: { betDataHolder: RealtimeDuel; user: User; roomState: AppState } = $props();
	let error = $state('');
	async function resetBet() {
		const reset = await fetch(`admin/duel/${betDataHolder.getDuelId()}/reset`, { method: 'POST' });
		if (!reset.ok) {
			error = await reset.json().then((e) => e.message);
		}
	}
</script>

<div class="flex flex-col items-center space-y-6 text-center">
	{#if !betDataHolder.getIsBetted()}
		<div class="bg-warning/10 text-warning rounded-full p-4">
			<span class="text-4xl font-bold">!</span>
		</div>
		<div class="space-y-2">
			<h2 class="text-warning text-2xl font-bold">Stávka nebola odoslaná</h2>
			<p class="text-base-content/70 text-sm">Počkaj na vyhodnotenie kola</p>
		</div>
	{:else}
		<div class="bg-success/10 text-success rounded-full p-4 text-4xl">✓</div>
		<div class="space-y-2">
			<h2 class="text-success text-2xl font-bold">Stávka úspešne prijatá</h2>
			<div class="badge badge-outline badge-lg mt-2 h-auto py-4 whitespace-normal">
				Stavené {Math.round(betDataHolder?.getBetItem().money)} na
				<span class="ml-1 font-bold">{betDataHolder?.getBetItem().name}</span>
			</div>
		</div>

		<div class="stats bg-base-200 w-full shadow">
			<div class="stat place-items-center">
				<div class="stat-title text-xs uppercase opacity-70">Možná výhra</div>
				<div class="stat-value text-2xl">
					{Math.round(betDataHolder?.getMyEstimatedPayout())}
				</div>
			</div>
			<div class="stat border-base-300 place-items-center border-l">
				<div class="stat-title text-xs uppercase opacity-70">Čistý zisk</div>
				<div class="stat-value text-success text-2xl">
					{Math.round(betDataHolder?.getMyEstimatedPayout() - betDataHolder.getBetItem().money)}
				</div>
			</div>
		</div>

		<div class="divider"></div>
		<p class="text-base-content/60 flex items-center gap-2 text-sm italic">
			<span class="loading loading-dots loading-xs"></span>
			Prebieha vyhodnocovanie kola
		</p>
	{/if}
	{#if user.isAdmin && roomState == AppState.DuelBetEnded}
		{#if error.length > 0}
			<span class="alert alert-error">{error}</span>
		{/if}
		<button class="btn btn-error" onclick={() => resetBet()}>Resetovat stavku</button>
	{/if}
</div>
