export type Duel = { id: number; firstName: string; secondName: string };
export type DuelParticipant = {
	name: string | undefined;
	winnerIndex: number;
	buttonClass: string;
};

export type User = {
	id: number;
	name: string;
	isAdmin: number;
	roomId: number;
	money: number;
	googleId: string | null
};

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

export enum MessageType {
	Event = 'event',
	Bet = 'bet',
	Join = 'join',
	MoneyRequest = 'money_request',
	MoneyUpdate = 'money_update',
}

export enum IsBettable {
	YES = 1,
	NO = 0,
	DUEL_ENDED = 2
}

export type SocketMessage =
	| { type: MessageType.Event; event: EventType }
	| { type: MessageType.Bet; money: number; winner: string }
	| { type: MessageType.Join; user: string }
	| { type: MessageType.MoneyRequest; user: string; amount: number; price: number, id: number }
	| { type: MessageType.MoneyUpdate; userId: number; money: number };
