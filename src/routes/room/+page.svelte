<script lang="ts">
	import { AppState, EventType, type SocketMessage } from '$lib/types';
	import { createPersistentStore } from '$lib/persistentStorage.svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import DuelScreen from '$lib/components/DuelScreen.svelte';
	import { getSocketAdress } from '$lib/socketClient';
	import { getNextTransition } from '$lib/components/transition';
	import { fade } from 'svelte/transition';
	import { RealtimeDuel } from '$lib/components/realtimeDuel.svelte';
	import Header from '$lib/components/Header.svelte';
	import NoRoundScreen from '$lib/components/NoRoundScreen.svelte';
	import DuelBetEndedScreen from '$lib/components/DuelBetEndedScreen.svelte';
	import RoundEndedScreen from '$lib/components/RoundEndedScreen.svelte';

	let { data }: PageProps = $props();
	let roomState = $state(data.room.state);
	let money = $state(data.user.money);
	const betDataHolder = new RealtimeDuel();
	let userId = data.user.id;
	let user = $state(data.user);
	let moneyRequests = $state(data.moneyRequests || []);
	const savedRound = createPersistentStore('round', data.room.round);
	const moneyBeforeBet = createPersistentStore<number>('beforeWinMoney', data.user.money);
	let webSocket: WebSocket | undefined = $state(undefined);
	let updateLeaderboard: (newMoney: number) => void = () => {};

	onMount(() => {
		if (roomState !== AppState.NoRound) {
			updateAppToState(roomState, data.room.round);
		}
		const socketUrl = getSocketAdress();

		webSocket = new WebSocket(`${socketUrl}/room/${data?.room?.id ?? '0'}/ws`);
		if (webSocket) {
			webSocket.addEventListener('open', (_) => {
				console.log('open');
			});
			webSocket.addEventListener('message', (ev: MessageEvent<string>) => {
				const socketData: SocketMessage = JSON.parse(ev.data);
				if (socketData.type == 'event') {
					nextState(socketData.event);
				}
				if (socketData.type == 'bet') {
					betDataHolder?.addBet(socketData.money, socketData.winner);
				}
				if (socketData.type === 'money_request' && user.isAdmin == true) {
					moneyRequests.push({
						id: socketData.id,
						amount: socketData.amount,
						price: socketData.price,
						status: 'pending',
						user: {
							id: 0, // We don't have the user id here
							name: socketData.user
						}
					});
				} else if (socketData.type === 'money_update') {
					if (socketData.userId === user.id) {
						fetch('/me').then(async (res) => {
							if (res.ok) {
								user = await res.json();
								money = user.money;
								updateLeaderboard(money);
							}
						});
					}
				}
			});
		}

		return () => {
			webSocket?.close();
		};
	});

	function resetBet() {
		betDataHolder.resetBet();
	}

	function nextState(eventType: EventType) {
		const state = getNextTransition(eventType, roomState);
		let round = savedRound.value;
		if (state === AppState.RoundEnded) {
			round++;
		}
		updateAppToState(state, round);
	}

	function updateAppToState(state: AppState, round: number) {
		const canResetBet = savedRound.value !== round || state === AppState.RoundEnded;
		if (canResetBet) {
			resetBet();
		}
		const isBetDuelRound = state === AppState.DuelBetStart;
		if (isBetDuelRound && betDataHolder.getIsBetted()) {
			state = AppState.DuelBetPlaced;
		}
		if (state === AppState.DuelBetStart) {
			moneyBeforeBet.value = money;
		}
		savedRound.value = round;

		roomState = state;
	}

	async function makeBetStateDuel() {
		user.money = money;
		nextState(EventType.DuelBetPlaced);
	}

	let derivedAppState = $derived(
		roomState === AppState.DuelBetPlaced ? AppState.DuelBetEnded : roomState
	);
</script>

<svelte:head>
	<title>Bottom Gear | Room</title>
</svelte:head>

<Header bind:user bind:moneyRequests appState={roomState} areMoneyRequestsVisible={true} />
<div class="bg-base-200 flex min-h-screen items-center justify-center px-4 py-12">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body p-8">
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
						<NoRoundScreen />
					{:else if roomState === AppState.DuelBetStart}
						<DuelScreen
							{userId}
							setDuel={betDataHolder.setDuel}
							roomId={+data.room.id}
							bind:money
							getEstimatedPayoutIndex={betDataHolder.getEstimatedPayoutIndex}
							makeBetState={makeBetStateDuel}
							setBetItem={betDataHolder.addMybet}
						/>
					{:else if derivedAppState === AppState.DuelBetEnded}
						<DuelBetEndedScreen {betDataHolder} {user} bind:roomState />
					{:else if roomState === AppState.RoundEnded}
						<RoundEndedScreen
							bind:money
							moneyBeforeBet={moneyBeforeBet.value}
							{userId}
							roomId={+data.room.id}
							onLeaderBoardUpdate={(fn) => (updateLeaderboard = fn)}
						/>
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>
