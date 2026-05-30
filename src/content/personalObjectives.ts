/**
 * Solo hidden personal objectives (§16.3 adapted) — one secret goal per mission.
 */
import { drawIntInclusive } from "../engine/rng";
import type { CrewMember, GameState, Role } from "../engine/types";

export interface PersonalObjectiveDef {
  id: string;
  /** Shown only to the player at mission start. */
  secretText: string;
  /** Reveal line at mission end. */
  revealMet: string;
  revealFailed: string;
  salvageBonus: number;
}

export const PERSONAL_OBJECTIVES: PersonalObjectiveDef[] = [
  {
    id: "keep_role_alive",
    secretText: "Keep your assigned crew member alive this mission — no exceptions.",
    revealMet: "You kept your word. The hull held and so did they.",
    revealFailed: "You made a promise the road wouldn't keep.",
    salvageBonus: 2,
  },
  {
    id: "no_wp",
    secretText: "Reach the objective without firing white phosphorus.",
    revealMet: "No WP burned today. You can live with that.",
    revealFailed: "Smoke and screams. The objective got met another way.",
    salvageBonus: 2,
  },
  {
    id: "no_salvage_spend",
    secretText: "Don't spend salvage at the next debrief stop.",
    revealMet: "You held the purse strings. The crew grumbled and lived.",
    revealFailed: "Salvage went out the door. Needs beat pride sometimes.",
    salvageBonus: 3,
  },
  {
    id: "no_component_damage",
    secretText: "Finish the mission without taking tank component damage.",
    revealMet: "Every system green. A rare clean sheet.",
    revealFailed: "Something broke. Metal remembers.",
    salvageBonus: 3,
  },
  {
    id: "charm_this_mission",
    secretText: "Get a crew member a charm before mission end.",
    revealMet: "Someone found a token. Superstition earned its keep.",
    revealFailed: "No charms. Only luck, and luck was elsewhere.",
    salvageBonus: 1,
  },
  {
    id: "no_retreat_shots",
    secretText: "Don't fire on retreating enemy infantry this mission.",
    revealMet: "You let them run. The gunner swallowed it.",
    revealFailed: "Triggers pulled on backs. The war doesn't grade on mercy.",
    salvageBonus: 2,
  },
  {
    id: "full_crew_debrief",
    secretText: "End the mission with all five seats filled and breathing.",
    revealMet: "Five names on the roster. All of them walking.",
    revealFailed: "An empty hatch or a still body. The count wasn't five.",
    salvageBonus: 2,
  },
  {
    id: "conserve_medkits",
    secretText: "Don't use a medkit this mission.",
    revealMet: "The aid bag stayed closed. Pain was managed other ways.",
    revealFailed: "Bandages out. Sometimes that's the right call anyway.",
    salvageBonus: 2,
  },
];

const OBJECTIVE_BY_ID = new Map(PERSONAL_OBJECTIVES.map((o) => [o.id, o]));

export function getPersonalObjective(id: string): PersonalObjectiveDef | undefined {
  return OBJECTIVE_BY_ID.get(id);
}

export function drawPersonalObjective(
  seed: string,
  counter: number,
  crew: CrewMember[],
): { def: PersonalObjectiveDef; targetRole?: Role; nextCounter: number } {
  const idx = drawIntInclusive(seed, counter, 0, PERSONAL_OBJECTIVES.length - 1);
  const def = PERSONAL_OBJECTIVES[idx]!;
  let nextCounter = counter + 1;
  let targetRole: Role | undefined;
  if (def.id === "keep_role_alive") {
    const living = crew.filter((c) => c.hp > 0);
    if (living.length > 0) {
      const pick = living[drawIntInclusive(seed, nextCounter, 0, living.length - 1)]!;
      targetRole = pick.role;
      nextCounter++;
    }
  }
  return { def, targetRole, nextCounter };
}

export function evaluateHiddenObjective(state: GameState): boolean {
  const obj = state.hiddenObjective;
  if (!obj) return false;
  const def = getPersonalObjective(obj.id);
  if (!def) return false;
  const t = state.missionTrackers ?? {};

  switch (obj.id) {
    case "keep_role_alive": {
      const role = state.hiddenObjectiveTargetRole;
      if (!role) return false;
      const cm = state.crew.find((c) => c.role === role);
      return !!cm && cm.hp > 0;
    }
    case "no_wp":
      return !t.wpUsed;
    case "no_salvage_spend":
      return !t.salvageSpentThisDebrief;
    case "no_component_damage":
      return !t.componentDamaged;
    case "charm_this_mission":
      return !!t.charmGainedThisMission;
    case "no_retreat_shots":
      return !t.firedOnRetreat;
    case "full_crew_debrief":
      return state.crew.filter((c) => c.hp > 0).length >= 5;
    case "conserve_medkits":
      return !t.medkitUsed;
    default:
      return false;
  }
}

export function formatObjectiveSecret(state: GameState): string | null {
  const obj = state.hiddenObjective;
  if (!obj) return null;
  const def = getPersonalObjective(obj.id);
  if (!def) return null;
  if (obj.id === "keep_role_alive" && state.hiddenObjectiveTargetRole) {
    const cm = state.crew.find((c) => c.role === state.hiddenObjectiveTargetRole);
    return `Personal objective: keep ${cm?.nickname ?? "them"} alive this mission.`;
  }
  return `Personal objective: ${def.secretText}`;
}
