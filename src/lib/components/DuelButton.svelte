<script lang="ts">
	import type { DuelParticipant } from '$lib/types';

	let {
		getEstimatedPayoutIndex,
		money,
		duelBet,
		participant
	}: {
		getEstimatedPayoutIndex: (money: number, index: number) => number;
		money: number;
		duelBet: (winnerIndex: number) => void;
		participant: DuelParticipant;
	} = $props();
	let kurz = $derived(getEstimatedPayoutIndex(money, participant.winnerIndex).toFixed(2));
	let payout = $derived(
		Math.ceil(getEstimatedPayoutIndex(money, participant.winnerIndex) * money - money)
	);
</script>

<button
	class={`btn ${participant.buttonClass} items-align h-20 w-full flex-col`}
	onclick={() => duelBet(participant.winnerIndex)}
	data-testid={`duelBtn_${participant.winnerIndex}`}
>
	<div class="text-center text-lg font-bold">{participant.name}</div>
	<div class="text-sm font-normal">
		Kurz: {kurz} | Možný zisk: {Math.round(payout)} 🪙
	</div>
</button>
