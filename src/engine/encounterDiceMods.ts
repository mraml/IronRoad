import { difficultyDiceMod } from "./dice";
import { stanceDiceMod } from "./tacticalEncounter";
import { traumaDiceMods } from "./trauma";
import type {
  CrewMember,
  EncounterStance,
  EnvironmentId,
  GameState,
  Role,
  RuntimeEvent,
} from "./types";

function crewByRole(s: GameState, role: Role): CrewMember | undefined {
  return s.crew.find((c) => c.role === role);
}

function envDiceMod(env: EnvironmentId): number {
  switch (env) {
    case "thick_fog":
    case "blizzard":
      return -2;
    case "dust_storm":
    case "heavy_rain":
    case "ice":
    case "overcast":
      return -1;
    default:
      return 0;
  }
}

function opticsMod(s: GameState, role?: Role): number {
  if (role !== "gunner") return 0;
  const st = s.tank.components.optics;
  if (st === "damaged") return -1;
  if (st === "broken") return -2;
  return 0;
}

function constitutionMod(s: GameState, role?: Role): number {
  if (!role) return 0;
  const cm = crewByRole(s, role);
  if (!cm || cm.hp <= 0) return 0;
  if (cm.constitution < 20) return -2;
  if (cm.constitution < 35) return -1;
  return 0;
}

function ammoTypeMod(
  s: GameState,
  choice: { role?: Role; id: string },
  ev: RuntimeEvent,
): { label: string; value: number } | null {
  if (!ev.enemy?.idealAmmo) return null;
  const ideal = ev.enemy.idealAmmo;
  const hasAmmo = (() => {
    switch (ideal) {
      case "AP":
        return s.resources.ammoAP > 0;
      case "HE":
        return s.resources.ammoHE > 0;
      case "WP":
        return s.resources.ammoWP > 0;
      case "HEAT":
        return s.resources.ammoHEAT > 0;
    }
  })();
  const choiceSpends = ev.choices
    .find((c) => c.id === choice.id)
    ?.effects.some((e) => e.op === "spend_ammo" && e.ammo === ideal);
  if (choiceSpends && hasAmmo) return { label: `${ideal} match`, value: 2 };
  if (choiceSpends && !hasAmmo) return { label: `No ${ideal} available`, value: -2 };
  return null;
}

function enemyCombatMod(ev: RuntimeEvent): { label: string; value: number } | null {
  if (!ev.enemy?.combatMod) return null;
  return { label: ev.enemy.label ?? "Enemy", value: ev.enemy.combatMod };
}

function componentCascadeMods(s: GameState, role?: Role): { label: string; value: number }[] {
  const mods: { label: string; value: number }[] = [];
  const c = s.tank.components;
  if (c.engine === "broken" && role === "driver") mods.push({ label: "Engine out", value: -2 });
  if (c.engine === "damaged" && role === "driver")
    mods.push({ label: "Engine damaged", value: -1 });
  if ((c.track_left === "broken" || c.track_right === "broken") && role === "driver") {
    mods.push({ label: "Track broken", value: -3 });
  }
  if (c.main_gun === "broken" && role === "gunner") mods.push({ label: "Gun out", value: -3 });
  if (c.main_gun === "damaged" && role === "gunner") mods.push({ label: "Gun damaged", value: -1 });
  if (c.radio === "broken" && role === "commander") mods.push({ label: "Radio out", value: -1 });
  return mods;
}

function scarDiceMods(s: GameState, role?: Role): { label: string; value: number }[] {
  if (!role) return [];
  const cm = crewByRole(s, role);
  if (!cm || cm.hp <= 0) return [];
  const total = cm.scars.reduce((acc, sc) => acc + (sc.rolePenalty ?? 0), 0);
  if (total === 0) return [];
  return [{ label: "Old wounds", value: -total }];
}

function tankTypeDiceMods(
  s: GameState,
  ev: RuntimeEvent,
  role?: Role,
): { label: string; value: number }[] {
  const mods: { label: string; value: number }[] = [];
  if (s.tankType === "churchill" && ev.kind === "travel" && role === "driver") {
    mods.push({ label: "Slow hull", value: -1 });
  }
  if (s.tankType === "t34" && ev.kind === "tank_combat" && role === "gunner") {
    mods.push({ label: "Low silhouette", value: 1 });
  }
  return mods;
}

export function buildEncounterDiceMods(args: {
  state: GameState;
  ev: RuntimeEvent;
  choice: { role?: Role; id: string; modifierBonus?: number };
  stance?: EncounterStance;
  environment?: EnvironmentId;
}): { label: string; value: number }[] {
  const { state, ev, choice, stance, environment } = args;
  const diceRole = choice.role;
  const tacticsMod = choice.modifierBonus ?? 0;

  const mods: { label: string; value: number }[] = [
    { label: "Difficulty", value: difficultyDiceMod(state.difficulty) },
  ];
  if (tacticsMod !== 0) mods.push({ label: "Tactics", value: tacticsMod });
  if (stance) {
    const sm = stanceDiceMod(stance, ev);
    if (sm) mods.push(sm);
  }
  if (environment) mods.push({ label: "Environment", value: envDiceMod(environment) });
  mods.push({ label: "Crew nerve", value: constitutionMod(state, diceRole) });
  mods.push({ label: "Optics", value: opticsMod(state, diceRole) });
  mods.push(...traumaDiceMods(state, diceRole));
  mods.push(...scarDiceMods(state, diceRole));
  mods.push(...componentCascadeMods(state, diceRole));
  const ammoMod = ammoTypeMod(state, choice, ev);
  if (ammoMod) mods.push(ammoMod);
  if ((state.loaderAmmoDoctrineBonus ?? 0) > 0) {
    mods.push({ label: "Loader doctrine", value: 1 });
  }
  const enemyMod = enemyCombatMod(ev);
  if (enemyMod) mods.push(enemyMod);
  mods.push(...tankTypeDiceMods(state, ev, diceRole));
  return mods;
}
