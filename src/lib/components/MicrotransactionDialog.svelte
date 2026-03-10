<script lang="ts">
	import { PUBLIC_IBAN } from '$env/static/public';
	let dialog: HTMLDialogElement;
	let amount = $state(250);
	const pricePerCoin = 10 / 250;
	let isLoading = $state(false);
	let error = $state(null);

	async function requestMoney() {
		let finalAmount = amount;
		if (finalAmount > MAX_MONEY) finalAmount = MAX_MONEY;
		if (finalAmount < MIN_MONEY) finalAmount = MIN_MONEY;
		isLoading = true;
		const requestCreation = await fetch('/moneyreq/create', {
			method: 'POST',
			body: JSON.stringify({ amount: finalAmount, price: finalAmount * pricePerCoin })
		});
		isLoading = false;
		if (requestCreation.ok) {
			dialog.close();
		} else {
			error = await requestCreation.json().then((e) => e.message);
		}
	}

	export function show() {
		dialog.showModal();
		isLoading = false;
		error = null;
	}
	function closeDialog() {
		dialog.close();
	}
	const MAX_MONEY = 1000;
	const MIN_MONEY = 50;
	$effect(() => {
		if (amount > MAX_MONEY) {
			amount = MAX_MONEY;
		}
		if (amount < MIN_MONEY) {
			amount = MIN_MONEY;
		}
	});
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		{#if error != null}
			<h3 class="text-lg font-bold">Request coins error</h3>
			<p>There was an error:</p>
			<p>{error}</p>
		{:else}
			<h3 class="text-lg font-bold">Request coins</h3>
			<div class="form-control">
				<label class="label" for="amount">
					<span class="label-text">Amount</span>
				</label>
				<input type="number" id="amount" class="input input-bordered" bind:value={amount} />
			</div>
			<p class="py-4">Price: {(amount * pricePerCoin).toFixed(2)}€</p>
			<p>You can pay by cash or by bank transfer.</p>
			<p>IBAN: {PUBLIC_IBAN}</p>
			<p>Please include your username in the transfer description.</p>
		{/if}
		<div class="modal-action">
			{#if error != null}
				<button class="btn btn-error" onclick={() => closeDialog()}>Ok</button>
			{:else}
				<button class="btn" onclick={() => closeDialog()}>Cancel</button>
				<button class="btn btn-primary" onclick={requestMoney}>Confirm Request</button>
			{/if}
		</div>
	</div>
</dialog>
