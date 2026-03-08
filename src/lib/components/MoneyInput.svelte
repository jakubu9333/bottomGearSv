<script lang="ts">
	type Props = {
		moneyToBet: number;
		money: number;
	};
	let { moneyToBet = $bindable(), money }: Props = $props();
	$effect(() => {
		if (moneyToBet > money) {
			moneyToBet = money;
		}
		if (moneyToBet < 0) {
			moneyToBet = 0;
		}
	});
</script>

<div class="form-control">
	<label for="bet" class="label">
		<span class="label-text text-lg font-semibold">💰 Vybraná suma</span>
	</label>
	<input
		id="bet"
		type="number"
		bind:value={moneyToBet}
		max={money}
		min="0"
		class="input input-bordered input-primary w-full"
		data-testid="moneyInput"
	/>
	<input
		type="range"
		class="range range-primary mt-2 w-full"
		bind:value={moneyToBet}
		min="0"
		max={money}
	/>
</div>
