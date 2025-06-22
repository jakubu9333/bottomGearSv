import { AppState } from "$lib";

export function getNextTransition(eventType: EventType, appState: AppState): AppState {
  if ((appState === AppState.NoRound || appState === AppState.RoundEnded) && eventType === EventType.DuelBetStart) {
    return AppState.DuelBetStart;
  }

  if (appState === AppState.DuelBetStart && eventType === EventType.DuelBetPlaced) {
    return AppState.DuelBetPlaced;
  }
  if ((appState === AppState.DuelBetPlaced || appState === AppState.DuelBetStart) && eventType === EventType.DuelBetEnd) {
    return AppState.DuelBetEnded;
  }

  if (appState === AppState.DuelBetEnded && eventType === EventType.RoundEnd) {
    return AppState.RoundEnded;
  }
  return appState
}


export enum EventType {
  DuelBetStart,
  DuelBetPlaced,
  DuelBetEnd,
  RoundEnd,
}
