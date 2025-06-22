<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const user = data.user;
	const isAdmin = user?.isAdmin??false;
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		<div class="flex flex-col items-center gap-6 text-center">
			<h1 class="text-4xl font-bold">🚗 Bottom Gear</h1>

			<a href="/login" class="w-full max-w-xs">
				<button class="btn btn-primary w-full">Prihlásiť sa</button>
			</a>

			{#if isAdmin}
				<a href="/admin/room" class="w-full max-w-xs">
					<button class="btn btn-secondary w-full">Vytvoriť roomku</button>
				</a>
			{/if}
		</div>
	</div>
</div>
