/**
 * Trauma state behavior (spec §3A) — Wave 19 completeness.
 */
import { drawIntInclusive } from "./rng";
import type {
  CrewMember,
  GameState,
  Role,
  RuntimeEvent,
  TraumaStateId,
} from "./types";
import type { EventChoice } from "./types";

const JUDGMENT_ROLES: Role[] = ["commander", "driver"];

export function crewByRole(s: GameState, role: Role): CrewMember | undefined {
  return s.crew.find((c) => c.role === role);
}

/** Extra dice modifiers beyond shellshocked/shaking/rage/breaking baseline. */
export function traumaDiceMods(
  s: GameState,
  role?: Role,
): { label: string; value: number }[] {
  if (!role) return [];
  const cm = crewByRole(s, role);
  if (!cm || cm.hp <= 0) return [];
  const mods: { label: string; value: number }[] = [];
  if (cm.traumaStates.includes("shellshocked")) mods.push({ label: "Shellshocked", value: -2 });
  if (cm.traumaStates.includes("shaking") && (role === "loader" || role === "gunner")) {
    mods.push({ label: "Shaking", value: -1 });
  }
  if (cm.traumaStates.includes("rage") && (role === "gunner" || role === "asst_driver")) {
    mods.push({ label: "Rage", value: 1 });
  }
  if (cm.traumaStates.includes("rage") && JUDGMENT_ROLES.includes(role)) {
    mods.push({ label: "Rage", value: -2 });
  }
  if (cm.traumaStates.includes("breaking")) {
    mods.push({ label: "Breaking", value: -1 });
  }
  return mods;
}

export function crewIsFrozen(s: GameState, role?: Role): boolean {
  if (!role) return false;
  const cm = crewByRole(s, role);
  if (!cm || cm.hp <= 0) return false;
  return cm.traumaStates.includes("frozen");
}

/** Frozen or Breaking (50%) forces worst available choice. */
export function resolveTraumaForcedChoice(
  state: GameState,
  ev: RuntimeEvent,
  primary: EventChoice,
  subKind: string,
): { primary: EventChoice; prefix: string; state: GameState } {
  if (subKind !== "event" && subKind !== "foot") {
    return { primary, prefix: "", state };
  }
  const actingRole = primary.role;
  if (!actingRole) return { primary, prefix: "", state };

  let s = state;
  let prefix = "";

  if (s.jumpyPendingRole === actingRole) {
    const worst = [...ev.choices].sort(
      (a, b) => (a.modifierBonus ?? 0) - (b.modifierBonus ?? 0),
    )[0]!;
    const nick = crewByRole(s, actingRole)?.nickname ?? actingRole;
    prefix = `${nick} flinches — muscle memory, not orders.\n\n`;
    primary = worst;
    s = { ...s, jumpyPendingRole: undefined };
  }

  if (crewIsFrozen(s, actingRole)) {
    const worst = [...ev.choices].sort(
      (a, b) => (a.modifierBonus ?? 0) - (b.modifierBonus ?? 0),
    )[0]!;
    prefix = `${crewByRole(s, actingRole)?.nickname ?? actingRole} is frozen. The decision makes itself.\n\n`;
    return { primary: worst, prefix, state: s };
  }

  const cm = crewByRole(s, actingRole);
  if (cm?.traumaStates.includes("breaking")) {
    const roll = drawIntInclusive(s.runSeed, s.rngCounter, 1, 10);
    s = { ...s, rngCounter: s.rngCounter + 1 };
    if (roll <= 5) {
      const worst = [...ev.choices].sort(
        (a, b) => (a.modifierBonus ?? 0) - (b.modifierBonus ?? 0),
      )[0]!;
      prefix = `${cm.nickname} can't hold the line — hands move before the head agrees.\n\n`;
      primary = worst;
    }
  }

  return { primary, prefix, state: s };
}

export function canProvideSupport(supporter: CrewMember): boolean {
  return !supporter.traumaStates.includes("checked_out");
}

/** Numb blocks passive constitution recovery (positive deltas). */
export function constitutionGainBlocked(cm: CrewMember, delta: number): boolean {
  return delta > 0 && cm.traumaStates.includes("numb");
}

export function onTraumaAdded(
  state: GameState,
  role: Role,
  trauma: TraumaStateId,
): GameState {
  let s = state;
  if (trauma === "jumpy") {
    s = { ...s, jumpyPendingRole: role };
  }
  if (trauma === "thousand_yard_stare") {
    s = {
      ...s,
      quoteSilenceByRole: { ...s.quoteSilenceByRole, [role]: 2 },
    };
  }
  return s;
}

export function tickQuoteSilenceAfterEvent(state: GameState): GameState {
  const next: Partial<Record<Role, number>> = { ...state.quoteSilenceByRole };
  for (const role of Object.keys(next) as Role[]) {
    const n = next[role];
    if (n === undefined) continue;
    if (n <= 1) delete next[role];
    else next[role] = n - 1;
  }
  return { ...state, quoteSilenceByRole: next };
}

export function shouldSuppressOutcomeQuote(
  state: GameState,
  speaker: CrewMember | undefined,
): boolean {
  if (!speaker) return false;
  return (state.quoteSilenceByRole[speaker.role] ?? 0) > 0;
}
