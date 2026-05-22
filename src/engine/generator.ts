import type {
  ActiveMission,
  CrewMember,
  Difficulty,
  EnvironmentId,
  GameState,
  MetaPhase,
  MissionDayPlan,
  RuntimeEvent,
  TankState,
} from "./types";
import { SAVE_VERSION } from "./types";
import { DIFFICULTY_PROFILE, ENV_POOL, seasonForMissionIndex } from "./config";
import { drawIntInclusive, pickManyUnique, shuffle } from "./rng";
import { ANCHOR_IDS, generateCrew, generateTankName } from "../content/pools";
import { EVENT_CATALOG, GENERIC_POOL, SEEDED_FOLLOW_UPS } from "../content/eventsCatalog";
import { formatEventStrings, narrativeVars } from "./template";
import { checkFamousCombination } from "../content/charms";

const OBJECTIVES = [
  "Clear the route for follow-on armor",
  "Seize the crossroads and hold until relieved",
  "Screen the flank while the battalion pushes",
  "Probe defenses and report",
  "Escort a supply column through contested ground",
] as const;

function cloneEvent(id: string): RuntimeEvent {
  const base = EVENT_CATALOG[id];
  if (!base) throw new Error(`Unknown event id: ${id}`);
  return structuredClone(base);
}

export function buildMissions(args: {
  seed: string;
  difficulty: Difficulty;
  crew: CrewMember[];
  tankName: string;
  startCounter: number;
}): { missions: ActiveMission[]; nextCounter: number } {
  const prof = DIFFICULTY_PROFILE[args.difficulty];
  let c = args.startCounter;
  const missions: ActiveMission[] = [];
  for (let mi = 0; mi < prof.missions; mi++) {
    const season = seasonForMissionIndex(mi, prof.missions);
    const objective =
      OBJECTIVES[drawIntInclusive(args.seed, c++, 0, OBJECTIVES.length - 1)]!;
    const title = `Mission ${mi + 1}`;
    const nDays = drawIntInclusive(args.seed, c++, prof.daysMin, prof.daysMax);
    // Build per-day event counts from config — ensures each day has the right density.
    const dayEventCounts: number[] = [];
    for (let d = 0; d < nDays; d++) {
      dayEventCounts.push(
        drawIntInclusive(args.seed, c++, prof.eventsPerDayMin, prof.eventsPerDayMax),
      );
    }
    const totalEvents = dayEventCounts.reduce((s, n) => s + n, 0);
    const anchorN = drawIntInclusive(
      args.seed,
      c++,
      prof.anchorsMin,
      Math.min(prof.anchorsMax, ANCHOR_IDS.length),
    );
    const { picked: anchorKeys, nextCounter: c2 } = pickManyUnique(
      args.seed,
      c,
      [...ANCHOR_IDS],
      anchorN,
    );
    c = c2;
    const fillerCount = Math.max(0, totalEvents - anchorKeys.length);
    const { arr: shuffledGenerics, nextCounter: c3 } = shuffle(
      args.seed,
      c,
      [...GENERIC_POOL],
    );
    c = c3;
    const fillerIds: string[] = [];
    for (let i = 0; i < fillerCount; i++) {
      fillerIds.push(shuffledGenerics[i % shuffledGenerics.length]!);
    }
    const combined = shuffle(args.seed, c, [...anchorKeys, ...fillerIds]);
    c = combined.nextCounter;
    const allEventIds = combined.arr;
    const days: MissionDayPlan[] = [];
    let cursor = 0;
    for (let d = 0; d < nDays; d++) {
      const envPool = ENV_POOL[season];
      const environment: EnvironmentId =
        envPool[drawIntInclusive(args.seed, c++, 0, envPool.length - 1)]!;
      // Use the pre-computed per-day count; clamp to remaining available ids.
      const count = Math.min(dayEventCounts[d] ?? prof.eventsPerDayMin, allEventIds.length - cursor);
      const slice = allEventIds.slice(cursor, cursor + Math.max(count, 1));
      cursor += slice.length;
      const events: RuntimeEvent[] = slice.map((eid) =>
        formatEventStrings(
          cloneEvent(eid),
          narrativeVars(args.crew, args.tankName, objective),
        ),
      );
      days.push({ environment, events });
    }
    const BRIEFING_VARIANTS = ["briefing_generic", "briefing_attack", "briefing_defense", "briefing_pursuit"];
    const briefingId = BRIEFING_VARIANTS[drawIntInclusive(args.seed, c++, 0, BRIEFING_VARIANTS.length - 1)]!;
    const briefingEvent = formatEventStrings(
      cloneEvent(briefingId),
      narrativeVars(args.crew, args.tankName, objective),
    );
    missions.push({
      title,
      objective,
      briefing: `Orders cut through static: ${objective}.`,
      briefingEvent,
      days,
    });
  }
  return { missions, nextCounter: c };
}

