<script lang="ts">
	import { AppState, EventType, type EventEvent, type BetingEvent } from '$lib/types';
	import { createPersistentStore } from '$lib/persistentStorage.svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import DuelScreen from '$lib/components/DuelScreen.svelte';
	import { getNextTransition } from '$lib/components/transition';
	import { fade } from 'svelte/transition';
	import { RealtimeDuel } from '$lib/components/realtimeDuel.svelte';

	let { data }: PageProps = $props();
	let roomState = $state(data.room.state);
	let money = $state(data.user.money);
	const betDataHolder = new RealtimeDuel();
	let userId = data.user.id;
	const savedRound = createPersistentStore('round', data.room.round);
	const isBetted = createPersistentStore<boolean>('isBetted', false);
	const moneyBeforeBet = createPersistentStore<number>('beforeWinMoney', data.user.money);
	let webSocket: WebSocket | undefined = $state(undefined);
	let index = $state(0);
	onMount(() => {
		if (roomState !== AppState.NoRound) {
			updateAppToState(roomState, data.room.round);
		}
		//const socketUrl = 'wss://bottomgear.uhlo.workers.dev';
		const socketUrl = 'ws://localhost:8787';
		webSocket = new WebSocket(`${socketUrl}/room/${data?.room?.id ?? '0'}/ws`);
		if (webSocket) {
			webSocket.addEventListener('open', (_) => {
				console.log('open');
			});
			webSocket.addEventListener('message', (ev: MessageEvent<string>) => {
				console.log(ev);
				const socketData: EventEvent | BetingEvent = JSON.parse(ev.data);
				if (socketData.type == 'event') {
					nextState(socketData.event);
				}
				if (socketData.type == 'bet') {
					betDataHolder?.addBet(socketData.money, socketData.winner);
				}
			});
		}
	});

	function resetBet() {
		isBetted.value = false;
		betDataHolder.resetBet();
	}

	//update
	function updateAppToState(state: AppState, round: number) {
		const canResetBet = savedRound.value !== round || state === AppState.RoundEnded;
		if (canResetBet) {
			resetBet();
		}
		const isBetDuelRound = state === AppState.DuelBetStart;
		if (isBetDuelRound && isBetted.value) {
			state = AppState.DuelBetPlaced;
			console.log(isBetted.value);
		}
		if (state === AppState.DuelBetStart) {
			moneyBeforeBet.value = money;
		}
		if (state === AppState.RoundEnded) {
			getWin();
		}
		savedRound.value = round;

		roomState = state;
	}

	async function getLeaderBoard(): Promise<{ money: number; id: number; name: string }[] | null> {
		const response = await fetch(`/room/${data.room.id}/leaderboard`);
		if (response.status !== 200) {
			return null;
		}
		const body: { name: string; money: number; id: number }[] = await response.json();
		return body;
	}

	let leaderBoard: { name: string; money: number; id: number }[] = $state([]);

	async function getWin() {
		const newLeaderBoard = await getLeaderBoard();
		if (newLeaderBoard === null) {
			return;
		}
		leaderBoard = newLeaderBoard;
		const me = newLeaderBoard.find((item) => item.id === data.user.id);
		money = me?.money ?? 0;
		if (!me) {
			return;
		}
		index = newLeaderBoard.indexOf(me) + 1;
	}

	async function makeBetStateDuel() {
		nextState(EventType.DuelBetPlaced);
		isBetted.value = true;
		console.log('isBetted', isBetted.value);
	}

	let derivedAppState = $derived(
		roomState === AppState.DuelBetPlaced ? AppState.DuelBetEnded : roomState
	);

	//update socket
	function nextState(eventType: EventType) {
		const state = getNextTransition(eventType, roomState);
		let round = savedRound.value;
		if (state === AppState.RoundEnded) {
			round++;
		}
		updateAppToState(state, round);
	}
	let moneyDiff = $derived(money - moneyBeforeBet.value);
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
					<div class="space-y-2 text-center">
						<h2 class="text-base-content text-xl font-bold">🚫 Žiadne kolo</h2>
						<p class="text-base-content/70 text-sm">Čakaj, kým Robo spustí hru</p>
					</div>
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
					<div class="space-y-2 text-center">
						{#if !isBetted.value}
							<h2 class="text-warning text-xl font-bold">⚠️ Nezaregistrovaná stávka</h2>
							<p class="text-base-content/70 text-sm">Počkaj na koniec kola</p>
						{:else}
							<h2 class="text-success text-xl font-bold">✅ Stávka zaregistrovaná</h2>
							<p class="text-base-content/70 text-sm">
								vsadil si {betDataHolder?.getBetItem().money} na
								<span class="font-semibold">{betDataHolder?.getBetItem().name}</span>
							</p>
							<p class="text-base-content/70 text-sm">
								Predpokladana vyhra je {betDataHolder?.getMyEstimatedPayout()}
							</p>
							<p class="text-base-content/70 text-sm">Počkaj na koniec kola</p>
						{/if}
					</div>
				{:else if roomState === AppState.RoundEnded}
					<div class="space-y-4 text-center">
						<h2 class="text-xl font-bold">🏁 Kolo skončilo</h2>

						{#if moneyDiff < 0}
							<p class="text-error font-semibold">❌ Prehral si {-moneyDiff}</p>
						{:else}
							<p class="text-success font-semibold">🎉 Vyhral si {moneyDiff}!</p>
						{/if}

						<p class="text-base-content/70 text-sm">
							Aktuálny stav: <span class="font-bold">{money}</span>
						</p>
						<p class="text-base-content/70 text-sm">
							Si na <span class="font-bold">{index}. </span> mieste
						</p>

						<div class="mt-4 text-left">
							<h3 class="mb-2 text-lg font-semibold">🏆 Rebríček</h3>
							<ol class="list-inside space-y-1">
								{#each leaderBoard as user, index}
									<li
										class="rounded-box bg-base-300 border-base-200 flex items-center justify-between border-b px-3 py-2"
									>
										<div><span class="px-1">{index + 1}.</span>{user.name}</div>
										<span class="font-semibold">{user.money}</span>
									</li>
								{/each}
							</ol>
						</div>
					</div>
				{/if}
			</div>
		{/key}
	</div>
</div>
