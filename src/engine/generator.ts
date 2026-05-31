import type {
  ActiveMission,
  CrewMember,
  Difficulty,
  EnvironmentId,
  GameState,
  MetaPhase,
  MissionBriefArchetype,
  MissionDayPlan,
  RuntimeEvent,
  SeasonPhase,
  TankState,
} from "./types";
import { SAVE_VERSION } from "./types";
import { isEnvironmentValidForSeason } from "./campaignCalendar";
import { DIFFICULTY_PROFILE, ENV_POOL, seasonForMissionIndex } from "./config";
import { drawIntInclusive, shuffle } from "./rng";
import { ANCHOR_IDS, generateCrew, generateTankName } from "../content/pools";
import {
  EVENT_CATALOG,
  GENERIC_POOL,
  GENERIC_POOL_TIER2,
  FOOT_BEAT_IDS,
  SEEDED_FOLLOW_UPS,
  SOCIAL_BEAT_POOL,
} from "../content/eventsCatalog";
import { isElite, isHumanOrNpc, isTravelOrSupply } from "../content/poolKinds";
import { pickAreaEntryTemplate, buildAreaEntryBeat } from "../content/areaEntries";
import { pickDayLocation } from "../content/dayLocations";
import { pickOpenerVariant } from "../content/campaignOpeners";
import { framingSlideForMission } from "../content/missionBriefFraming";
import { missionNarrativeVars } from "./missionNarrativeVars";
import { archetypeFromBriefingId, slidesForArchetype } from "../content/missionBriefs";
import {
  buildDayGroundingVars,
  locationPickFromSnapshot,
  snapshotFromGroundingVars,
} from "./dayGroundingVars";
import { formatAreaEntry, formatEventStrings, formatNarrativeSlide } from "./template";
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

function buildMissionDayPlan(args: {
  seed: string;
  counter: number;
  missionIndex: number;
  dayIndex: number;
  season: SeasonPhase;
  environment: EnvironmentId;
  eventIds: string[];
  briefingArchetype: MissionBriefArchetype;
  crew: CrewMember[];
  tankName: string;
  objective: string;
}): { day: MissionDayPlan; nextCounter: number } {
  let c = args.counter;
  const locationResult = pickDayLocation(
    args.seed,
    c,
    args.missionIndex,
    args.dayIndex,
    args.briefingArchetype,
    args.environment,
    args.season,
  );
  c = locationResult.nextCounter;
  const locationPick = locationResult.pick;
  const eventsInDay = Math.max(args.eventIds.length, 1);

  const events = args.eventIds.map((eid, eventIndex) => {
    const vars = buildDayGroundingVars({
      runSeed: args.seed,
      missionIndex: args.missionIndex,
      dayIndex: args.dayIndex,
      eventIndex,
      eventsInDay,
      season: args.season,
      environment: args.environment,
      locationPick,
      crew: args.crew,
      tankName: args.tankName,
      objective: args.objective,
    });
    return formatEventStrings(cloneEvent(eid), vars);
  });

  const areaVars = buildDayGroundingVars({
    runSeed: args.seed,
    missionIndex: args.missionIndex,
    dayIndex: args.dayIndex,
    eventIndex: 0,
    eventsInDay,
    season: args.season,
    environment: args.environment,
    locationPick,
    crew: args.crew,
    tankName: args.tankName,
    objective: args.objective,
  });
  const picked = pickAreaEntryTemplate(args.seed, c, args.environment);
  c = picked.nextCounter;
  const areaEntry = formatAreaEntry(buildAreaEntryBeat(picked.template, areaVars), areaVars);
  const dayGrounding = snapshotFromGroundingVars(locationPick, areaVars);

  return {
    day: { environment: args.environment, events, areaEntry, dayGrounding },
    nextCounter: c,
  };
}

function spliceFromDeck(
  deck: string[],
  predicate: (id: string) => boolean,
): { id: string | null; deck: string[] } {
  const idx = deck.findIndex(predicate);
  if (idx < 0) return { id: null, deck };
  const id = deck[idx]!;
  return { id, deck: [...deck.slice(0, idx), ...deck.slice(idx + 1)] };
}

