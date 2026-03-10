<script lang="ts">
	import type { MoneyRequestEvent } from '$lib/types';

	let { requests = $bindable() }: { requests: MoneyRequestEvent[] } = $props();
	let dialog: HTMLDialogElement;
	let error = $state(null);

	async function approveRequest(id: number) {
		const resp = await fetch(`/admin/moneyreq/${id}/approve`, {
			method: 'POST'
		});
		if (!resp.ok) {
			error = await resp.json().then((e) => e.message);
		}
		requests = requests.filter((r) => r.id !== id);
		if (requests.length === 0) {
			dialog.close();
		}
	}

	async function rejectRequest(id: number) {
		const resp = await fetch(`/admin/moneyreq/${id}/reject`, {
			method: 'POST'
		});
		if (!resp.ok) {
			error = await resp.json().then((e) => e.message);
		}
		requests = requests.filter((r) => r.id !== id);
		if (requests.length === 0) {
			dialog.close();
		}
	}

	export function show() {
		error = null;
		dialog.showModal();
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Pending Money Requests</h3>
		{#if error}{/if}
		<ul class="space-y-2">
			{#each requests as request}
				<li class="bg-base-300 flex items-center justify-between rounded px-4 py-2">
					<span>{request.user.name} requested {request.amount} coins for {request.price}€</span>
					<div>
						<button class="btn btn-sm btn-ghost" onclick={() => approveRequest(request.id)}
							>✅</button
						>
						<button class="btn btn-sm btn-ghost" onclick={() => rejectRequest(request.id)}
							>❌</button
						>
					</div>
				</li>
			{/each}
		</ul>
		<div class="modal-action">
			<button class="btn" onclick={() => dialog.close()}>Close</button>
		</div>
	</div>
</dialog>
