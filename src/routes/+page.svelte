<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const user = data.user;
	let wantToChangeRoom = $state(false);
	const isAdmin = user?.isAdmin ?? false;
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<div class="flex flex-col items-center gap-6 text-center">
			<h1 class="text-4xl font-bold">🚗 Bottom Gear</h1>
			<h2 class="text-3xl font-bold">Vitaj {user?.name}</h2>
			<a href="/name" class="w-full max-w-xs">
				<button class="btn btn-primary w-full">Zmenit meno</button>
			</a>
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
