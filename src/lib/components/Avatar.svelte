<script lang="ts">
	let {
		user,
		isOnline = false
	}: { user: { name: string; avatarUrl: string | null }; isOnline: boolean } = $props();
</script>

{#if user.avatarUrl === null}
	<div class={`avatar avatar-placeholder ${isOnline ? 'avatar-online' : ''}`}>
		<div class="bg-neutral text-neutral-content w-8 rounded-full">
			<span class="text-xs">{user.name.at(0) ?? ''}</span>
		</div>
	</div>
{:else}
	<div class={`avatar ${isOnline ? 'avatar-online' : ''}`}>
		<div class="w-8 rounded-full">
			<img src={user.avatarUrl} />
		</div>
	</div>
{/if}
