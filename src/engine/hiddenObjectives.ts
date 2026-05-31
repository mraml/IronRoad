import {
  drawPersonalObjective,
  evaluateHiddenObjective,
  getPersonalObjective,
} from "../content/personalObjectives";
import type { FieldJournalEntry, GameState } from "./types";

export function startMissionHiddenObjective(state: GameState): GameState {
  const { def, targetRole, nextCounter } = drawPersonalObjective(
    state.runSeed,
    state.rngCounter,
    state.crew,
  );
  return {
    ...state,
    rngCounter: nextCounter,
    hiddenObjective: { id: def.id, met: false },
    hiddenObjectiveTargetRole: targetRole,
    missionTrackers: {},
  };
}

export function resolveMissionHiddenObjective(state: GameState): GameState {
  const obj = state.hiddenObjective;
  if (!obj) return state;
  const def = getPersonalObjective(obj.id);
  if (!def) return state;

  const met = evaluateHiddenObjective(state);

  const reveal = met ? def.revealMet : def.revealFailed;
  const log = [...state.narrativeLog, `Personal objective (${met ? "met" : "unmet"}): ${reveal}`];
  const journalEntry: FieldJournalEntry = {
    id: `obj_${state.runSeed}_${state.missionIndex}_${obj.id}`,
    at: Date.now(),
    text: met ? `Objective met — ${def.secretText}` : `Objective unmet — ${def.secretText}`,
    kind: "moment",
  };

  let next: GameState = {
    ...state,
    narrativeLog: log,
    fieldJournal: [...state.fieldJournal, journalEntry],
    hiddenObjective: { ...obj, met },
    salvagePoints: met ? state.salvagePoints + def.salvageBonus : state.salvagePoints,
  };

  if (met) {
    next = {
      ...next,
      narrativeLog: [...next.narrativeLog, `+${def.salvageBonus} salvage — objective met.`],
    };
  }

  return next;
}

export function trackMissionEffect(state: GameState, eff: import("./types").Effect): GameState {
  const t = { ...state.missionTrackers };
  if (eff.op === "spend_ammo" && eff.ammo === "WP") t.wpUsed = true;
  if (eff.op === "damage_random_component" || eff.op === "set_component") {
    if (eff.op === "set_component" && eff.status !== "ok") t.componentDamaged = true;
    if (eff.op === "damage_random_component") t.componentDamaged = true;
  }
  if (eff.op === "grant_charm") t.charmGainedThisMission = true;
  return { ...state, missionTrackers: t };
}
