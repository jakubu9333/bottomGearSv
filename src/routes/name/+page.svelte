<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Bottom Gear | Change Name</title>
</svelte:head>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<div class="flex flex-col items-center gap-6 text-center">
			<h1 class="text-4xl font-bold">Zmena mena</h1>
			<form
				method="POST"
				action="?/changeName"
				class="flex w-full max-w-xs flex-col space-y-4"
				use:enhance
			>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Nove meno</span>
					</div>
					<input
						type="text"
						placeholder="Nove meno"
						class="input input-bordered w-full"
						required
						name="name"
						value={data.user.name}
					/>
				</label>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Nova avatar url</span>
					</div>
					<input
						type="text"
						placeholder="Nova avatar url"
						class="input input-bordered w-full"
						name="avatarUrl"
						value={data.user.avatarUrl}
					/>
				</label>
				<button class="btn btn-primary w-full">Zmenit</button>
			</form>
		</div>
	</div>
</div>
