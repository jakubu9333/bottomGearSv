<script lang="ts">
	import { onMount } from 'svelte';
	import Avatar from './Avatar.svelte';

	let {
		money = $bindable(),
		moneyBeforeBet,
		userId,
		roomId,
		onLeaderBoardUpdate
	}: {
		money: number;
		moneyBeforeBet: number;
		userId: number;
		roomId: number;
		onLeaderBoardUpdate: (fn: (newMoney: number) => void) => void;
	} = $props();

	let leaderBoard: { name: string; money: number; id: number; avatarUrl: string | null }[] = $state(
		[]
	);
	let moneyDiff = $derived(money - moneyBeforeBet);
	let meInLeaderBoard = $derived(leaderBoard.find((item) => item.id === userId));
	let place = $derived(meInLeaderBoard ? leaderBoard.indexOf(meInLeaderBoard) + 1 : 0);

	async function getLeaderBoard(): Promise<{ money: number; id: number; name: string }[] | null> {
		const response = await fetch(`/room/${roomId}/leaderboard`);
		if (response.status !== 200) {
			return null;
		}
		const body: { name: string; money: number; id: number; avatarUrl: string | null }[] =
			await response.json();
		return body;
	}

	async function fetchAndSetLeaderBoard() {
		const newLeaderBoard = await getLeaderBoard();
		if (newLeaderBoard) {
			leaderBoard = newLeaderBoard;
			const me = leaderBoard.find((item) => item.id === userId);
			if (me) {
				money = me.money;
			}
		}
	}

	onMount(() => {
		fetchAndSetLeaderBoard();
		onLeaderBoardUpdate((newMoney: number) => {
			if (meInLeaderBoard) {
				meInLeaderBoard.money = newMoney;
				leaderBoard = leaderBoard.sort((a, b) => b.money - a.money);
			}
		});
	});
</script>

<div class="space-y-6 text-center">
	<div class="flex flex-col items-center gap-2">
		<h2 class="text-2xl font-bold">Kolo bolo ukončené</h2>
	</div>

	<div class="stats bg-base-200 w-full shadow">
		<div class="stat place-items-center px-2">
			<div class="stat-value text-xl sm:text-2xl {moneyDiff < 0 ? 'text-error' : 'text-success'}">
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
				Umiestnenie: <span class="font-bold">{place}. miesto</span>
			</p>
		</div>
	</div>

	<div class="mt-4 text-left">
		<div class="divider font-bold tracking-widest uppercase opacity-50">Celkové poradie</div>
		<div class="bg-base-200 max-h-64 overflow-y-auto rounded-xl shadow-inner">
			<table class="table-pin-rows table">
				<tbody>
					{#each leaderBoard as user, idx}
						<tr
							class={user.id === userId
								? 'bg-primary/20 font-bold'
								: idx % 2 === 0
									? 'bg-base-100/30'
									: ''}
						>
							<th class="w-12 text-center opacity-50">{idx + 1}.</th>
							<td>
								<Avatar {user} />
							</td>
							<td class="overflow-ellipsis">{user.name}</td>
							<td class="text-right font-mono font-bold">{Math.round(user.money)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
