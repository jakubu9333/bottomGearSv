<script lang="ts">
	import { PUBLIC_IBAN } from '$env/static/public';
	let dialog: HTMLDialogElement;
	let amount = $state(250);
	const pricePerCoin = 10 / 250;

	async function requestMoney() {
		await fetch('/moneyreq/create', {
			method: 'POST',
			body: JSON.stringify({ amount, price: amount * pricePerCoin })
		});
		dialog.close();
	}

	export function show() {
		dialog.showModal();
	}
	const MAX_MONEY = 1000;
	$effect(() => {
		if (amount > MAX_MONEY) {
			amount = MAX_MONEY;
		}
	});
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Request coins</h3>
		<div class="form-control">
			<label class="label" for="amount">
				<span class="label-text">Amount</span>
			</label>
			<input type="number" id="amount" class="input input-bordered" bind:value={amount} />
		</div>
		<p class="py-4">Price: {(amount * pricePerCoin).toFixed(2)}€</p>
		<p>You can pay by cash or by bank transfer.</p>
		<p>IBAN: {IBAN}</p>
		<p>Please include your username in the transfer description.</p>
		<div class="modal-action">
			<button class="btn" onclick={() => dialog.close()}>Cancel</button>
			<button class="btn btn-primary" onclick={requestMoney}>Confirm Request</button>
		</div>
	</div>
</dialog>
