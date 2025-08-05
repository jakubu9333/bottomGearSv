export type Duel = { id: number; firstName: string; secondName: string };
export type DuelParticipant = {
	name: string | undefined;
	winnerIndex: number;
	buttonClass: string;
};
export type EventEvent = { type: 'event'; event: EventType };
export type BetingEvent = { type: 'bet'; money: number; winner: string };
export type JoinEvent = { type: 'join'; user: string; };

export enum EventType {
	DuelBetStart,
	DuelBetPlaced,
	DuelBetEnd,
	RoundEnd,
}

export enum AppState {
	NoRound,
	DuelBetStart,
	DuelBetPlaced,
	DuelBetEnded,
	RoundEnded,
}
