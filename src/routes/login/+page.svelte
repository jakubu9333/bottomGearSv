<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import RoomList from '$lib/components/RoomList.svelte';
	let { form }: PageProps = $props();
	let isMessenger = $state(false);
	onMount(() => {
		const ua = navigator.userAgent;
		isMessenger = ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram');
	});
	let roomInput: HTMLInputElement | undefined = $state(undefined);
	let loginForm: HTMLFormElement | undefined = $state(undefined);
</script>

<svelte:head><title>Bottom Gear | Login</title></svelte:head>
<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<h1 class="mb-6 text-center text-3xl font-bold">👑 Vstúp do Bottom Gearu</h1>
		{#if isMessenger}
			<div class="alert alert-warning mb-6">Prihlasenie povolene len v browseri</div>
		{/if}

		<!-- Prihlasovací formulár -->
		<form bind:this={loginForm} class="flex flex-col space-y-4" method="POST" use:enhance>
			{#if form?.error}
				<div class="alert alert-error">{form.error}</div>
			{/if}
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">Tvoje prihlasovacie meno</span>
				</div>
				<input
					type="text"
					placeholder="Prihlasovacie meno"
					class="input input-bordered w-full"
					required
					name="username"
				/>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">Meno roomky</span>
				</div>
				<input
					bind:this={roomInput}
					type="text"
					placeholder="Meno roomky"
					class="input input-bordered w-full"
					required
					name="room"
				/>
			</label>
			<button type="submit" disabled={isMessenger} class="btn btn-primary w-full"
				>Prihlásiť sa</button
			>
			<RoomList {roomInput} {loginForm} isButtonDisabled={isMessenger}></RoomList>
		</form>

		<!-- Oddelovač -->
		<div class="divider text-sm">alebo</div>

		<!-- Google OAuth (voliteľne) -->
		<a href="/login/google" class="w-full">
			<button class="btn btn-outline flex w-full items-center justify-center gap-2">
				<img
					src="https://www.svgrepo.com/show/475656/google-color.svg"
					alt="Google"
					class="h-5 w-5"
				/>
				<span>Prihlásiť sa cez Google</span>
			</button>
		</a>

		<!-- Info text -->
		<p class="text-base-content/60 mt-6 text-center text-xs">
			Pokial nepoužijes Google, tento účet bude dostupný len na tomto zariadení.
		</p>
	</div>
</div>
