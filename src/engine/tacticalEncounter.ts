import { templateForChoice } from "../content/stanceOptions";
import type {
  EncounterStance,
  EventChoice,
  GameState,
  PendingEncounter,
  RuntimeEvent,
} from "./types";
import { DEPTH_REQUIRED_KINDS, TACTICAL_COMBAT_KINDS } from "./encounterFlow";

export function usesTacticalEncounter(ev: RuntimeEvent): boolean {
  if (ev.kind === "briefing" || ev.kind === "rest" || ev.kind === "debrief") return false;
  return DEPTH_REQUIRED_KINDS.includes(ev.kind);
}

export function initialThreat(ev: RuntimeEvent, footMode: boolean): number {
  if (footMode) return 55;
  if (ev.kind === "elite_encounter") return 75;
  if (TACTICAL_COMBAT_KINDS.includes(ev.kind)) return 65;
  if (ev.kind === "travel" || ev.kind === "supply") return 45;
  return 40;
}

export function maxTurnsForEvent(ev: RuntimeEvent, footMode: boolean): number {
  if (footMode) return 3;
  if (TACTICAL_COMBAT_KINDS.includes(ev.kind) || ev.kind === "elite_encounter") return 4;
  return 3;
}

export function threatShiftForTier(tier: 1 | 2 | 3 | 4): number {
  switch (tier) {
    case 4:
      return -20;
    case 3:
      return -12;
    case 2:
      return 8;
    case 1:
      return 18;
  }
}

export function threatBand(threat: number): "low" | "moderate" | "high" | "critical" {
  if (threat >= 85) return "critical";
  if (threat >= 60) return "high";
  if (threat >= 35) return "moderate";
  return "low";
}

export function threatBandLabel(band: ReturnType<typeof threatBand>): string {
  switch (band) {
    case "low":
      return "Pressure easing";
    case "moderate":
      return "Pressure building";
    case "high":
      return "High pressure";
    case "critical":
      return "Critical pressure";
  }
}

export function stanceDiceMod(
  stance: EncounterStance,
  ev: RuntimeEvent,
): { label: string; value: number } | null {
  switch (stance) {
    case "push":
      return { label: "Stance", value: 1 };
    case "hold":
      return { label: "Hold back", value: 1 };
    case "clever":
      if (
        ev.kind === "travel" ||
        ev.kind === "supply" ||
        ev.kind === "human_moment" ||
        ev.kind === "npc_conversation"
      ) {
        return { label: "Clever read", value: 1 };
      }
      return null;
  }
}

export function createPendingEncounter(
  stance: EncounterStance,
  ev: RuntimeEvent,
  footMode: boolean,
): PendingEncounter {
  return {
    stance,
    turn: 1,
    threat: initialThreat(ev, footMode),
  };
}

export function applyThreatDelta(pending: PendingEncounter, delta: number): PendingEncounter {
  const base = pending.threat ?? 50;
  const threat = Math.max(0, Math.min(100, base + delta));
  return { ...pending, threat };
}

export function isTacticalResolved(
  pending: PendingEncounter,
  ev: RuntimeEvent,
  footMode: boolean,
  terminal?: "withdraw" | "success",
): "success" | "failure" | "withdraw" | null {
  const threat = pending.threat ?? 50;
  const turn = pending.turn ?? 1;
  if (terminal === "withdraw") return "withdraw";
  if (terminal === "success") return "success";
  if (threat <= 0) return "success";
  if (threat >= 100) return "failure";
  if (turn > maxTurnsForEvent(ev, footMode)) return "success";
  return null;
}

export function reactionBeatForTurn(
  _ev: RuntimeEvent,
  _pending: PendingEncounter,
  tier: 1 | 2 | 3 | 4,
  resolved: ReturnType<typeof isTacticalResolved>,
): string {
  if (resolved === "withdraw") {
    return "You break contact. The fight moves on without you — for now.";
  }
  if (resolved === "failure") {
    return "The pressure crests. What you tried wasn't enough this time.";
  }
  if (resolved === "success") {
    return "The moment closes. The crew exhales through clenched teeth.";
  }
  if (tier >= 3) {
    return "Your move lands — but their fire shifts and the lane is not clear yet.";
  }
  if (tier === 2) {
    return "Partial win. The situation shifts without letting go.";
  }
  return "They answer back. The hatch air goes thin again.";
}

export function buildTacticalOutcomeText(
  ev: RuntimeEvent,
  pending: PendingEncounter,
  choice: EventChoice,
  resolved: NonNullable<ReturnType<typeof isTacticalResolved>>,
  tier: 1 | 2 | 3 | 4,
  footMode: boolean,
): string {
  const base = choice.outcomeText?.trim();
  if (base) return base;
  const turns = pending.turn ?? 1;
  switch (resolved) {
    case "withdraw":
      return `After ${turns} turn${turns === 1 ? "" : "s"}, you disengage. Pride stings less than a brew-up.`;
    case "failure":
      return `The ${ev.kind.replaceAll("_", " ")} beats you this round. Tier ${tier} — the crew pays.`;
    case "success":
      if (turns > maxTurnsForEvent(ev, footMode)) {
        return `You outlast it — ${turns} turns of grit and the pressure finally breaks.`;
      }
      return `Threat clears. ${turns} turn${turns === 1 ? "" : "s"} of work and the crew holds the line.`;
  }
}

export function terminalForChoice(
  state: GameState,
  ev: RuntimeEvent,
  choiceId: string,
): "withdraw" | "success" | undefined {
  const pending = state.pendingEncounter;
  if (!pending?.stance) return undefined;
  const template = templateForChoice(ev, pending.stance, choiceId, state.footMode);
  return template?.terminal;
}
