<script lang="ts">
	import { createPersistentStore } from '../persistentStorage.svelte';
	import { fade } from 'svelte/transition';

	type Props = {
		//nochange
		userId: number;
		cars: Car[];
	};

	let { userId, cars }: Props = $props();

	type Car = {
		id: number;
		name: string;
	};
	enum Selection {
		NotSelected,
		ErrorSelection,
		CorectlySelected
	}

	const CAR_CHOOSING = false;
	let selectedMadeCarId = $state(0);
	const isSelected = createPersistentStore<Selection>('isSelected', Selection.NotSelected);
	async function selectCarToMaker() {
		/*   if (selectedMadeCarId === 0) {
      return;
    }
    const { data: result, error } = await actions.selectCarToMaker({
      userId,
      madeCarId: selectedMadeCarId,
    });
    if (result === undefined) {
      return;
    }
    if (result.isCorrect) {
      isSelected.value = Selection.CorectlySelected;
    } else {
      isSelected.value = Selection.ErrorSelection;
    }
  */
	}
</script>

<p class="font-bold">No round</p>
<p>Wait for robo to start</p>
{#if isSelected.value !== Selection.CorectlySelected && CAR_CHOOSING}
	<div transition:fade class="flex flex-col gap-2">
		<label for="made">Select car you made</label>
		<select id="made" class="select select-primary" bind:value={selectedMadeCarId}>
			{#each cars as carToMake}
				<option value={carToMake.id}>{carToMake.name}</option>
			{/each}
		</select>
		<button class="btn btn-primary" onclick={() => selectCarToMaker()}>Confirm</button>
		{#if isSelected.value === Selection.ErrorSelection}
			<p in:fade>Error during selection</p>
		{/if}
	</div>
{:else if CAR_CHOOSING}
	<p in:fade>Sucesfully selected</p>
{/if}
