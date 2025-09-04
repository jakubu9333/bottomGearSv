<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";

    let dialog: HTMLDialogElement;
    let amount = 250;
    const pricePerCoin = 10 / 250;

    async function requestMoney() {
        await fetch('/moneyreq/create', {
            method: 'POST',
            body: JSON.stringify({ amount, price: amount * pricePerCoin }),
        });
        dialog.close();
    }

    export function show() {
        dialog.showModal();
    }
</script>

<dialog bind:this={dialog} class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Request coins</h3>
        <div class="form-control">
            <label class="label" for="amount">
                <span class="label-text">Amount</span>
            </label>
            <input type="number" id="amount" class="input input-bordered" bind:value={amount} />
        </div>
        <p class="py-4">Price: {(amount * pricePerCoin).toFixed(2)}€</p>
        <p>You can pay by cash or by bank transfer.</p>
        <p>IBAN: DE89 3704 0044 0532 0130 00</p>
        <p>Please include your username in the transfer description.</p>
        <p>A QR code will be available soon.</p>
        <div class="modal-action">
            <button class="btn" on:click={() => dialog.close()}>Cancel</button>
            <button class="btn btn-primary" on:click={requestMoney}>Confirm Request</button>
        </div>
    </div>
</dialog>
