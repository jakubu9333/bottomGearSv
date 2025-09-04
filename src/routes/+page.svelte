<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import MicrotransactionDialog from '$lib/components/MicrotransactionDialog.svelte';
    import { onMount } from 'svelte';
    import type { MoneyUpdateEvent } from '$lib/types';

	let { data, form }: PageProps = $props();
	let user = $state(data.user);
	let wantToChangeRoom = $state(false);
	const isAdmin = user?.isAdmin ?? false;
	let microtransactionDialog: MicrotransactionDialog;

    onMount(() => {
        if (user.roomId) {
            const socketUrl = 'ws://localhost:8787';
            const socket = new WebSocket(`${socketUrl}/room/${user.roomId}/ws`);

            socket.addEventListener('message', async (ev: MessageEvent<string>) => {
                const socketData: MoneyUpdateEvent = JSON.parse(ev.data);
                if (socketData.type === 'money_update') {
                    if (socketData.userId === user.id) {
                        const response = await fetch('/me');
                        if (response.ok) {
                            user = await response.json();
                        }
                    }
                }
            });
        }
    });
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<div class="flex flex-col items-center gap-6 text-center">
			<h1 class="text-4xl font-bold">🚗 Bottom Gear</h1>
			<h2 class="text-3xl font-bold">Vitaj {user?.name}</h2>
			<a href="/name" class="w-full max-w-xs">
				<button class="btn btn-primary w-full">Zmenit meno</button>
			</a>
			<button class="btn btn-secondary w-full max-w-xs" onclick={() => microtransactionDialog.show()}>Ziadost o mince</button>
			{#if user.roomId}
				<a href="/room" class="w-full max-w-xs">
					<button class="btn btn-primary w-full">Idem stavkovat</button>
				</a>
				<button
					class="btn btn-primary w-full max-w-xs"
					onclick={() => (wantToChangeRoom = !wantToChangeRoom)}>Zmen roomku</button
				>
			{/if}
			{#if !user.roomId || wantToChangeRoom}
				<form
					method="POST"
					action="?/joinRoom"
					class=" flex w-full max-w-xs flex-col space-y-4"
					use:enhance
				>
					{#if form?.error}
						<div class="alert alert-error">{form.error}</div>
					{/if}
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">Meno roomky</span>
						</div>
						<input
							type="text"
							placeholder="Meno roomky"
							class="input input-bordered w-full"
							required
							name="roomName"
						/>
					</label>

					<button class="btn btn-primary w-full">Pripojit sa do roomky</button>
				</form>
			{/if}
			{#if isAdmin}
				<a href="/admin/room" class="w-full max-w-xs">
					<button class="btn btn-primary w-full">Vytvoriť roomku</button>
				</a>
				<form method="POST" action="?/token" class="w-full max-w-xs" use:enhance>
					<button class="btn btn-secondary w-full">Vygeneruj token</button>
				</form>
				{#if form?.token}
					<div>Token</div>
					<div>{form.token}</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
<MicrotransactionDialog bind:this={microtransactionDialog} />
