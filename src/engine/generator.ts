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
import { drawIntInclusive, shuffle } from "./rng";
import { ANCHOR_IDS, generateCrew, generateTankName } from "../content/pools";
import {
  EVENT_CATALOG,
  GENERIC_POOL,
  FOOT_BEAT_IDS,
  SEEDED_FOLLOW_UPS,
  SOCIAL_BEAT_POOL,
} from "../content/eventsCatalog";
import {
  isElite,
  isHumanOrNpc,
  isTravelOrSupply,
} from "../content/poolKinds";
import { formatEventStrings, narrativeVars } from "./template";
import { findFamousDiscoveries } from "../content/charms";
import { getDiscoveryText } from "../content/discoveries";

export const OBJECTIVES = [
  "Clear the route for follow-on armor",
  "Seize the crossroads and hold until relieved",
  "Screen the flank while the battalion pushes",
  "Probe defenses and report",
  "Escort a supply column through contested ground",
  "Secure the bridgehead before first light",
  "Relieve the infantry company at the road junction",
  "Cut the supply line behind the German salient",
  "Establish overwatch on the high ground east of town",
  "Push through the gap and link with Third Army",
  "Hold the depot until the trucks can unload",
  "Scout the secondary road — main route is compromised",
  "Clear the forest road through the Hürtgen",
  "Relieve the outpost at the Roer crossing",
  "Screen the column through the Ardennes gap",
  "Take the town square before the counterattack",
  "Destroy the bridge before enemy armor crosses",
  "Establish a listening post on the Elbe approach",
  "Push through the Siegfried Line breach",
  "Hold the supply depot against probing infantry",
] as const;

function cloneEvent(id: string): RuntimeEvent {
  const base = EVENT_CATALOG[id];
  if (!base) throw new Error(`Unknown event id: ${id}`);
  return structuredClone(base);
}

function spliceFromDeck(deck: string[], predicate: (id: string) => boolean): { id: string | null; deck: string[] } {
  const idx = deck.findIndex(predicate);
  if (idx < 0) return { id: null, deck };
  const id = deck[idx]!;
  return { id, deck: [...deck.slice(0, idx), ...deck.slice(idx + 1)] };
}

/** Mission fillers with soft kind quotas (§2.9): travel/supply, human/npc, max one elite. */
function fillMissionFillers(
  seed: string,
  startCounter: number,
  deck: string[],
  count: number,
  refill: readonly string[],
  used: Set<string>,
): { picked: string[]; deck: string[]; nextCounter: number; secondPass: boolean } {
  if (count <= 0) {
    return { picked: [], deck, nextCounter: startCounter, secondPass: false };
  }

  let work = [...deck];
  const picked: string[] = [];
  let c = startCounter;
  let secondPass = false;

  const pull = (pred: (id: string) => boolean): void => {
    const { id, deck: nextDeck } = spliceFromDeck(work, pred);
    if (!id) return;
    used.add(id);
    picked.push(id);
    work = nextDeck;
  };

  pull(isTravelOrSupply);
  if (picked.length < count) pull(isHumanOrNpc);

  let eliteInMission = picked.some(isElite);
  const need = count - picked.length;

  for (let i = 0; i < need; i++) {
    if (work.length === 0) {
      const remaining = refill.filter((id) => !used.has(id));
      const sh = shuffle(seed, c, remaining.length > 0 ? remaining : [...refill]);
      work = sh.arr;
      c = sh.nextCounter;
      secondPass = true;
    }
    let idx = 0;
    if (eliteInMission) {
      const nonElite = work.findIndex((id) => !isElite(id));
      if (nonElite >= 0) idx = nonElite;
    }
    const id = work.splice(idx, 1)[0]!;
    used.add(id);
    picked.push(id);
    if (isElite(id)) eliteInMission = true;
  }

  return { picked, deck: work, nextCounter: c, secondPass };
}

/** Seeded order for all foot beats after brew-up (§8.2). */
export function buildFootBeatIds(
  seed: string,
  counter: number,
  beats: readonly string[] = FOOT_BEAT_IDS,
): { ids: string[]; nextCounter: number } {
  const { arr, nextCounter } = shuffle(seed, counter, [...beats]);
  return { ids: arr, nextCounter };
}

export function measureFillerCoverage(
  missions: ActiveMission[],
  pool: readonly string[] = GENERIC_POOL,
): { used: number; poolSize: number; ratio: number; duplicateCount: number } {
  const poolSet = new Set(pool);
  const fillerIds = collectCampaignEventIds(missions).filter((id) => poolSet.has(id));
  const unique = new Set(fillerIds);
  const poolSize = pool.length;
  const used = unique.size;
  return {
    used,
    poolSize,
    ratio: poolSize > 0 ? used / poolSize : 0,
    duplicateCount: fillerIds.length - unique.size,
  };
}

/** Collect procedural event catalog ids used in mission days (excludes briefings). */
export function collectCampaignEventIds(missions: ActiveMission[]): string[] {
  const ids: string[] = [];
  for (const m of missions) {
    for (const day of m.days) {
      for (const ev of day.events) {
        ids.push(ev.id);
      }
    }
  }
  return ids;
}

export function countUniqueAnchorIds(missions: ActiveMission[]): {
  anchorIds: string[];
  uniqueAnchors: number;
  duplicateAnchors: number;
} {
  const anchorIds = collectCampaignEventIds(missions).filter((id) => id.startsWith("anchor_"));
  const set = new Set(anchorIds);
  return {
    anchorIds,
    uniqueAnchors: set.size,
    duplicateAnchors: anchorIds.length - set.size,
  };
}

