import { stanceChoicesForTurn } from "../content/stanceOptions";
import { usesTacticalEncounter } from "./tacticalEncounter";
import type { EventChoice, EventKind, GameState, PlaySub, RuntimeEvent } from "./types";

export type EncounterStep =
  | "narrative"
  | "stance"
  | "choose"
  | "react"
  | "followup_choose"
  | "outcome";

export const TACTICAL_COMBAT_KINDS: readonly EventKind[] = [
  "tank_combat",
  "infantry_combat",
  "defensive_stand",
  "offensive_assault",
  "elite_encounter",
];

export const DEPTH_REQUIRED_KINDS: readonly EventKind[] = [
  "travel",
  "supply",
  "human_moment",
  "npc_conversation",
  ...TACTICAL_COMBAT_KINDS,
];

export function hasEncounterDepth(ev: RuntimeEvent): boolean {
  return ev.choices.some((c) => (c.followUpChoices?.length ?? 0) >= 2);
}

export function getEncounterStep(sub: PlaySub): EncounterStep | undefined {
  if (sub.t === "briefing" || sub.t === "foot" || sub.t === "tank_replacement") {
    return sub.step;
  }
  if (sub.t === "event") return sub.step;
  if (sub.t === "between_missions" && sub.socialStep) return sub.socialStep;
  return undefined;
}

export function primaryChoiceFromState(
  state: GameState,
  ev: RuntimeEvent,
): EventChoice | undefined {
  const id = state.pendingEncounter?.primaryChoiceId;
  if (!id) return undefined;
  return ev.choices.find((c) => c.id === id);
}

export function choicesForEncounterStep(state: GameState, ev: RuntimeEvent): EventChoice[] {
  const sub = state.meta.t === "play" ? state.meta.sub : undefined;
  if (!sub) return ev.choices;
  const step = getEncounterStep(sub);
  const pending = state.pendingEncounter;

  if (step === "choose" && pending?.stance && usesTacticalEncounter(ev)) {
    const { choices } = stanceChoicesForTurn({
      runSeed: state.runSeed,
      rngCounter: pending.optionCounter ?? state.rngCounter,
      event: ev,
      stance: pending.stance,
      turn: pending.turn ?? 1,
      footMode: state.footMode,
    });
    return choices;
  }

  if (step === "followup_choose") {
    const primary = primaryChoiceFromState(state, ev);
    return primary?.followUpChoices ?? [];
  }
  return ev.choices;
}

export function reactionDisplayText(primary: EventChoice): string {
  if (primary.reactionBeat?.trim()) return primary.reactionBeat.trim();
  if (primary.dialogueLine?.trim()) return primary.dialogueLine.trim();
  return "The crew commits. The situation answers back.";
}

export function shouldDeferForFollowUp(choice: EventChoice, ev?: RuntimeEvent): boolean {
  if (ev && usesTacticalEncounter(ev)) return false;
  if (!choice.followUpChoices?.length) return false;
  return choice.deferEffects !== false;
}

export function nextStepAfterNarrative(ev: RuntimeEvent): "stance" | "choose" {
  return usesTacticalEncounter(ev) ? "stance" : "choose";
}