/** Mission fillers with soft kind quotas (§2.9): travel/supply, human/npc, max one elite. */
function fillMissionFillers(
  seed: string,
  startCounter: number,
  primaryDeck: string[],
  secondaryDeck: string[],
  count: number,
  used: Set<string>,
): {
  picked: string[];
  primaryDeck: string[];
  secondaryDeck: string[];
  nextCounter: number;
  secondPass: boolean;
} {
  if (count <= 0) {
    return {
      picked: [],
      primaryDeck,
      secondaryDeck,
      nextCounter: startCounter,
      secondPass: false,
    };
  }

  let primary = [...primaryDeck];
  let secondary = [...secondaryDeck];
  const picked: string[] = [];
  let c = startCounter;
  let secondPass = false;
  let usingSecondary = false;

  const activeDeck = (): string[] => (usingSecondary ? secondary : primary);

  const setActiveDeck = (next: string[]): void => {
    if (usingSecondary) secondary = next;
    else primary = next;
  };

  const refillFrom = (pool: readonly string[], allowUsedFilter: boolean): void => {
    const remaining = allowUsedFilter ? pool.filter((id) => !used.has(id)) : [...pool];
    const sh = shuffle(seed, c, remaining.length > 0 ? remaining : [...pool]);
    setActiveDeck(sh.arr);
    c = sh.nextCounter;
    secondPass = true;
  };

  const pull = (pred: (id: string) => boolean): void => {
    const work = activeDeck();
    const { id, deck: nextDeck } = spliceFromDeck(work, pred);
    if (!id) return;
    used.add(id);
    picked.push(id);
    setActiveDeck(nextDeck);
  };

  pull(isTravelOrSupply);
  if (picked.length < count) pull(isHumanOrNpc);

  let eliteInMission = picked.some(isElite);
  const need = count - picked.length;

  for (let i = 0; i < need; i++) {
    let work = activeDeck();
    if (work.length === 0) {
      if (!usingSecondary) {
        usingSecondary = true;
        secondPass = true;
        work = secondary;
        if (work.length === 0) {
          refillFrom(GENERIC_POOL_TIER2, true);
          work = activeDeck();
        }
      } else {
        refillFrom(GENERIC_POOL_TIER2, false);
        work = activeDeck();
      }
    }
    let idx = 0;
    if (eliteInMission) {
      const nonElite = work.findIndex((id) => !isElite(id));
      if (nonElite >= 0) idx = nonElite;
    }
    const id = work.splice(idx, 1)[0]!;
    setActiveDeck(work);
    used.add(id);
    picked.push(id);
    if (isElite(id)) eliteInMission = true;
  }

  return { picked, primaryDeck: primary, secondaryDeck: secondary, nextCounter: c, secondPass };
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
  options?: {
    tier1Pool?: readonly string[];
    tier2Pool?: readonly string[];
  },
): {
  used: number;
  poolSize: number;
  ratio: number;
  duplicateCount: number;
  tier1Used: number;
  tier2Used: number;
  tier2PoolSize: number;
} {
  const tier1Pool = options?.tier1Pool ?? GENERIC_POOL;
  const tier2Pool = options?.tier2Pool ?? GENERIC_POOL_TIER2;
  const poolSet = new Set([...tier1Pool, ...tier2Pool]);
  const fillerIds = collectCampaignEventIds(missions).filter((id) => poolSet.has(id));
  const unique = new Set(fillerIds);
  const tier1Set = new Set(tier1Pool);
  const tier2Set = new Set(tier2Pool);
  let tier1Used = 0;
  let tier2Used = 0;
  for (const id of unique) {
    if (tier2Set.has(id)) tier2Used++;
    else if (tier1Set.has(id)) tier1Used++;
  }
  const poolSize = tier1Pool.length + tier2Pool.length;
  const used = unique.size;
  return {
    used,
    poolSize,
    ratio: poolSize > 0 ? used / poolSize : 0,
    duplicateCount: fillerIds.length - unique.size,
    tier1Used,
    tier2Used,
    tier2PoolSize: tier2Pool.length,
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
  const remainingAnchors = [...anchorDeck];

  const { arr: fillerDeck, nextCounter: cFiller } = shuffle(args.seed, c, [...GENERIC_POOL]);
  c = cFiller;
  let remainingFillers = [...fillerDeck];
  const { arr: tier2Deck, nextCounter: cTier2 } = shuffle(args.seed, c, [...GENERIC_POOL_TIER2]);
  c = cTier2;
  let remainingTier2 = [...tier2Deck];
  const usedFillers = new Set<string>();

  for (let mi = 0; mi < prof.missions; mi++) {
    const season = seasonForMissionIndex(mi, prof.missions);
    const objective = OBJECTIVES[drawIntInclusive(args.seed, c++, 0, OBJECTIVES.length - 1)]!;
    const title = `Mission ${mi + 1}`;
    const nDays = drawIntInclusive(args.seed, c++, prof.daysMin, prof.daysMax);
    const dayEventCounts: number[] = [];
    for (let d = 0; d < nDays; d++) {
      dayEventCounts.push(
        drawIntInclusive(args.seed, c++, prof.eventsPerDayMin, prof.eventsPerDayMax),
      );
    }
    const totalEvents = dayEventCounts.reduce((s, n) => s + n, 0);

    const anchorWant = drawIntInclusive(args.seed, c++, prof.anchorsMin, prof.anchorsMax);
    const anchorN = Math.min(anchorWant, remainingAnchors.length, totalEvents);
    const anchorKeys = remainingAnchors.splice(0, anchorN);

    const fillerCount = Math.max(0, totalEvents - anchorKeys.length);
    const fillerTake = fillMissionFillers(
      args.seed,
      c,
      remainingFillers,
      remainingTier2,
      fillerCount,
      usedFillers,
    );
    c = fillerTake.nextCounter;
    remainingFillers = fillerTake.primaryDeck;
    remainingTier2 = fillerTake.secondaryDeck;
    if (fillerTake.secondPass) fillerSecondPass = true;

    const combined = shuffle(args.seed, c, [...anchorKeys, ...fillerTake.picked]);
    c = combined.nextCounter;
    const allEventIds = combined.arr;

    const BRIEFING_VARIANTS = [
      "briefing_generic",
      "briefing_attack",
      "briefing_defense",
      "briefing_pursuit",
      "briefing_patrol",
      "briefing_withdrawal",
      "briefing_night_move",
      "briefing_ammo_hold",
      "briefing_final_push",
    ] as const;
    const briefingId =
      BRIEFING_VARIANTS[drawIntInclusive(args.seed, c++, 0, BRIEFING_VARIANTS.length - 1)]!;
    const briefingArchetype = archetypeFromBriefingId(briefingId);

    const daySlices: { environment: EnvironmentId; eventIds: string[] }[] = [];
    let cursor = 0;
    for (let d = 0; d < nDays; d++) {
      const envPool = ENV_POOL[season];
      const environment: EnvironmentId =
        envPool[drawIntInclusive(args.seed, c++, 0, envPool.length - 1)]!;
      if (!isEnvironmentValidForSeason(environment, season)) {
        throw new Error(`Environment ${environment} invalid for season ${season}`);
      }
      const count = Math.min(
        dayEventCounts[d] ?? prof.eventsPerDayMin,
        allEventIds.length - cursor,
      );
      const slice = allEventIds.slice(cursor, cursor + Math.max(count, 1));
      cursor += slice.length;
      daySlices.push({ environment, eventIds: slice });
    }

    const slideVarsBase = missionNarrativeVars({
      runSeed: args.seed,
      missionIndex: mi,
      totalMissions: prof.missions,
      archetype: briefingArchetype,
      crew: args.crew,
      tankName: args.tankName,
      objective,
    });
    const framingSlide = formatNarrativeSlide(
      framingSlideForMission(mi, prof.missions, season),
      slideVarsBase,
    );
    const missionBriefPages = [
      framingSlide,
      ...slidesForArchetype(briefingArchetype, season).map((slide) =>
        formatNarrativeSlide(slide, slideVarsBase),
      ),
    ];
    const briefingEvent = formatEventStrings(cloneEvent(briefingId), slideVarsBase);

    const daysWithArea: MissionDayPlan[] = [];
    for (let d = 0; d < daySlices.length; d++) {
      const slice = daySlices[d]!;
      const built = buildMissionDayPlan({
        seed: args.seed,
        counter: c,
        missionIndex: mi,
        dayIndex: d,
        season,
        environment: slice.environment,
        eventIds: slice.eventIds,
        briefingArchetype,
        crew: args.crew,
        tankName: args.tankName,
        objective,
      });
      c = built.nextCounter;
      daysWithArea.push(built.day);
    }

    missions.push({
      title,
      objective,
      briefing:
        missionBriefPages[missionBriefPages.length - 1]?.narrative.split("\n\n")[0] ??
        `Orders cut through static: ${objective}.`,
      missionBriefPages,
      briefingArchetype,
      briefingEvent,
      days: daysWithArea,
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

export function createNewCampaign(args: { difficulty: Difficulty; seed: string }): GameState {
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
  const openerPick = pickOpenerVariant(args.seed, c);
  c = openerPick.nextCounter;

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
  const famousEntries: import("./types").FieldJournalEntry[] = famousDiscoveries.map((d, i) => {
    const disc = getDiscoveryText(d.catalogId);
    return {
      id: `disc_${d.catalogId}_${args.seed}_${i}`,
      at: Date.now(),
      text: `${disc.title} — ${disc.text}`,
      kind: "discovery" as const,
    };
  });

  const log: string[] = [];
  if (fillerSecondPass) {
    log.push("Division ran out of fresh map — pushed into country the first column never saw.");
  }

  return {
    version: SAVE_VERSION,
    runSeed: args.seed,
    rngCounter: c,
    openerVariant: openerPick.variant,
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
    quoteSilenceByRole: {},
    missionTrackers: {},
    sessionAchievementUnlocks: [],
    everBreakingTrauma: false,
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
  runSeed: string,
  missionIndex: number,
  season: SeasonPhase,
): ActiveMission {
  const injectIds: string[] = [];
  for (const flag of seededFlags) {
    const eid = SEEDED_FOLLOW_UPS[flag];
    if (eid && EVENT_CATALOG[eid]) injectIds.push(eid);
  }
  if (injectIds.length === 0) return mission;
  const day0 = mission.days[0];
  if (!day0?.dayGrounding) return mission;

  const locationPick = locationPickFromSnapshot(day0.dayGrounding);
  const startIndex = day0.events.length;
  const eventsInDay = startIndex + injectIds.length;
  const injected = injectIds.map((id, offset) => {
    const vars = buildDayGroundingVars({
      runSeed,
      missionIndex,
      dayIndex: 0,
      eventIndex: startIndex + offset,
      eventsInDay,
      season,
      environment: day0.environment,
      locationPick,
      crew,
      tankName,
      objective: mission.objective,
    });
    return formatEventStrings(structuredClone(EVENT_CATALOG[id]!), vars);
  });
  const days = mission.days.map((d, i) =>
    i === 0 ? { ...d, events: [...d.events, ...injected] } : d,
  );
  return { ...mission, days };
}

/** Backfill STAR slides and per-day grounding for older saves. */
export function backfillMissionNarrative(
  mission: ActiveMission,
  seed: string,
  crew: CrewMember[],
  tankName: string,
  missionIndex: number,
  totalMissions: number,
  startCounter: number,
): { mission: ActiveMission; nextCounter: number } {
  const hasBrief = mission.missionBriefPages?.length;
  const hasArea = mission.days.every((d) => d.areaEntry?.placeName);
  const hasFraming = mission.missionBriefPages?.[0]?.narrative.includes("meets you at");
  const hasGrounding = mission.days.every((d) => d.dayGrounding?.placeName);
  if (hasBrief && hasArea && hasFraming && hasGrounding)
    return { mission, nextCounter: startCounter };

  let c = startCounter;
  const season = seasonForMissionIndex(missionIndex, totalMissions);
  const archetype = mission.briefingArchetype ?? archetypeFromBriefingId(mission.briefingEvent.id);
  const slideVarsBase = missionNarrativeVars({
    runSeed: seed,
    missionIndex,
    totalMissions,
    archetype,
    crew,
    tankName,
    objective: mission.objective,
  });
  let missionBriefPages = mission.missionBriefPages?.length
    ? [...mission.missionBriefPages]
    : slidesForArchetype(archetype, season).map((slide) =>
        formatNarrativeSlide(slide, slideVarsBase),
      );
  const briefHasFraming = missionBriefPages[0]?.narrative.includes("meets you at");
  if (!briefHasFraming) {
    missionBriefPages = [
      formatNarrativeSlide(
        framingSlideForMission(missionIndex, totalMissions, season),
        slideVarsBase,
      ),
      ...missionBriefPages,
    ];
  }

  const days = mission.days.map((day, d) => {
    if (day.areaEntry?.placeName && day.dayGrounding?.placeName) return day;
    const eventIds = day.events.map((ev) => ev.id);
    const built = buildMissionDayPlan({
      seed,
      counter: c,
      missionIndex,
      dayIndex: d,
      season,
      environment: day.environment,
      eventIds,
      briefingArchetype: archetype,
      crew,
      tankName,
      objective: mission.objective,
    });
    c = built.nextCounter;
    return built.day;
  });

  return {
    mission: {
      ...mission,
      briefingArchetype: archetype,
      missionBriefPages,
      days,
    },
    nextCounter: c,
  };
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
