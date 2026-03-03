<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Bottom Gear</title>
</svelte:head>

{@render children()}