export function buildMissions(args: {
  seed: string;
  difficulty: Difficulty;
  crew: CrewMember[];
  tankName: string;
  startCounter: number;
}): { missions: ActiveMission[]; nextCounter: number; fillerSecondPass: boolean } {
  const prof = DIFFICULTY_PROFILE[args.difficulty];
  let c = args.startCounter;
  const missions: ActiveMission[] = [];
  let fillerSecondPass = false;

  const { arr: anchorDeck, nextCounter: cAnchor } = shuffle(args.seed, c, [...ANCHOR_IDS]);
  c = cAnchor;
  let remainingAnchors = [...anchorDeck];

  const { arr: fillerDeck, nextCounter: cFiller } = shuffle(args.seed, c, [...GENERIC_POOL]);
  c = cFiller;
  let remainingFillers = [...fillerDeck];
  const usedFillers = new Set<string>();

  for (let mi = 0; mi < prof.missions; mi++) {
    const season = seasonForMissionIndex(mi, prof.missions);
    const objective =
      OBJECTIVES[drawIntInclusive(args.seed, c++, 0, OBJECTIVES.length - 1)]!;
    const title = `Mission ${mi + 1}`;
    const nDays = drawIntInclusive(args.seed, c++, prof.daysMin, prof.daysMax);
    const dayEventCounts: number[] = [];
    for (let d = 0; d < nDays; d++) {
      dayEventCounts.push(
        drawIntInclusive(args.seed, c++, prof.eventsPerDayMin, prof.eventsPerDayMax),
      );
    }
    const totalEvents = dayEventCounts.reduce((s, n) => s + n, 0);

    const anchorWant = drawIntInclusive(
      args.seed,
      c++,
      prof.anchorsMin,
      prof.anchorsMax,
    );
    const anchorN = Math.min(anchorWant, remainingAnchors.length, totalEvents);
    const anchorKeys = remainingAnchors.splice(0, anchorN);

    const fillerCount = Math.max(0, totalEvents - anchorKeys.length);
    const fillerTake = fillMissionFillers(
      args.seed,
      c,
      remainingFillers,
      fillerCount,
      GENERIC_POOL,
      usedFillers,
    );
    c = fillerTake.nextCounter;
    remainingFillers = fillerTake.deck;
    if (fillerTake.secondPass) fillerSecondPass = true;

    const combined = shuffle(args.seed, c, [...anchorKeys, ...fillerTake.picked]);
    c = combined.nextCounter;
    const allEventIds = combined.arr;

    const days: MissionDayPlan[] = [];
    let cursor = 0;
    for (let d = 0; d < nDays; d++) {
      const envPool = ENV_POOL[season];
      const environment: EnvironmentId =
        envPool[drawIntInclusive(args.seed, c++, 0, envPool.length - 1)]!;
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
    const BRIEFING_VARIANTS = [
      "briefing_generic",
      "briefing_attack",
      "briefing_defense",
      "briefing_pursuit",
      "briefing_patrol",
      "briefing_withdrawal",
    ];
    const briefingId =
      BRIEFING_VARIANTS[drawIntInclusive(args.seed, c++, 0, BRIEFING_VARIANTS.length - 1)]!;
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
  return { missions, nextCounter: c, fillerSecondPass };
}

export function buildSocialBeatQueue(
  seed: string,
  difficulty: Difficulty,
  startCounter: number,
): { queue: string[]; nextCounter: number } {
  const prof = DIFFICULTY_PROFILE[difficulty];
  const { arr, nextCounter } = shuffle(seed, startCounter, [...SOCIAL_BEAT_POOL]);
  return { queue: arr.slice(0, prof.missions), nextCounter };
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
  const { missions, nextCounter, fillerSecondPass } = buildMissions({
    seed: args.seed,
    difficulty: args.difficulty,
    crew,
    tankName,
    startCounter: c,
  });
  c = nextCounter;
  const { queue: socialBeatQueue, nextCounter: cSocial } = buildSocialBeatQueue(
    args.seed,
    args.difficulty,
    c,
  );
  c = cSocial;

  const meta: MetaPhase = { t: "crew_reveal" };

  const famousDiscoveries = findFamousDiscoveries(
    tankName,
    crew.map((cm) => ({
      nickname: cm.nickname,
      lastName: cm.lastName,
      firstName: cm.firstName,
      archetypeId: cm.archetypeId,
      role: cm.role,
    })),
  );
  const famousEntries: import("./types").FieldJournalEntry[] = famousDiscoveries.map(
    (d, i) => {
      const disc = getDiscoveryText(d.catalogId);
      return {
        id: `disc_${d.catalogId}_${args.seed}_${i}`,
        at: Date.now(),
        text: `${disc.title} — ${disc.text}`,
        kind: "discovery" as const,
      };
    },
  );

  const log: string[] = [];
  if (fillerSecondPass) {
    log.push("The road repeats itself — second pass through familiar country.");
  }

  return {
    version: SAVE_VERSION,
    runSeed: args.seed,
    rngCounter: c,
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
    narrativeLog: log,
    fieldJournal: famousEntries,
    footMode: false,
    supportUsedThisEvent: [],
    lowConstitutionStreak: {},
    socialBeatQueue,
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
    formatEventStrings(
      structuredClone(EVENT_CATALOG[id]!),
      narrativeVars(crew, tankName, mission.objective),
    ),
  );
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
    socialBeatQueue: [],
  };
}

export function toTitleState(prev: GameState): GameState {
  return {
    ...initialTitleState(),
    contentWarningAccepted: prev.contentWarningAccepted,
  };
}
