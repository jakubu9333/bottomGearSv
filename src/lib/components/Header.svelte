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

<header class="navbar bg-base-100">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl normal-case">Bottom Gear</a>
	</div>
	<div class="flex-none">
		<ul class="menu menu-horizontal px-1">
			{#if user.isAdmin}
				<li>
					<button class="indicator" onclick={() => adminRequestDialog?.show()}>
						{#if moneyRequests && moneyRequests.length > 0}
							<span class="indicator-item badge badge-secondary"></span>
						{/if}
						Admin
					</button>
				</li>
			{/if}
			<li>
				<button onclick={() => microtransactionDialog?.show()}>Request coins</button>
			</li>
			<li>
				<span>{user.money} coins</span>
			</li>
		</ul>
	</div>
</header>
{#if appState === AppState.NoRound || appState === AppState.RoundEnded}
	<MicrotransactionDialog bind:this={microtransactionDialog} />
{/if}
{#if user.isAdmin}
	<AdminRequestDialog bind:this={adminRequestDialog} bind:requests={moneyRequests} />
{/if}
