<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from '../$types';
	import { enhance } from '$app/forms';
	let { data }: PageProps = $props();

	let users: { name: string }[] = $state(data.users);
	let room = data.room;

	let socket: WebSocket | null = $state(null);
	type JoinEvent = {
		type: 'join';
		user: string;
	};
	onMount(() => {
		socket = new WebSocket(`ws://localhost:8787/admin/room/${room.id}/ws`);
		if (socket) {
			socket.addEventListener('open', (_) => {
				console.log('open');
			});
			socket.addEventListener('message', (ev: MessageEvent<string>) => {
				console.log(ev);
				const socketData: JoinEvent = JSON.parse(ev.data);
				if (socketData.type == 'join') {
					users.push({ name: socketData.user });
				}
			});
		}
	});
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<h1 class="mb-6 text-center text-3xl font-bold">
			Ludia v roomke {room.name}
		</h1>
		<form method="post" use:enhance>
			<button class="btn btn-primary my-2 w-full">Zacni prvy duel</button>
		</form>

		<ul class="space-y-2">
			{#each users as person}
				<li class="bg-base-300 rounded px-4 py-2">{person.name}</li>
			{/each}
		</ul>
	</div>
</div>
