import { getEncounterStep, choicesForEncounterStep } from "./encounterFlow";
import { reduceGame } from "./reducer";
import type { ActiveMission, EnvironmentId, GameState, PlaySub, RuntimeEvent } from "./types";

/** Test helper: one-day mission preserving areaEntry from generated campaign. */
export function singleDayMission(
  mission: ActiveMission,
  events: RuntimeEvent[],
  environment: EnvironmentId = "clear",
): ActiveMission {
  const day = mission.days[0]!;
  return {
    ...mission,
    days: [{ ...day, environment, events }],
  };
}

function eventForSub(s: GameState, sub: PlaySub): RuntimeEvent | undefined {
  if (s.meta.t !== "play") return undefined;
  const m = s.missions[s.missionIndex];
  if (!m) return undefined;
  if (sub.t === "event") return m.days[sub.day]?.events[sub.eventIndex];
  if (sub.t === "foot") return s.footEvents?.[sub.index];
  if (sub.t === "briefing") return m.briefingEvent;
  return undefined;
}

/** Advance through narrative and stance when present. */
export function advanceToChoose(s: GameState): GameState {
  let state = s;
  for (let guard = 0; guard < 6; guard++) {
    if (state.meta.t !== "play") break;
    const step = getEncounterStep(state.meta.sub);
    if (step === "narrative") {
      state = reduceGame(state, { type: "EVENT_CONTINUE" });
      continue;
    }
    if (step === "stance") {
      state = reduceGame(state, { type: "CHOOSE_STANCE", stance: "push" });
      continue;
    }
    break;
  }
  return state;
}

/** Resolve a primary choice through react/follow-up or tactical turns until outcome (for tests). */
export function resolveChoiceToOutcome(s: GameState, choiceId: string): GameState {
  let state = advanceToChoose(s);
  for (let guard = 0; guard < 12; guard++) {
    if (state.meta.t !== "play") break;
    const sub = state.meta.sub;
    const step = getEncounterStep(sub);
    if (step === "outcome" || step === undefined) break;
    if (step === "react") {
      state = reduceGame(state, { type: "EVENT_CONTINUE" });
      continue;
    }
    if (step === "followup_choose") {
      const ev = eventForSub(state, sub);
      const primaryId = state.pendingEncounter?.primaryChoiceId;
      const primary = ev?.choices.find((c) => c.id === primaryId);
      const follow =
        primary?.followUpChoices?.find((c) => !c.returnToPrimary && !c.flavorOnly) ??
        primary?.followUpChoices?.find((c) => !c.returnToPrimary) ??
        primary?.followUpChoices?.[0];
      if (!follow) break;
      state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: follow.id });
      continue;
    }
    if (step === "choose") {
      const ev = eventForSub(state, sub);
      if (!ev) break;
      const choices = choicesForEncounterStep(state, ev);
      const pick =
        choices.find((c) => c.id === choiceId) ??
        choices.find((c) => !c.flavorOnly && !c.returnToPrimary) ??
        choices[0];
      if (!pick) break;
      state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: pick.id });
      continue;
    }
    break;
  }
  return state;
}
