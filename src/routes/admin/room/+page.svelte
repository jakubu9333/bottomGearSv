<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Bottom Gear | Create Room</title>
</svelte:head>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<h1 class="mb-6 text-center text-3xl font-bold">Vytvor novu roomku</h1>

		<form class="flex flex-col space-y-4" method="POST" use:enhance>
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">Meno roomky</span>
				</div>
				<input
					type="text"
					placeholder="Meno roomky"
					class="input input-bordered w-full"
					required
					name="room"
				/>
			</label>
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">Defaultne love</span>
				</div>
				<input
					type="text"
					placeholder="250"
					class="input input-bordered w-full"
					required
					name="defaultMoney"
					value="250"
				/>
			</label>

			<button type="submit" class="btn btn-primary w-full">Vytvor roomku</button>
		</form>
	</div>
</div>
