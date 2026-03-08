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
	let index = $state(0);
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
		user.money = money;
		nextState(EventType.DuelBetPlaced);
	}

	let derivedAppState = $derived(
		roomState === AppState.DuelBetPlaced ? AppState.DuelBetEnded : roomState
	);

	let moneyDiff = $derived(money - moneyBeforeBet.value);
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
						<div class="flex flex-col items-center justify-center space-y-6 py-8 text-center">
							<div class="relative">
								<span class="loading loading-ring loading-lg text-primary size-24"></span>
							</div>
							<div class="space-y-2">
								<h2 class="text-base-content text-2xl font-bold">Žiadne aktívne kolo</h2>
								<p class="text-base-content/70 text-sm">Počkaj, kým administrátor spustí hru</p>
							</div>
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
						<div class="flex flex-col items-center space-y-6 text-center">
							{#if !betDataHolder.getIsBetted()}
								<div class="bg-warning/10 text-warning rounded-full p-4">
									<span class="text-4xl font-bold">!</span>
								</div>
								<div class="space-y-2">
									<h2 class="text-warning text-2xl font-bold">Stávka nebola odoslaná</h2>
									<p class="text-base-content/70 text-sm">Počkaj na vyhodnotenie kola</p>
								</div>
							{:else}
								<div class="bg-success/10 text-success rounded-full p-4 text-4xl">✓</div>
								<div class="space-y-2">
									<h2 class="text-success text-2xl font-bold">Stávka úspešne prijatá</h2>
									<div class="badge badge-outline badge-lg mt-2 h-auto py-4 whitespace-normal">
										Stavené {Math.round(betDataHolder?.getBetItem().money)} na
										<span class="ml-1 font-bold">{betDataHolder?.getBetItem().name}</span>
									</div>
								</div>

								<div class="stats bg-base-200 w-full shadow">
									<div class="stat place-items-center">
										<div class="stat-title text-xs uppercase opacity-70">Možná výhra</div>
										<div class="stat-value text-2xl">
											{Math.round(betDataHolder?.getMyEstimatedPayout())}
										</div>
									</div>
									<div class="stat border-base-300 place-items-center border-l">
										<div class="stat-title text-xs uppercase opacity-70">Čistý zisk</div>
										<div class="stat-value text-success text-2xl">
											{Math.round(
												betDataHolder?.getMyEstimatedPayout() - betDataHolder.getBetItem().money
											)}
										</div>
									</div>
								</div>

								<div class="divider"></div>
								<p class="text-base-content/60 flex items-center gap-2 text-sm italic">
									<span class="loading loading-dots loading-xs"></span>
									Prebieha vyhodnocovanie kola
								</p>
							{/if}
						</div>
					{:else if roomState === AppState.RoundEnded}
						<div class="space-y-6 text-center">
							<div class="flex flex-col items-center gap-2">
								<h2 class="text-2xl font-bold">Kolo bolo ukončené</h2>
							</div>

							<div class="stats bg-base-200 w-full shadow">
								<div class="stat place-items-center px-2">
									<div
										class="stat-value text-xl sm:text-2xl {moneyDiff < 0
											? 'text-error'
											: 'text-success'}"
									>
										{#if moneyDiff < 0}
											Strata: {Math.round(-moneyDiff)}
										{:else}
											Zisk: {Math.round(moneyDiff)}
										{/if}
									</div>
								</div>
							</div>

							<div class="border-base-200 my-4 flex items-center justify-around border-y py-4">
								<div class="text-center">
									<p class="text-base-content/70 text-sm">
										Tvoj zostatok: <span class="font-bold">{Math.round(money)} 🪙</span>
									</p>
								</div>
								<div class="divider divider-horizontal mx-0"></div>
								<div class="text-center">
									<p class="text-base-content/70 text-sm">
										Umiestnenie: <span class="font-bold">{index}. miesto</span>
									</p>
								</div>
							</div>

							<div class="mt-4 text-left">
								<div class="divider font-bold tracking-widest uppercase opacity-50">
									Celkové poradie
								</div>
								<div class="bg-base-200 max-h-64 overflow-y-auto rounded-xl shadow-inner">
									<table class="table-pin-rows table">
										<tbody>
											{#each leaderBoard as leaderUser, idx}
												<tr
													class={leaderUser.id === userId
														? 'bg-primary/20 font-bold'
														: idx % 2 === 0
															? 'bg-base-100/30'
															: ''}
												>
													<th class="w-12 text-center opacity-50">{idx + 1}.</th>
													<td>{leaderUser.name}</td>
													<td class="text-right font-mono font-bold"
														>{Math.round(leaderUser.money)}</td
													>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>
