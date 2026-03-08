<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import type { MoneyUpdateEvent } from '$lib/types';
	import { fade, fly } from 'svelte/transition';
	import RoomList from '$lib/components/RoomList.svelte';
	import Header from '$lib/components/Header.svelte';

	let { data, form }: PageProps = $props();
	let user = $state(data.user);
	let wantToChangeRoom = $state(false);
	const isAdmin = user?.isAdmin ?? false;
	let roomInput: HTMLInputElement | undefined = $state(undefined);
	let loginForm: HTMLFormElement | undefined = $state(undefined);

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
	let moneyRequests = $state([]);
</script>

<svelte:head>
	<title>Bottom Gear</title>
</svelte:head>

<div class="bg-base-200 min-h-screen font-sans">
	<Header bind:user bind:moneyRequests></Header>

	<main class="container mx-auto p-4 md:p-8">
		<!-- Welcome Hero -->
		<div class="hero bg-base-100 rounded-box mb-8 p-8 shadow-xl" in:fade>
			<div class="hero-content text-center">
				<div class="max-w-md">
					<h1 class="text-5xl font-bold">Hello, {user.name}!</h1>
					<p class="py-6">Ready to place your bets?</p>
					<div class="stats bg-base-200 shadow">
						<div class="stat">
							<div class="stat-title">Current Balance</div>
							<div class="stat-value text-primary">{Math.floor(user.money)} 🪙</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<!-- Room Section -->
			<div class="card bg-base-100 shadow-xl" in:fly={{ y: 20, duration: 500, delay: 100 }}>
				<div class="card-body">
					<h2 class="card-title">Race Room</h2>

					{#if user.roomId}
						<div class="alert alert-success">
							<span>You are currently in a room!</span>
						</div>
						<div class="card-actions mt-4 justify-end">
							<a href="/room" class="btn btn-primary w-full">Enter Room</a>
							<button
								class="btn btn-outline mt-2 w-full"
								onclick={() => (wantToChangeRoom = !wantToChangeRoom)}
							>
								{wantToChangeRoom ? 'Cancel Change' : 'Change Room'}
							</button>
						</div>
					{:else}
						<p>Join a room to start betting!</p>
					{/if}

					{#if !user.roomId || wantToChangeRoom}
						<div class="divider">OR</div>
						<form
							bind:this={loginForm}
							method="POST"
							action="?/joinRoom"
							use:enhance
							class="flex flex-col gap-4"
						>
							{#if form?.error}
								<div role="alert" class="alert alert-error">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6 shrink-0 stroke-current"
										fill="none"
										viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										/></svg
									>
									<span>{form.error}</span>
								</div>
							{/if}
							<label class="input input-bordered flex items-center gap-2">
								Room
								<input
									bind:this={roomInput}
									type="text"
									class="grow"
									placeholder="Name"
									name="roomName"
									required
								/>
							</label>
							<button class="btn btn-secondary w-full">Join Room</button>
							<RoomList {loginForm} {roomInput} isButtonDisabled={false}></RoomList>
						</form>
					{/if}
				</div>
			</div>

			<!-- Admin / Actions Section -->
			<div class="card bg-base-100 shadow-xl" in:fly={{ y: 20, duration: 500, delay: 200 }}>
				<div class="card-body">
					<h2 class="card-title">Actions</h2>
					<div class="flex flex-col gap-2">
						<a href="/name" class="btn btn-neutral w-full">Update Profile Name</a>

						{#if isAdmin}
							<div class="divider">Admin Zone</div>
							<a href="/admin/room" class="btn btn-warning w-full">Create New Room</a>

							<form method="POST" action="?/token" use:enhance>
								<button class="btn btn-error w-full">Generate Session Token</button>
							</form>
							{#if form?.token}
								<div class="mockup-code bg-primary text-primary-content mt-4">
									<pre><code>{form.token}</code></pre>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</main>
</div>
