<script lang="ts">
	import { AppState } from '$lib';
	import { createPersistentStore } from '$lib/persistentStorage.svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import DuelScreen from '$lib/components/DuelScreen.svelte';
	import { EventType, getNextTransition } from '$lib/components/transition';
	import { fade } from 'svelte/transition';

	let { data }: PageProps = $props();
	let roomState = $state(data.room.state);
	let money = $state(data.user.money);
	let round = $state(data.room.round);
	let userId = data.user.id;
	const isBetted = createPersistentStore<boolean>('isBetted', false);
	const MINIMUM_BROKIE = 25;
	let webSocket: WebSocket | undefined = $state(undefined);
	type EventEvent = { type: 'event'; event: EventType };
	onMount(() => {
		if (roomState !== AppState.NoRound) {
			updateAppToState(roomState, data.room.round);
		}
		webSocket = new WebSocket(`ws://localhost:8787/room/${data?.room?.id ?? '0'}/ws`);
		if (webSocket) {
			webSocket.addEventListener('open', (_) => {
				console.log('open');
			});
			webSocket.addEventListener('message', (ev: MessageEvent<string>) => {
				console.log(ev);
				const socketData: EventEvent = JSON.parse(ev.data);
				if (socketData.type == 'event') {
					nextState(socketData.event);
				}
			});
		}
	});

	const savedRound = createPersistentStore('round', data.room.round);

	const defaultBetItem = {
		name: '',
		money: 0
	};

	const betItemToShow: { value: { name: string; money: number } } = createPersistentStore(
		'betItem',
		defaultBetItem
	);

	function resetBet() {
		betItemToShow.value = defaultBetItem;
		isBetted.value = false;
	}

	function updateAppToState(state: number, round: number) {
		const canResetBet = savedRound.value !== round || state === AppState.RoundEnded;
		if (canResetBet) {
			resetBet();
		}
		const isBetDuelRound = state === AppState.DuelBetStart;
		if (isBetDuelRound && isBetted.value) {
			state = AppState.DuelBetPlaced;
		}
		savedRound.value = round;

		roomState = state;
		round = round;
	}

	let oldMoney = money;
	async function getMoney(): Promise<{ money: number } | null> {
		const response = await fetch('/me/money');
		if (response.status !== 200) {
			return null;
		}
		const body: { money: number } = await response.json();
		return body;
	}

	async function getWin(save: boolean) {
		const newMoney = await getMoney();
		if (newMoney === null) {
			return;
		}
		if (save) {
			oldMoney = money;
			money = newMoney.money;
		}
	}

	async function makeBetStateDuel() {
		nextState(EventType.DuelBetPlaced);
		isBetted.value = true;
	}

	let derivedAppState = $derived(
		roomState === AppState.DuelBetPlaced ? AppState.DuelBetEnded : roomState
	);

	async function nextState(eventType: EventType) {
		roomState = getNextTransition(eventType, roomState);

		if (roomState === AppState.DuelBetStart && money < MINIMUM_BROKIE) {
			getWin(false);
		}
		if (roomState === AppState.RoundEnded) {
			getWin(true);
			round++;
			savedRound.value = round;
			resetBet();
		}
	}
	let moneyDiff = $derived(money - oldMoney);
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center px-4">
	<div class="rounded-box bg-base-100 w-full max-w-md p-8 shadow-2xl">
		{#key derivedAppState}
			<div
				out:fade={{
					duration: 400
				}}
				in:fade={{
					delay: 400
				}}
			>
				{#if roomState === AppState.NoRound}
					<p class="font-bold">No round</p>
					<p>Wait for robo to start</p>
				{:else if roomState === AppState.DuelBetStart}
					<DuelScreen
						{userId}
						bind:money
						makeBetState={makeBetStateDuel}
						bind:betItemToShow={betItemToShow.value}
					/>
				{:else if roomState === AppState.DuelBetEnded}
					{#if isBetted}
						<h1 class="font-bold">No betting registered</h1>
					{:else}
						<h1 class="font-bold">Already betted {betItemToShow.value.money}</h1>
						<div>for</div>
						<p>{betItemToShow.value.name}</p>
					{/if}
					<p>Wait for round to end</p>
				{:else if roomState === AppState.RoundEnded}
					<p class="font-bold">Round Ended</p>
					{#if moneyDiff < 0}
						<p>You lost {-moneyDiff}</p>
					{:else}
						<p>Congratulation you get {moneyDiff}</p>
					{/if}
					<p>Now you have {money}</p>
				{/if}
			</div>
		{/key}
	</div>
</div>
