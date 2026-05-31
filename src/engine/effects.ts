import { campaignEpilogueSub } from "../content/campaignEpilogues";
import {
  appendDiscoveryJournal,
  CHARM_ARCHETYPE_DISCOVERIES,
  getDiscoveryText,
} from "../content/discoveries";
import { formatRank, resolveVoiceLeader } from "../content/ranks";
import { CHARM_CATALOG } from "../content/charms";
import { TANK_TYPE_PROFILES } from "./config";
import { drawIntInclusive } from "./rng";
import { onTraumaAdded } from "./trauma";
import { SCAR_NAME_POOLS } from "../content/pools";
import type { CrewMember, Effect, FieldJournalEntry, GameState, Resources, Role } from "./types";

/** Draw a scar name from the category pool, seeded for determinism. */
export function drawScarName(
  seed: string,
  counter: number,
  category: keyof typeof SCAR_NAME_POOLS,
): { name: string; nextCounter: number } {
  const pool = SCAR_NAME_POOLS[category];
  const idx = drawIntInclusive(seed, counter, 0, pool.length - 1);
  return { name: pool[idx]!, nextCounter: counter + 1 };
}

export interface ApplyResult {
  state: GameState;
  rngCounter: number;
  logLines: string[];
}

function crewByRole(crew: CrewMember[], role: Role): CrewMember | undefined {
  return crew.find((c) => c.role === role);
}

function livingCrew(crew: CrewMember[]): CrewMember[] {
  return crew.filter((c) => c.hp > 0);
}

/** The Kid swings fast in both directions (spec §3.3). */
function constitutionScale(archetypeId: string): number {
  return archetypeId === "kid" ? 1.5 : 1;
}

export function applyEffects(
  state: GameState,
  startCounter: number,
  effects: Effect[],
): ApplyResult {
  let s = state;
  let c = startCounter;
  const logLines: string[] = [];

  for (const eff of effects) {
    const r = applyOne(s, c, eff);
    s = r.state;
    c = r.rngCounter;
    logLines.push(...r.logLines);
  }

  return { state: s, rngCounter: c, logLines };
}

