<script lang="ts">
	let {
		loginForm,
		roomInput,
		isButtonDisabled
	}: { isButtonDisabled: boolean; loginForm: HTMLFormElement; roomInput: HTMLInputElement } =
		$props();
	let errorFetchRooms: string | null = $state(null);
	let rooms: { name: string }[] = $state([]);
	let isLoading = $state(false);
	async function fetchRooms() {
		isLoading = true;
		const roomsResponse = await fetch('/room/recent');
		if (roomsResponse.ok) {
			rooms = await roomsResponse.json();
		} else {
			errorFetchRooms = 'nenasli sa roomky';
		}
		isLoading = false;
	}
</script>

<button
	type="button"
	disabled={isButtonDisabled}
	onclick={fetchRooms}
	class="btn btn-secondary w-full">Zobrazit dostupne roomky</button
>
{#if errorFetchRooms !== null}
	<div class="alert alert-error">{errorFetchRooms}</div>
{/if}
{#if isLoading}
	<div class="my-2 flex flex-row items-center justify-between">
		<progress class="progress w-full"> </progress>
	</div>
{/if}

{#if rooms.length > 0}
	<ul class="flex flex-col gap-1">
		{#each rooms as room}
			<li class="flex flex-row items-center justify-between">
				<p>{room.name}</p>
				<button
					class="btn-primary btn"
					onclick={() => {
						roomInput.value = room.name;
						loginForm.checkValidity();
					}}>JOIN</button
				>
			</li>
		{/each}
	</ul>
{/if}
