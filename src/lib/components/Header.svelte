<script lang="ts">
	import MicrotransactionDialog from '$lib/components/MicrotransactionDialog.svelte';
	import AdminRequestDialog from '$lib/components/AdminRequestDialog.svelte';
	import { AppState, type User } from '$lib/types';

	let {
		user = $bindable(),
		moneyRequests = $bindable(),
		appState
	}: { user: User; moneyRequests: any[]; appState: AppState } = $props();

	let microtransactionDialog: MicrotransactionDialog | null = $state(null);
	let adminRequestDialog: AdminRequestDialog | null = $state(null);
</script>

<div class="navbar bg-base-100 shadow-md">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost gap-2 text-xl">
			<span class="text-2xl">🚗</span> Bottom Gear
		</a>
	</div>
	<div class="flex flex-none flex-row gap-2">
		<div class="text-primary flex items-center gap-1 px-2 font-bold">
			{Math.floor(user.money)} 🪙
		</div>
		<div class="dropdown dropdown-end">
			<div
				tabindex="0"
				role="button"
				class={'btn btn-ghost btn-circle avatar placeholder' +
					`${moneyRequests.length > 0 ? ' avatar-online' : ''}`}
			>
				<div class="bg-neutral text-neutral-content w-10 rounded-full">
					<span class="text-xl">{user.name.charAt(0).toUpperCase()}</span>
				</div>
			</div>
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
			>
				<li><a href="/name">Change Name</a></li>
				<li>
					<button onclick={() => microtransactionDialog?.show()}>Request Coins</button>
				</li>
				{#if user.isAdmin}
					<li>
						<button
							onclick={() => adminRequestDialog?.show()}
							disabled={moneyRequests.length == 0 || !moneyRequests}
						>
							Pending requests
							{#if moneyRequests && moneyRequests.length > 0}
								<span class="badge badge-secondary badge-sm">{moneyRequests.length}</span>
							{/if}
						</button>
					</li>
					<li>
						<button onclick={() => alert('not implemented')}> Reset room </button>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</div>

{#if appState === AppState.NoRound || appState === AppState.RoundEnded}
	<MicrotransactionDialog bind:this={microtransactionDialog} />
{/if}
{#if user.isAdmin}
	<AdminRequestDialog bind:this={adminRequestDialog} bind:requests={moneyRequests} />
{/if}