function applyOne(state: GameState, counter: number, eff: Effect): ApplyResult {
  const logLines: string[] = [];
  let c = counter;

  switch (eff.op) {
    case "mod_hp": {
      const cm = crewByRole(state.crew, eff.role);
      if (!cm || cm.hp <= 0) return { state, rngCounter: c, logLines };
      const nextHp = Math.max(0, Math.min(100, cm.hp + eff.delta));
      const crew = state.crew.map((x) => (x.id === cm.id ? { ...x, hp: nextHp } : x));
      let next: GameState = { ...state, crew };
      if (nextHp <= 0) {
        next = handleDeath(next, cm.role, c);
        c = next.rngCounter;
        logLines.push(`${cm.nickname} is gone.`);
      } else if (eff.delta < 0) {
        logLines.push(`${cm.nickname} takes ${-eff.delta} HP damage.`);
      } else {
        logLines.push(`${cm.nickname} recovers ${eff.delta} HP.`);
      }
      return { state: next, rngCounter: c, logLines };
    }
    case "mod_constitution": {
      const cm = crewByRole(state.crew, eff.role);
      if (!cm || cm.hp <= 0) return { state, rngCounter: c, logLines };
      if (eff.delta > 0 && cm.traumaStates.includes("numb")) {
        logLines.push(`${cm.nickname} is numb — constitution doesn't budge.`);
        return { state, rngCounter: c, logLines };
      }
      const scaled = Math.round(eff.delta * constitutionScale(cm.archetypeId));
      const v = Math.max(0, Math.min(100, cm.constitution + scaled));
      const crew = state.crew.map((x) => (x.id === cm.id ? { ...x, constitution: v } : x));
      logLines.push(`${cm.nickname}'s constitution → ${v}.`);
      return { state: { ...state, crew }, rngCounter: c, logLines };
    }
    case "mod_all_constitution": {
      // Apply per-archetype scaling so The Kid swings harder in both directions.
      const crew = state.crew.map((x) => {
        if (x.hp <= 0) return x;
        if (eff.delta > 0 && x.traumaStates.includes("numb")) return x;
        const scaled = Math.round(eff.delta * constitutionScale(x.archetypeId));
        return {
          ...x,
          constitution: Math.max(0, Math.min(100, x.constitution + scaled)),
        };
      });
      logLines.push(`Whole crew constitution ${eff.delta >= 0 ? "+" : ""}${eff.delta}.`);
      return { state: { ...state, crew }, rngCounter: c, logLines };
    }
    case "add_trauma": {
      const cm = crewByRole(state.crew, eff.role);
      if (!cm || cm.hp <= 0) return { state, rngCounter: c, logLines };
      if (cm.traumaStates.includes(eff.trauma)) return { state, rngCounter: c, logLines };
      const crew = state.crew.map((x) =>
        x.id === cm.id ? { ...x, traumaStates: [...x.traumaStates, eff.trauma] } : x,
      );
      logLines.push(`${cm.nickname} is ${eff.trauma.replaceAll("_", " ")}.`);
      let next: GameState = {
        ...state,
        crew,
        everBreakingTrauma: eff.trauma === "breaking" ? true : state.everBreakingTrauma,
      };

      // grief_struck: automatic constitution penalty. Dark Comedian takes double (spec §3A.3).
      if (eff.trauma === "grief_struck") {
        const basePenalty = -20;
        const penalty = cm.archetypeId === "dark_comedian" ? basePenalty * 2 : basePenalty;
        const updated = crewByRole(next.crew, eff.role);
        if (updated) {
          const newCon = Math.max(0, Math.min(100, updated.constitution + penalty));
          next = {
            ...next,
            crew: next.crew.map((x) => (x.id === cm.id ? { ...x, constitution: newCon } : x)),
          };
          logLines.push(`${cm.nickname} constitution ${penalty} from grief.`);
        }
      }

      next = onTraumaAdded(next, eff.role, eff.trauma);
      return { state: next, rngCounter: c, logLines };
    }
    case "clear_trauma": {
      const cm = crewByRole(state.crew, eff.role);
      if (!cm) return { state, rngCounter: c, logLines };
      const crew = state.crew.map((x) =>
        x.id === cm.id
          ? {
              ...x,
              traumaStates: x.traumaStates.filter((t) => t !== eff.trauma),
            }
          : x,
      );
      logLines.push(`${cm.nickname} shakes off ${eff.trauma}.`);
      return { state: { ...state, crew }, rngCounter: c, logLines };
    }
    case "mod_tank_health": {
      let delta = eff.delta;
      let mitigation = state.armorMitigationPoints ?? 0;
      if (delta < 0 && mitigation > 0) {
        const incoming = -delta;
        const absorbed = Math.min(incoming, mitigation);
        delta = -(incoming - absorbed);
        mitigation -= absorbed;
        if (absorbed > 0) {
          logLines.push(`Armor patch absorbs ${absorbed}% of the hit.`);
        }
      }
      const healthPct = Math.max(0, Math.min(100, state.tank.healthPct + delta));
      logLines.push(`Tank hull ${delta >= 0 ? "+" : ""}${delta}% .`);
      let next: GameState = {
        ...state,
        tank: { ...state.tank, healthPct },
        armorMitigationPoints: mitigation > 0 ? mitigation : undefined,
      };
      if (healthPct <= 0) {
        next = { ...next, footMode: true };
        logLines.push("The tank is done. You're on foot.");
        const id = `fj_${c}_tanklost`;
        next = {
          ...next,
          fieldJournal: [
            ...next.fieldJournal,
            {
              id,
              at: Date.now(),
              text: `Tank ${next.tank.name} lost.`,
              kind: "tank",
            },
          ],
        };
      }
      return { state: next, rngCounter: c, logLines };
    }
    case "set_component": {
      const components = { ...state.tank.components, [eff.component]: eff.status };
      logLines.push(`${eff.component.replaceAll("_", " ")}: ${eff.status}.`);
      return { state: { ...state, tank: { ...state.tank, components } }, rngCounter: c, logLines };
    }
    case "damage_random_component": {
      // Pick a non-broken component and damage or break it
      const all = Object.keys(state.tank.components) as (keyof typeof state.tank.components)[];
      const candidates = all.filter((k) => state.tank.components[k] !== "broken");
      if (candidates.length === 0) {
        logLines.push("All components already broken.");
        return { state, rngCounter: c, logLines };
      }
      const idx = drawIntInclusive(state.runSeed, c++, 0, candidates.length - 1);
      const target = candidates[idx]!;
      const current = state.tank.components[target];
      const next: "ok" | "damaged" | "broken" = current === "ok" ? "damaged" : "broken";
      const bonus = TANK_TYPE_PROFILES[state.tankType].componentBonus;
      if (bonus > 0 && next !== current) {
        const mitRoll = drawIntInclusive(state.runSeed, c++, 0, 2);
        if (mitRoll === 0) {
          logLines.push(
            `Hit absorbed — ${target.replaceAll("_", " ")} holds (${TANK_TYPE_PROFILES[state.tankType].label}).`,
          );
          return { state, rngCounter: c, logLines };
        }
      }
      logLines.push(`Hit! ${target.replaceAll("_", " ")} → ${next}.`);
      return {
        state: {
          ...state,
          tank: { ...state.tank, components: { ...state.tank.components, [target]: next } },
        },
        rngCounter: c,
        logLines,
      };
    }
    case "spend_ammo": {
      const key = ammoKey(eff.ammo);
      const resources = {
        ...state.resources,
        [key]: Math.max(0, resourcesGet(state.resources, key) - eff.amount),
      } as Resources;
      logLines.push(`Spend ${eff.amount} ${eff.ammo}.`);
      return { state: { ...state, resources }, rngCounter: c, logLines };
    }
    case "mod_resource": {
      const resources = { ...state.resources };
      resources[eff.key] = Math.max(0, resources[eff.key] + eff.delta);
      logLines.push(`${eff.key} ${eff.delta >= 0 ? "+" : ""}${eff.delta}.`);
      return { state: { ...state, resources }, rngCounter: c, logLines };
    }
    case "add_salvage": {
      const salvagePoints = state.salvagePoints + eff.amount;
      logLines.push(`+${eff.amount} salvage.`);
      return { state: { ...state, salvagePoints }, rngCounter: c, logLines };
    }
    case "spend_salvage": {
      const salvagePoints = Math.max(0, state.salvagePoints - eff.amount);
      logLines.push(`-${eff.amount} salvage.`);
      return { state: { ...state, salvagePoints }, rngCounter: c, logLines };
    }
    case "seed_flag": {
      if (state.seededFlags.includes(eff.flag)) return { state, rngCounter: c, logLines };
      logLines.push(`(Seeded) ${eff.flag}`);
      return {
        state: { ...state, seededFlags: [...state.seededFlags, eff.flag] },
        rngCounter: c,
        logLines,
      };
    }
    case "grant_charm": {
      const cm = crewByRole(state.crew, eff.role);
      if (!cm || cm.hp <= 0) return { state, rngCounter: c, logLines };
      const crew = state.crew.map((x) => (x.id === cm.id ? { ...x, charmId: eff.charmId } : x));
      logLines.push(`${cm.nickname} keeps a charm: ${eff.charmId}.`);
      let journal: FieldJournalEntry[] = [...state.fieldJournal];
      const charmDef = CHARM_CATALOG[eff.charmId];
      const pairKey = `${cm.archetypeId}:${eff.charmId}`;
      const discId = CHARM_ARCHETYPE_DISCOVERIES[pairKey];
      if (discId) {
        journal = appendDiscoveryJournal(journal, discId, logLines);
      } else {
        journal.push({
          id: `fj_charm_${c}`,
          at: Date.now(),
          text: `${cm.nickname} acquired ${charmDef?.name ?? eff.charmId}.`,
          kind: "moment",
        });
      }
      return {
        state: { ...state, crew, fieldJournal: journal },
        rngCounter: c,
        logLines,
      };
    }
    case "add_scar": {
      const cm = crewByRole(state.crew, eff.role);
      if (!cm || cm.hp <= 0) return { state, rngCounter: c, logLines };
      // When scarCategory is provided, draw a random name from the pool.
      let scarText = eff.text;
      if (eff.scarCategory) {
        const drawn = drawScarName(state.runSeed, c++, eff.scarCategory);
        scarText = drawn.name;
      }
      const scar = { text: scarText, rolePenalty: eff.rolePenalty };
      const crew = state.crew.map((x) =>
        x.id === cm.id ? { ...x, scars: [...x.scars, scar] } : x,
      );
      logLines.push(`${cm.nickname} carries a scar: ${scarText}`);
      // 3rd scar: death gamble (spec §9.1a)
      let next: GameState = { ...state, crew };
      if (crew.find((x) => x.id === cm.id)!.scars.length >= 3) {
        const roll = drawIntInclusive(state.runSeed, c++, 1, 10);
        if (roll <= 3) {
          next = handleDeath(next, cm.role, c);
          c = next.rngCounter;
          logLines.push(
            `${cm.nickname}'s third scar. The roll came up ${roll}. They didn't make it.`,
          );
        } else {
          logLines.push(`${cm.nickname}'s third scar. The roll came up ${roll}. Still here.`);
        }
      }
      return { state: next, rngCounter: c, logLines };
    }
    case "journal": {
      const id = `fj_${c}_${fnv(eff.text)}`;
      const entry: FieldJournalEntry = {
        id,
        at: Date.now(),
        text: eff.text,
        kind: eff.kind ?? "moment",
      };
      logLines.push(`Journal: ${eff.text}`);
      return {
        state: { ...state, fieldJournal: [...state.fieldJournal, entry] },
        rngCounter: c,
        logLines,
      };
    }
    case "discovery_stub": {
      const disc = getDiscoveryText(eff.id);
      const id = `disc_${eff.id}`;
      if (state.fieldJournal.some((j) => j.id === id)) return { state, rngCounter: c, logLines };
      const text = `${disc.title} — ${disc.text}`;
      return {
        state: {
          ...state,
          fieldJournal: [
            ...state.fieldJournal,
            {
              id,
              at: Date.now(),
              text,
              kind: "discovery",
            },
          ],
        },
        rngCounter: c,
        logLines: [text],
      };
    }
    default:
      return { state, rngCounter: c, logLines };
  }
}

