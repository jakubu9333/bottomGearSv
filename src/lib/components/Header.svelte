<script lang="ts">
	import MicrotransactionDialog from '$lib/components/MicrotransactionDialog.svelte';
	import AdminRequestDialog from '$lib/components/AdminRequestDialog.svelte';
	import { AppState, type User } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import { goto } from '$app/navigation';
	let {
		user = $bindable(),
		moneyRequests = $bindable(),
		appState = AppState.NoRound,
		areMoneyRequestsVisible = false
	}: {
		user: User;
		moneyRequests: any[];
		appState: AppState;
		areMoneyRequestsVisible: boolean;
	} = $props();

	async function resetRoom() {
		const resetResp = await fetch('admin/room/reset', { method: 'POST' });
		if (resetResp.ok) {
		}
	}
	async function logout() {
		const reset = await fetch('admin/logout', { method: 'POST' });
		if (reset.ok) {
			goto('/login');
		}
	}
	let microtransactionDialog: MicrotransactionDialog | null = $state(null);
	let adminRequestDialog: AdminRequestDialog | null = $state(null);
	let resetDialog: HTMLDialogElement | null = $state(null);
</script>

<div class="navbar bg-base-100 shadow-md">
	<div class="h-24 w-24 flex-1 rounded">
		<a href="/" class="btn btn-ghost h-24 gap-2 text-xl">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="96px"
				viewBox="0 -960 960 960"
				width="48px"
				fill="var(--color-base-content)"
				><path
					d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z"
				/></svg
			>
			<img src="/BG_Transparent.png" height="96" width="96" />
		</a>
	</div>
	<div class="flex flex-none flex-row gap-2">
		<div class="text-primary flex items-center gap-1 px-2 font-bold">
			{Math.round(user.money)} 🪙
		</div>
		<div class="dropdown dropdown-end">
			<div tabindex="0" data-testid="headerAvatar" role="button">
				<Avatar {user} isOnline={moneyRequests.length > 0} />
			</div>
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
			>
				<li><a data-testid="headerChangeName" href="/name">Change Name and Avatar</a></li>
				{#if user.isAdmin}
					<li>
						<button onclick={() => resetDialog.show()}> Reset room </button>
					</li>
				{/if}
				{#if user.googleId && user.isAdmin}
					<li>
						<button onclick={() => logout()}>Logout</button>
					</li>
				{/if}
				{#if areMoneyRequestsVisible && (appState === AppState.NoRound || appState === AppState.RoundEnded)}
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
					{/if}
				{/if}
			</ul>
		</div>
	</div>
</div>
{#if areMoneyRequestsVisible}
	{#if appState === AppState.NoRound || appState === AppState.RoundEnded}
		<MicrotransactionDialog bind:this={microtransactionDialog} />
	{/if}
	{#if user.isAdmin}
		<AdminRequestDialog bind:this={adminRequestDialog} bind:requests={moneyRequests} />
	{/if}
{/if}
{#if user.isAdmin}
	<dialog bind:this={resetDialog} class="modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Chces fakt resetnut roomku</h3>
			<p>Vsetkym sa nastavia peniaze na default</p>
			<p>Fakt to chces urobit?</p>
			<div class="modal-action">
				<button class="btn" onclick={() => resetDialog.close()}>Nie</button>
				<button
					class="btn btn-error"
					onclick={async () => {
						await resetRoom();

						resetDialog.close();
					}}>Ano</button
				>
			</div>
		</div>
	</dialog>
{/if}