export function createNewCampaign(args: {
  difficulty: Difficulty;
  seed: string;
}): GameState {
  let c = 0;
  const { crew, next: c1 } = generateCrew(args.seed, c);
  c = c1;
  const tankName = generateTankName(args.seed, c++);
  const tank: TankState = {
    name: tankName,
    healthPct: 100,
    components: {
      engine: "ok",
      track_left: "ok",
      track_right: "ok",
      main_gun: "ok",
      hull_mg: "ok",
      radio: "ok",
      optics: "ok",
      hatch: "ok",
      armor_front: "ok",
    },
  };
  const { missions, nextCounter } = buildMissions({
    seed: args.seed,
    difficulty: args.difficulty,
    crew,
    tankName,
    startCounter: c,
  });
  const meta: MetaPhase = { t: "crew_reveal" };

  // Famous combination check (spec §15)
  const famousCombo = checkFamousCombination(tankName, crew.map((cm) => cm.nickname));
  const famousEntry: import("./types").FieldJournalEntry | null = famousCombo
    ? {
        id: `fj_famous_${args.seed}`,
        at: Date.now(),
        text: `${famousCombo.name}: ${famousCombo.description}`,
        kind: "discovery",
      }
    : null;

  return {
    version: SAVE_VERSION,
    runSeed: args.seed,
    rngCounter: nextCounter,
    difficulty: args.difficulty,
    contentWarningAccepted: true,
    meta,
    missionIndex: 0,
    seasonPhase: seasonForMissionIndex(0, missions.length),
    crew,
    tank,
    tankType: "sherman",
    resources: {
      ammoAP: 18,
      ammoHE: 24,
      ammoWP: 6,
      ammoHEAT: 8,
      smallArmsMags: 10,
      medkits: 3,
      foodDays: 6,
      waterCanteens: 6,
    },
    salvagePoints: 0,
    seededFlags: [],
    missions,
    narrativeLog: [],
    fieldJournal: famousEntry ? [famousEntry] : [],
    footMode: false,
    supportUsedThisEvent: [],
    lowConstitutionStreak: {},
  };
}

/**
 * Injects follow-up events for any seeded flags into the given mission.
 * Called when entering a new mission after flags were set in prior missions.
 */
export function injectSeededFollowUps(
  mission: ActiveMission,
  seededFlags: string[],
  crew: CrewMember[],
  tankName: string,
): ActiveMission {
  const injectIds: string[] = [];
  for (const flag of seededFlags) {
    const eid = SEEDED_FOLLOW_UPS[flag];
    if (eid && EVENT_CATALOG[eid]) injectIds.push(eid);
  }
  if (injectIds.length === 0) return mission;
  const injected = injectIds.map((id) =>
    formatEventStrings(structuredClone(EVENT_CATALOG[id]!), narrativeVars(crew, tankName, mission.objective)),
  );
  // Inject into the first day, after existing events
  const days = mission.days.map((d, i) =>
    i === 0 ? { ...d, events: [...d.events, ...injected] } : d,
  );
  return { ...mission, days };
}

export function initialTitleState(): GameState {
  return {
    version: SAVE_VERSION,
    runSeed: "",
    rngCounter: 0,
    difficulty: "green",
    tankType: "sherman",
    contentWarningAccepted: false,
    meta: { t: "title" },
    missionIndex: 0,
    seasonPhase: "summer",
    crew: [],
    tank: {
      name: "",
      healthPct: 100,
      components: {
        engine: "ok",
        track_left: "ok",
        track_right: "ok",
        main_gun: "ok",
        hull_mg: "ok",
        radio: "ok",
        optics: "ok",
        hatch: "ok",
        armor_front: "ok",
      },
    },
    resources: {
      ammoAP: 0,
      ammoHE: 0,
      ammoWP: 0,
      ammoHEAT: 0,
      smallArmsMags: 0,
      medkits: 0,
      foodDays: 0,
      waterCanteens: 0,
    },
    salvagePoints: 0,
    seededFlags: [],
    missions: [],
    narrativeLog: [],
    fieldJournal: [],
    footMode: false,
    supportUsedThisEvent: [],
    lowConstitutionStreak: {},
  };
}

export function toTitleState(prev: GameState): GameState {
  return {
    ...initialTitleState(),
    contentWarningAccepted: prev.contentWarningAccepted,
  };
}