function resourcesGet(r: Resources, key: keyof Resources): number {
  return r[key];
}

function ammoKey(a: "AP" | "HE" | "WP" | "HEAT"): keyof Resources {
  switch (a) {
    case "AP":
      return "ammoAP";
    case "HE":
      return "ammoHE";
    case "WP":
      return "ammoWP";
    case "HEAT":
      return "ammoHEAT";
  }
}

function fnv(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** When a crew member dies, assign covering role to a survivor (spec §9.2). */
function handleDeath(state: GameState, deadRole: Role, counter: number): GameState {
  const dead = crewByRole(state.crew, deadRole);
  const survivors = livingCrew(state.crew).filter((c) => c.role !== deadRole);
  const crew = state.crew.map((c) =>
    c.role === deadRole ? { ...c, hp: 0, coveringRole: undefined } : c,
  );
  if (survivors.length === 0) {
    return {
      ...state,
      crew,
      meta: { t: "play", sub: campaignEpilogueSub({ ...state, crew }) },
      rngCounter: counter,
    };
  }
  const pick = survivors[drawIntInclusive(state.runSeed, counter, 0, survivors.length - 1)]!;
  const nextCrew = crew.map((c) =>
    c.id === pick.id
      ? {
          ...c,
          coveringRole: deadRole,
          constitution: Math.max(0, c.constitution - 10),
        }
      : c,
  );
  let next: GameState = {
    ...state,
    crew: nextCrew,
    rngCounter: counter + 1,
    narrativeLog: [
      ...state.narrativeLog,
      `${pick.nickname} is covering ${deadRole} now. The silences get longer.`,
    ],
    fieldJournal: [
      ...state.fieldJournal,
      {
        id: `fj_death_${dead?.nickname ?? deadRole}_${counter}`,
        at: Date.now(),
        text: `${dead?.firstName ?? "?"} "${dead?.nickname ?? "?"}" (${deadRole}) KIA.`,
        kind: "crew",
      },
    ],
  };
  if (deadRole === "commander") {
    next = { ...next, commanderEverKia: true };
    if (!next.successionAnnounced) {
      const voice = resolveVoiceLeader(next.crew);
      if (voice && voice.role !== "commander") {
        next = {
          ...next,
          successionAnnounced: true,
          narrativeLog: [
            ...next.narrativeLog,
            `${formatRank(voice.rank)} ${voice.nickname} has the net now.`,
          ],
        };
      }
    }
  }
  return next;
}
