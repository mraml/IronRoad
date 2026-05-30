import { DIFFICULTY_PROFILE, TANK_TYPE_PROFILES, seasonForMissionIndex } from "./config";
import { difficultyDiceMod, resolveD10Check } from "./dice";
import { applyEffects } from "./effects";
import { createNewCampaign, injectSeededFollowUps, toTitleState } from "./generator";
import { drawIntInclusive } from "./rng";
import type {
  ComponentStatus,
  CrewMember,
  DebriefAction,
  Effect,
  GameAction,
  GameState,
  MetaPhase,
  PlaySub,
  Role,
  RuntimeEvent,
  TankComponent,
  TankType,
  TraumaStateId,
} from "./types";
import {
  getEncounterStep,
  primaryChoiceFromState,
  reactionDisplayText,
  shouldDeferForFollowUp,
} from "./encounterFlow";
import type { EncounterBeatStep } from "./types";
import { SAVE_VERSION } from "./types";
import { defaultRankForRole } from "../content/ranks";
import type { EnvironmentId } from "./types";
import { EVENT_CATALOG, SOCIAL_BEAT_POOL } from "../content/eventsCatalog";
import { buildFootBeatIds } from "./generator";
import { generateReplacement } from "../content/pools";
import { formatOutcomeQuoteLine, pickQuoteMomentForOutcome } from "../content/quotes";
import { formatEventStrings, narrativeVars } from "./template";
import { CHARM_CATALOG, rollCharmDrop, type CharmDropTier } from "../content/charms";
import { applyCampaignEndDiscoveries } from "../content/discoveries";
import {
  resolveMissionHiddenObjective,
  startMissionHiddenObjective,
  trackMissionEffect,
} from "./hiddenObjectives";
import {
  canProvideSupport,
  onTraumaAdded,
  resolveTraumaForcedChoice,
  tickQuoteSilenceAfterEvent,
  traumaDiceMods,
} from "./trauma";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Apply tank-type stat differences to a freshly-created campaign state. */
function applyTankTypeToState(s: GameState, tankType: TankType): GameState {
  const prof = TANK_TYPE_PROFILES[tankType];
  const bonus = prof.startAmmoBonus;
  return {
    ...s,
    tankType,
    tank: { ...s.tank, healthPct: prof.startHealthPct },
    resources: {
      ...s.resources,
      ammoAP: Math.min((s.resources.ammoAP) + (bonus.AP ?? 0), 30),
      ammoHE: Math.min((s.resources.ammoHE) + (bonus.HE ?? 0), 32),
      ammoWP: Math.min((s.resources.ammoWP) + (bonus.WP ?? 0), 12),
      ammoHEAT: Math.min((s.resources.ammoHEAT) + (bonus.HEAT ?? 0), 12),
    },
  };
}

function missionAt(s: GameState) {
  return s.missions[s.missionIndex];
}

function goPlay(sub: PlaySub): MetaPhase {
  return { t: "play", sub };
}

function normalizeEncounterStep(step: string): EncounterBeatStep {
  if (step === "react" || step === "followup_choose") return "choose";
  if (
    step === "narrative" ||
    step === "choose" ||
    step === "outcome"
  ) {
    return step;
  }
  return "choose";
}

function normalizePlaySub(sub: PlaySub): PlaySub {
  if (sub.t === "briefing" || sub.t === "foot" || sub.t === "tank_replacement") {
    return { ...sub, step: normalizeEncounterStep(sub.step) };
  }
  if (sub.t === "event") {
    return { ...sub, step: normalizeEncounterStep(sub.step) };
  }
  if (sub.t === "between_missions" && sub.socialStep) {
    return { ...sub, socialStep: normalizeEncounterStep(sub.socialStep) };
  }
  return sub;
}

function migrate(s: GameState): GameState {
  let meta = s.meta;
  if (meta.t === "play") {
    meta = { t: "play", sub: normalizePlaySub(meta.sub) };
  }
  return {
    ...s,
    version: SAVE_VERSION,
    meta,
    tankType: s.tankType ?? "sherman",
    supportUsedThisEvent: s.supportUsedThisEvent ?? [],
    lowConstitutionStreak: s.lowConstitutionStreak ?? {},
    pendingEncounter: undefined,
    crew: s.crew.map((c) => ({
      ...c,
      rank: c.rank ?? defaultRankForRole(c.role),
    })),
    socialBeatQueue: s.socialBeatQueue ?? [],
    quoteSilenceByRole: s.quoteSilenceByRole ?? {},
    missionTrackers: s.missionTrackers ?? {},
    sessionAchievementUnlocks: s.sessionAchievementUnlocks ?? [],
    everBreakingTrauma: s.everBreakingTrauma ?? false,
  };
}

function crewByRole(s: GameState, role: Role): CrewMember | undefined {
  return s.crew.find((c) => c.role === role);
}

// ─── environment ──────────────────────────────────────────────────────────────

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

/** Passive drain effects applied once per event for the day's environment. */
function envPassiveEffects(env: EnvironmentId): Effect[] {
  switch (env) {
    case "scorching_heat":
      // Water consumption doubles — spend an extra canteen every event
      return [{ op: "mod_resource", key: "waterCanteens", delta: -1 }];
    case "blizzard":
      // Whole-crew constitution drain
      return [{ op: "mod_all_constitution", delta: -3 }];
    case "hard_freeze":
      // Engine stress — small tank health cost
      return [{ op: "mod_tank_health", delta: -2 }];
    case "deep_mud":
    case "thaw_mud":
      // Track stress
      return [{ op: "set_component", component: "track_left" as TankComponent, status: "damaged" as ComponentStatus }];
    default:
      return [];
  }
}

function currentEnvironment(s: GameState): EnvironmentId | undefined {
  const m = missionAt(s);
  if (!m) return undefined;
  const sub = s.meta.t === "play" ? s.meta.sub : undefined;
  if (!sub) return undefined;
  if (sub.t === "day_intro" || sub.t === "event") {
    return m.days[sub.day]?.environment;
  }
  return undefined;
}

// ─── dice modifier builders ───────────────────────────────────────────────────

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

/** Ammo-type tactical bonus/penalty for combat events (spec §4.2, §7.2). */
function ammoTypeMod(s: GameState, choice: { role?: Role; id: string }, ev: RuntimeEvent): { label: string; value: number } | null {
  if (!ev.enemy?.idealAmmo) return null;
  // Check if the choice involves spending the ideal ammo
  const spends = choice ? false : false; // resolved below
  void spends;
  const ideal = ev.enemy.idealAmmo;
  const hasAmmo = (() => {
    switch (ideal) {
      case "AP": return s.resources.ammoAP > 0;
      case "HE": return s.resources.ammoHE > 0;
      case "WP": return s.resources.ammoWP > 0;
      case "HEAT": return s.resources.ammoHEAT > 0;
    }
  })();
  const choiceSpends = ev.choices
    .find((c) => c.id === choice.id)
    ?.effects.some((e) => e.op === "spend_ammo" && e.ammo === ideal);
  if (choiceSpends && hasAmmo) return { label: `${ideal} match`, value: 2 };
  if (choiceSpends && !hasAmmo) return { label: `No ${ideal} available`, value: -2 };
  return null;
}

/** Enemy difficulty modifier from event metadata (spec §7.2). */
function enemyCombatMod(ev: RuntimeEvent): { label: string; value: number } | null {
  if (!ev.enemy?.combatMod) return null;
  return { label: ev.enemy.label ?? "Enemy", value: ev.enemy.combatMod };
}

/** Component-cascade modifiers: broken engine/tracks affect relevant rolls. */
function componentCascadeMods(s: GameState, role?: Role): { label: string; value: number }[] {
  const mods: { label: string; value: number }[] = [];
  const c = s.tank.components;
  if (c.engine === "broken" && (role === "driver")) mods.push({ label: "Engine out", value: -2 });
  if (c.engine === "damaged" && role === "driver") mods.push({ label: "Engine damaged", value: -1 });
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

function tierExtraEffects(tier: number): Effect[] {
  if (tier === 1)
    return [
      { op: "mod_all_constitution", delta: -4 },
      { op: "mod_tank_health", delta: -4 },
    ];
  if (tier === 2) return [{ op: "mod_all_constitution", delta: -2 }];
  return [];
}

/** Tank-type dice modifiers (spec §3.5). */
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

/** Mission posture extras after dice resolve (spec §7.4–7.5). */
function postureExtraEffects(
  ev: RuntimeEvent,
  tier: number,
): { effects: Effect[]; logLines: string[] } {
  if (!ev.useDice) return { effects: [], logLines: [] };
  if (ev.kind === "defensive_stand") {
    return {
      effects: [{ op: "mod_all_constitution", delta: -2 }],
      logLines: ["Holding the line grinds the crew down."],
    };
  }
  if (ev.kind === "offensive_assault") {
    if (tier <= 2) {
      return { effects: [{ op: "mod_all_constitution", delta: -1 }], logLines: [] };
    }
    const logLines: string[] = [];
    if (tier >= 4) logLines.push("The push paid for itself.");
    return { effects: [{ op: "add_salvage", amount: 1 }], logLines };
  }
  return { effects: [], logLines: [] };
}

// ─── attrition tick ──────────────────────────────────────────────────────────

/** Applied after every event outcome. Drains HP when food/water depleted per spec §4.3. */
function attritionTick(s: GameState): GameState {
  const noFood = s.resources.foodDays <= 0;
  const noWater = s.resources.waterCanteens <= 0;
  if (!noFood && !noWater) return s;
  const delta = noFood && noWater ? -4 : -2;
  const effects: Effect[] = [
    { op: "mod_all_constitution", delta },
    ...s.crew.filter((c) => c.hp > 0).map((c): Effect => ({ op: "mod_hp", role: c.role, delta })),
  ];
  const applied = applyEffects(s, s.rngCounter, effects);
  const msg =
    noFood && noWater
      ? "No food, no water. The crew is fading."
      : noWater
        ? "Water's gone. Thirst slows everything."
        : "Last of the rations. Hunger sets in.";
  return {
    ...applied.state,
    rngCounter: applied.rngCounter,
    narrativeLog: [...s.narrativeLog, msg],
  };
}

// ─── archetype trauma guard (spec §3A.3) ──────────────────────────────────────

/**
 * Returns false when an archetype's trait blocks a specific trauma at this constitution level.
 * The Veteran resists Frozen until constitution ≤ 10.
 * The Pragmatist suppresses all non-breaking/numb trauma until constitution ≤ 15,
 * then lets all pending states fire simultaneously.
 */
function archetypeTraumaGuard(cm: CrewMember, trauma: TraumaStateId, con: number): boolean {
  switch (cm.archetypeId) {
    case "veteran":
      if (trauma === "frozen" && con > 10) return false;
      return true;
    case "pragmatist": {
      const unconditional: TraumaStateId[] = ["breaking", "numb"];
      if (!unconditional.includes(trauma) && con > 15) return false;
      return true;
    }
    default:
      return true;
  }
}

// ─── constitution-gated trauma triggers ──────────────────────────────────────

/** After an event, probabilistically trigger new trauma states based on constitution levels. */
function applyConstitutionTriggers(s: GameState): GameState {
  let state = s;
  let rng = s.rngCounter;
  const log: string[] = [];
  const streaks = { ...s.lowConstitutionStreak };

  for (const cm of state.crew) {
    if (cm.hp <= 0) continue;
    const con = cm.constitution;

    // Update low-constitution streak for Numb tracking
    if (con < 20) {
      streaks[cm.role] = (streaks[cm.role] ?? 0) + 1;
    } else {
      streaks[cm.role] = 0;
    }

    const addTrauma = (t: TraumaStateId) => {
      // Re-read the current crew member from state (may have changed in this loop)
      const current = state.crew.find((x) => x.id === cm.id)!;
      if (current.traumaStates.includes(t)) return;
      if (!archetypeTraumaGuard(cm, t, con)) return;
      const r = applyEffects(state, rng, [{ op: "add_trauma", role: cm.role, trauma: t }]);
      state = r.state;
      rng = r.rngCounter;
      log.push(r.logLines[0] ?? "");
    };

    // Shellshocked: constitution < 30, 40% chance per event
    if (con < 30 && !cm.traumaStates.includes("shellshocked")) {
      if (drawIntInclusive(s.runSeed, rng++, 1, 10) <= 4) addTrauma("shellshocked");
    }
    // Thousand-yard stare: constitution < 40, 25% chance
    if (con < 40 && !cm.traumaStates.includes("thousand_yard_stare")) {
      if (drawIntInclusive(s.runSeed, rng++, 1, 10) <= 2) addTrauma("thousand_yard_stare");
    }
    // Shaking: constitution < 35, 30% chance
    if (con < 35 && !cm.traumaStates.includes("shaking")) {
      if (drawIntInclusive(s.runSeed, rng++, 1, 10) <= 3) addTrauma("shaking");
    }
    // Checked out: constitution < 25, 25% chance
    if (con < 25 && !cm.traumaStates.includes("checked_out")) {
      if (drawIntInclusive(s.runSeed, rng++, 1, 10) <= 2) addTrauma("checked_out");
    }
    // Frozen: The Kid enters Frozen more easily (threshold < 25, 40%) than others (< 20, 20%).
    // The Veteran is blocked by archetypeTraumaGuard until constitution ≤ 10.
    const frozenThreshold = cm.archetypeId === "kid" ? 25 : 20;
    const frozenDiceThreshold = cm.archetypeId === "kid" ? 4 : 2;
    if (con < frozenThreshold && !cm.traumaStates.includes("frozen")) {
      if (drawIntInclusive(s.runSeed, rng++, 1, 10) <= frozenDiceThreshold) addTrauma("frozen");
    }
    // Breaking: constitution <= 10
    if (con <= 10 && !cm.traumaStates.includes("breaking")) {
      addTrauma("breaking");
    }
    // Numb: 3+ consecutive events below 20
    if ((streaks[cm.role] ?? 0) >= 3 && !cm.traumaStates.includes("numb")) {
      addTrauma("numb");
    }
  }

  return {
    ...state,
    rngCounter: rng,
    lowConstitutionStreak: streaks,
    narrativeLog: [...state.narrativeLog, ...log.filter(Boolean)],
  };
}

// ─── foot events ─────────────────────────────────────────────────────────────

function buildFootEvents(s: GameState): { events: RuntimeEvent[]; rngCounter: number } {
  const m = missionAt(s);
  const obj = m?.objective ?? "Survive";
  const vars = narrativeVars(s.crew, s.tank.name || "The dead hull", obj);
  const { ids, nextCounter } = buildFootBeatIds(s.runSeed, s.rngCounter);
  const events = ids.map((id) =>
    formatEventStrings(structuredClone(EVENT_CATALOG[id]!), vars),
  );
  return { events, rngCounter: nextCounter };
}

/** Map event kind to charm drop tier per spec §14.2. */
function charmDropTier(ev: RuntimeEvent): CharmDropTier | null {
  switch (ev.kind) {
    case "elite_encounter":
    case "historical_anchor":
      return "elite_anchor";
    case "tank_combat":
      return "tank";
    case "infantry_combat":
      return "infantry";
    case "npc_conversation":
      // legendary NPC events carry a legendary tag in their id prefix
      return ev.id.startsWith("legendary_") ? "legendary_npc" : "standard";
    case "travel":
    case "human_moment":
    case "supply":
      return "standard";
    default:
      return null; // no drop for briefings, etc.
  }
}

/** After eligible events resolve, roll charm loot (§14). */
function tryCharmDropAfterEvent(s: GameState, completedEv: RuntimeEvent): GameState {
  const tier = charmDropTier(completedEv);
  if (!tier) return s;
  let rng = s.rngCounter;
  const { charmId, nextCounter } = rollCharmDrop(s.runSeed, rng, tier);
  rng = nextCounter;
  let state: GameState = { ...s, rngCounter: rng };
  if (!charmId) return state;
  const eligible = state.crew.filter((c) => c.hp > 0 && !c.charmId);
  if (eligible.length === 0) return state;
  const pickIdx = drawIntInclusive(state.runSeed, rng++, 0, eligible.length - 1);
  const pick = eligible[pickIdx]!;
  const applied = applyEffects({ ...state, rngCounter: rng }, rng, [
    { op: "grant_charm", role: pick.role, charmId },
  ]);
  return {
    ...applied.state,
    rngCounter: applied.rngCounter,
    narrativeLog: [
      ...state.narrativeLog,
      `Loot: ${pick.nickname} finds a charm (${charmId}).`,
      ...applied.logLines,
    ],
  };
}

function crewDiedSince(
  before: { id: string; hp: number }[],
  after: GameState["crew"],
): boolean {
  return after.some((c) => {
    const prev = before.find((p) => p.id === c.id);
    return prev !== undefined && prev.hp > 0 && c.hp <= 0;
  });
}

/**
 * Charm moment triggers per spec §14.3.
 * When a rare+ charm holder is in a matching event context, append a cosmetic
 * narrative line and optionally a field journal entry.
 */
function tryCharmMoment(
  s: GameState,
  completedEv: RuntimeEvent,
  preCrewHp: { id: string; hp: number }[],
): GameState {
  const holders = s.crew.filter((c) => c.hp > 0 && c.charmId);
  if (holders.length === 0) return s;

  const lines: string[] = [];
  let journal = [...s.fieldJournal];
  const deathNearby = crewDiedSince(preCrewHp, s.crew);

  for (const holder of holders) {
    const charm = holder.charmId ? CHARM_CATALOG[holder.charmId] : undefined;
    if (!charm) continue;
    const isRarePlus = charm.rarity === "rare" || charm.rarity === "elite";
    if (!isRarePlus) continue;

    if (deathNearby) {
      lines.push(
        `${holder.nickname} turns the ${charm.name} over in their hand. Nobody says anything. Nobody has to.`,
      );
    }

    if (charm.rarity === "elite" && completedEv.kind === "historical_anchor") {
      const text = `${holder.nickname}'s ${charm.name} — ${charm.flavor} Here, of all places.`;
      lines.push(`${holder.nickname} holds the ${charm.name} up to the light for a moment. Then pockets it.`);
      const id = `fj_charm_moment_${holder.id}_${completedEv.id}`;
      if (!journal.some((j) => j.id === id)) {
        journal = [...journal, { id, at: Date.now(), text, kind: "moment" as const }];
      }
    }
  }

  if (lines.length === 0) return s;
  return {
    ...s,
    narrativeLog: [...s.narrativeLog, ...lines],
    fieldJournal: journal,
  };
}

/** Legendary-tier (elite) charm holder gets a journal beat when a mission completes. */
function tryMissionCompleteCharmMoment(s: GameState): GameState {
  const holders = s.crew.filter((c) => c.hp > 0 && c.charmId);
  if (holders.length === 0) return s;

  let journal = [...s.fieldJournal];
  const lines: string[] = [];

  for (const holder of holders) {
    const charm = holder.charmId ? CHARM_CATALOG[holder.charmId] : undefined;
    if (!charm || charm.rarity !== "elite") continue;
    const text = `Mission ${s.missionIndex + 1} complete. ${holder.nickname} still carries the ${charm.name}. ${charm.flavor}`;
    const id = `fj_charm_mission_${s.missionIndex}_${holder.id}`;
    if (!journal.some((j) => j.id === id)) {
      journal = [...journal, { id, at: Date.now(), text, kind: "moment" as const }];
      lines.push(`${holder.nickname} touches the ${charm.name} once before stowing it. Some things survive the road.`);
    }
  }

  if (lines.length === 0) return s;
  return { ...s, narrativeLog: [...s.narrativeLog, ...lines], fieldJournal: journal };
}

function formatTankReplacementEvent(s: GameState): RuntimeEvent {
  const m = missionAt(s);
  const vars = narrativeVars(s.crew, s.tank.name || "The dead hull", m?.objective ?? "Survive");
  return formatEventStrings(structuredClone(EVENT_CATALOG.tank_replace_fork!), vars);
}

function peekNextMissionIntel(s: GameState): string | undefined {
  const nextIdx = s.missionIndex + 1;
  if (nextIdx >= s.missions.length) return undefined;
  const nextM = s.missions[nextIdx];
  const first = nextM?.days[0]?.events[0];
  if (!first?.narrative) return undefined;
  const t = first.narrative.replaceAll("\n\n", " ").slice(0, 140);
  return t.length < first.narrative.length ? `${t}…` : t;
}

// ─── compound condition warning (spec §6.3) ──────────────────────────────────

/**
 * Returns a warning string when the current day's environment and game state
 * form a dangerous compound condition pair. Returns null when no compound risk.
 */
export function conditionWarning(
  env: EnvironmentId,
  s: GameState,
  dayEvents?: RuntimeEvent[],
): string | null {
  const hasInfantry = dayEvents?.some(
    (e) => e.kind === "infantry_combat" || e.kind === "defensive_stand",
  ) ?? false;
  const hasTankThreat = dayEvents?.some(
    (e) => e.kind === "tank_combat" || e.kind === "elite_encounter",
  ) ?? false;
  const engineBroken =
    s.tank.components.engine === "broken" || s.tank.components.engine === "damaged";
  const noWater = s.resources.waterCanteens <= 0;

  // Fog + infantry contact = ambush probability sharply elevated
  if ((env === "thick_fog" || env === "heavy_rain") && hasInfantry) {
    return "Fog and infantry ahead. The kind of morning that gets people killed. Ambush probability sharply elevated.";
  }
  // Blizzard + engine damage = possible mission-ending immobilisation
  if (env === "blizzard" && engineBroken) {
    return "Blizzard with a damaged engine. If she stalls out here, you won't be restarting her. Possible immobilisation.";
  }
  // Scorching heat + no water = crew health crisis
  if (env === "scorching_heat" && noWater) {
    return "Scorching heat. No water. Crew health will begin failing within the hour.";
  }
  // Night / fog + Tiger-tier threat
  if (env === "thick_fog" && hasTankThreat) {
    return "Thick fog and armoured contact reported. Sight lines are nothing. Every sound is a threat.";
  }
  return null;
}

// ─── main reducer ────────────────────────────────────────────────────────────

export function reduceGame(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_STATE":
      return migrate(action.state);
    case "ASSIGN_ROLE": {
      // Co-op scaffold: update seat list. No-op if role already claimed.
      const existing = (state.seats ?? []).filter(
        (s) => s.assignedRole !== action.role && s.playerId !== action.playerId,
      );
      const updated: import("./types").CoopSeat[] = [
        ...existing,
        { playerId: action.playerId, assignedRole: action.role },
      ];
      return {
        ...state,
        seats: updated,
        localPlayerId: state.localPlayerId ?? action.playerId,
      };
    }
    case "ABANDON_TO_TITLE":
      // Preserve campaign state for "Continue" — only update meta.
      return {
        ...state,
        meta: { t: "title" },
        resumeMeta: state.meta.t !== "title" ? state.meta : state.resumeMeta,
      };
    case "BEGIN_NEW_RUN": {
      const base = toTitleState(state);
      // Clear the resume meta since we're starting fresh
      const fresh = { ...base, resumeMeta: undefined };
      if (!fresh.contentWarningAccepted) {
        return { ...fresh, meta: { t: "content_warning" } };
      }
      return { ...fresh, meta: { t: "pick_difficulty" } };
    }
    case "ACCEPT_CONTENT_WARNING":
      if (state.meta.t !== "content_warning") return state;
      return { ...state, contentWarningAccepted: true, meta: { t: "pick_difficulty" } };
    case "START_CAMPAIGN": {
      // Go to tank type selection before generating the campaign.
      return {
        ...state,
        difficulty: action.difficulty,
        meta: { t: "pick_tank" },
      };
    }
    case "PICK_TANK": {
      if (state.meta.t !== "pick_tank") return state;
      const seed = `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const campaign = createNewCampaign({ difficulty: state.difficulty, seed });
      return applyTankTypeToState(campaign, action.tankType);
    }
    case "CONTINUE_AFTER_CREW": {
      if (state.meta.t !== "crew_reveal") return state;
      return startMissionHiddenObjective({
        ...state,
        meta: goPlay({ t: "briefing", step: "narrative" }),
      });
    }
    case "DAY_INTRO_CONTINUE": {
      if (state.meta.t !== "play" || state.meta.sub.t !== "day_intro") return state;
      const { day } = state.meta.sub;
      // Apply day-start environment passive on entering first event
      return { ...state, meta: goPlay({ t: "event", day, eventIndex: 0, step: "narrative" }) };
    }
    case "EVENT_CONTINUE": {
      if (state.meta.t !== "play") return state;
      const sub = state.meta.sub;
      const cleared = { ...state, uiAlert: undefined };
      if (sub.t === "briefing" && sub.step === "narrative") {
        return { ...cleared, meta: goPlay({ t: "briefing", step: "choose" }) };
      }
      if (sub.t === "event" && sub.step === "narrative") {
        return { ...cleared, meta: goPlay({ ...sub, step: "choose" }) };
      }
      if (sub.t === "foot" && sub.step === "narrative") {
        return { ...cleared, meta: goPlay({ ...sub, step: "choose" }) };
      }
      if (sub.t === "between_missions" && sub.socialStep === "narrative") {
        return { ...cleared, meta: goPlay({ t: "between_missions", socialStep: "choose" }) };
      }
      if (sub.t === "tank_replacement" && sub.step === "narrative") {
        return { ...cleared, meta: goPlay({ t: "tank_replacement", step: "choose" }) };
      }
      const advanceReact = (base: PlaySub): PlaySub | null => {
        if (base.t === "briefing" && base.step === "react") {
          return { t: "briefing", step: "followup_choose" };
        }
        if (base.t === "event" && base.step === "react") {
          return { ...base, step: "followup_choose" };
        }
        if (base.t === "foot" && base.step === "react") {
          return { ...base, step: "followup_choose" };
        }
        if (base.t === "tank_replacement" && base.step === "react") {
          return { t: "tank_replacement", step: "followup_choose" };
        }
        if (base.t === "between_missions" && base.socialStep === "react") {
          return { t: "between_missions", socialStep: "followup_choose" };
        }
        return null;
      };
      const next = advanceReact(sub);
      if (next) return { ...cleared, meta: goPlay(next) };
      return cleared;
    }
    case "CHOOSE_OPTION":
      return applyChoice(state, action.choiceId);
    case "CREW_SUPPORT":
      return applyCrewSupport(state, action.supporter, action.target);
    case "USE_MEDKIT":
      return applyMedkit(state, action.target);
    case "USE_CHARM":
      return applyCharm(state, action.role);
    case "USE_ROLE_ABILITY":
      return applyRoleAbility(state, action.role);
    case "SET_LOADER_AMMO_DOCTRINE": {
      if (state.meta.t !== "play") return state;
      const sub = state.meta.sub;
      if (
        sub.t !== "event" ||
        (sub.step !== "choose" && sub.step !== "followup_choose")
      ) {
        return state;
      }
      const ev = currentRuntimeEvent(state);
      if (!ev?.enemy?.idealAmmo || !ev.useDice) return state;
      return {
        ...state,
        loaderAmmoDoctrineBonus: action.useRecommended ? 1 : 0,
        narrativeLog: [
          ...state.narrativeLog,
          action.useRecommended
            ? `Loader: "${ev.enemy.idealAmmo} on the tray, Commander."`
            : "Commander overrides the load — crew notes it.",
        ],
      };
    }
    case "OUTCOME_CONTINUE":
      return advanceAfterOutcome(state);
    case "DEBRIEF_ACTION":
      return applyDebrief(state, action.action);
    case "BETWEEN_MISSIONS_CONTINUE": {
      if (state.meta.t !== "play" || state.meta.sub.t !== "between_missions") return state;
      if (state.meta.sub.socialStep) return state;
      const nextIdx = state.missionIndex + 1;
      if (nextIdx >= state.missions.length) {
        const ended = applyCampaignEndDiscoveries(state);
        return { ...ended, missionIndex: nextIdx, meta: goPlay(campaignEndSub(ended)) };
      }
      // Inject seeded follow-up events into the next mission
      const rawNext = state.missions[nextIdx]!;
      const patched = injectSeededFollowUps(rawNext, state.seededFlags, state.crew, state.tank.name);
      const missions = state.missions.map((m, i) => (i === nextIdx ? patched : m));
      return startMissionHiddenObjective({
        ...state,
        missions,
        missionIndex: nextIdx,
        seasonPhase: seasonForMissionIndex(nextIdx, state.missions.length),
        meta: goPlay({ t: "briefing", step: "narrative" }),
        crew: state.crew.map((c) => ({ ...c, charmUsedThisMission: false, roleAbilityUsed: false })),
        missionIntelHint: undefined,
        terrainPreviewHint: undefined,
        atSuppressed: undefined,
      });
    }
    default:
      return state;
  }
}

// ─── ending tone (spec §11.3) ────────────────────────────────────────────────

function campaignEndSub(s: GameState): PlaySub {
  const living = s.crew.filter((c) => c.hp > 0);
  const livingCount = living.length;
  if (livingCount === 0) {
    return { t: "end", won: false, reason: "Nobody made it. The road doesn't keep receipts. It just keeps." };
  }
  if (livingCount === 5) {
    return {
      t: "end",
      won: true,
      reason: `All five of you. ${living.map((c) => c.nickname).join(", ")}. Whatever comes next, you came back together. That almost never happens.`,
    };
  }
  if (livingCount === 1) {
    const survivor = living[0]!;
    return {
      t: "end",
      won: true,
      reason: `${survivor.nickname} made it. One name. The others are in the ground somewhere back there. The war calls this a victory. ${survivor.nickname} probably doesn't.`,
    };
  }
  const names = living.map((c) => c.nickname).join(", ");
  const dead = s.crew.filter((c) => c.hp <= 0).length;
  return {
    t: "end",
    won: true,
    reason: `${names} made it to the end. ${dead} didn't. You remember the road. You don't talk about it much. That's how you know it mattered.`,
  };
}

// ─── choice resolution ───────────────────────────────────────────────────────

/** Event whose choices are currently being resolved (mission beat, social beat, or tank replacement). */
function activeChoiceEvent(s: GameState): RuntimeEvent | undefined {
  if (s.meta.t !== "play") return undefined;
  const sub = s.meta.sub;
  if (sub.t === "tank_replacement") return s.tankReplacementBeat ?? formatTankReplacementEvent(s);
  if (sub.t === "between_missions" && sub.socialStep && s.socialBeat) return s.socialBeat;
  return currentRuntimeEvent(s);
}

function playSubToOutcome(sub: PlaySub): PlaySub {
  if (sub.t === "foot") return { ...sub, step: "outcome" };
  if (sub.t === "event") return { ...sub, step: "outcome" };
  if (sub.t === "briefing") return { ...sub, step: "outcome" };
  if (sub.t === "tank_replacement") return { ...sub, step: "outcome" };
  if (sub.t === "between_missions" && sub.socialStep) {
    return { t: "between_missions", socialStep: "outcome" };
  }
  return sub;
}

function playSubToReact(sub: PlaySub): PlaySub {
  if (sub.t === "foot") return { ...sub, step: "react" };
  if (sub.t === "event") return { ...sub, step: "react" };
  if (sub.t === "briefing") return { ...sub, step: "react" };
  if (sub.t === "tank_replacement") return { ...sub, step: "react" };
  if (sub.t === "between_missions" && sub.socialStep) {
    return { t: "between_missions", socialStep: "react" };
  }
  return sub;
}

function playSubToChoose(sub: PlaySub): PlaySub {
  if (sub.t === "foot") return { ...sub, step: "choose" };
  if (sub.t === "event") return { ...sub, step: "choose" };
  if (sub.t === "briefing") return { ...sub, step: "choose" };
  if (sub.t === "tank_replacement") return { ...sub, step: "choose" };
  if (sub.t === "between_missions" && sub.socialStep) {
    return { t: "between_missions", socialStep: "choose" };
  }
  return sub;
}

function applyChoice(state: GameState, choiceId: string): GameState {
  if (state.meta.t !== "play") return state;
  const sub = state.meta.sub;
  const ev = activeChoiceEvent(state);
  if (!ev) return state;
  const step = getEncounterStep(sub);
  if (!step || (step !== "choose" && step !== "followup_choose")) return state;

  const primaryStored = primaryChoiceFromState(state, ev);
  let choiceRaw =
    step === "followup_choose"
      ? primaryStored?.followUpChoices?.find((c) => c.id === choiceId)
      : ev.choices.find((c) => c.id === choiceId);
  if (!choiceRaw) return state;

  if (state.seats && state.seats.length > 0 && state.localPlayerId && choiceRaw.role) {
    const assignedSeat = state.seats.find((s) => s.assignedRole === choiceRaw.role);
    if (assignedSeat && assignedSeat.playerId !== state.localPlayerId) {
      return state;
    }
  }

  if (step === "followup_choose" && choiceRaw.returnToPrimary && primaryStored) {
    return {
      ...state,
      pendingEncounter: undefined,
      meta: goPlay(playSubToChoose(sub)),
      loaderAmmoDoctrineBonus: undefined,
    };
  }

  if (step === "choose") {
    let primary = choiceRaw;
    const forced = resolveTraumaForcedChoice(
      state,
      ev,
      primary,
      sub.t === "foot" ? "foot" : sub.t === "event" ? "event" : "",
    );
    state = forced.state;
    primary = forced.primary;
    const frozenPrefix = forced.prefix;

    if (shouldDeferForFollowUp(primary)) {
      const log = primary.dialogueLine
        ? [...state.narrativeLog, primary.dialogueLine]
        : state.narrativeLog;
      return {
        ...state,
        pendingEncounter: { primaryChoiceId: primary.id },
        narrativeLog: log,
        meta: goPlay(playSubToReact(sub)),
        supportUsedThisEvent: [],
      };
    }

    if (primary.flavorOnly) {
      return {
        ...state,
        pendingOutcome: {
          choice: primary,
          dice: undefined,
          displayText: frozenPrefix + primary.outcomeText,
        },
        meta: goPlay(playSubToOutcome(sub)),
        supportUsedThisEvent: [],
        loaderAmmoDoctrineBonus: undefined,
      };
    }

    return resolveEncounterChoice(state, sub, ev, primary, undefined, frozenPrefix);
  }

  if (!primaryStored) return state;
  return resolveEncounterChoice(state, sub, ev, primaryStored, choiceRaw, "");
}

function resolveEncounterChoice(
  state: GameState,
  sub: PlaySub,
  ev: RuntimeEvent,
  primary: import("./types").EventChoice,
  followUp: import("./types").EventChoice | undefined,
  frozenPrefix: string,
): GameState {
  const resolving = followUp ?? primary;
  const diceRole = followUp?.role ?? primary.role;
  const tacticsMod = (primary.modifierBonus ?? 0) + (followUp?.modifierBonus ?? 0);
  const preCrewHp = state.crew.map((c) => ({ id: c.id, hp: c.hp }));

  let rng = state.rngCounter;
  let dice = undefined;
  let extra: Effect[] = [];
  let postureLogLines: string[] = [];

  if (ev.useDice && !resolving.flavorOnly) {
    const mods: { label: string; value: number }[] = [
      { label: "Difficulty", value: difficultyDiceMod(state.difficulty) },
    ];
    if (tacticsMod !== 0) mods.push({ label: "Tactics", value: tacticsMod });
    const env = currentEnvironment(state);
    if (env) mods.push({ label: "Environment", value: envDiceMod(env) });
    mods.push({ label: "Crew nerve", value: constitutionMod(state, diceRole) });
    mods.push({ label: "Optics", value: opticsMod(state, diceRole) });
    mods.push(...traumaDiceMods(state, diceRole));
    mods.push(...scarDiceMods(state, diceRole));
    mods.push(...componentCascadeMods(state, diceRole));
    const ammoMod = ammoTypeMod(state, resolving, ev);
    if (ammoMod) mods.push(ammoMod);
    if ((state.loaderAmmoDoctrineBonus ?? 0) > 0) {
      mods.push({ label: "Loader doctrine", value: 1 });
    }
    const enemyMod = enemyCombatMod(ev);
    if (enemyMod) mods.push(enemyMod);
    mods.push(...tankTypeDiceMods(state, ev, diceRole));
    const res = resolveD10Check({ seed: state.runSeed, counter: rng, modifiers: mods });
    rng = res.nextCounter;
    dice = res.breakdown;
    extra = tierExtraEffects(dice.tier);
    const posture = postureExtraEffects(ev, dice.tier);
    extra = [...extra, ...posture.effects];
    postureLogLines = posture.logLines;
  }

  const env = currentEnvironment(state);
  const envPassive: Effect[] =
    env && sub.t === "event"
      ? envPassiveEffects(env).filter((e) => e.op !== "set_component" || ev.kind === "travel")
      : [];

  const primaryEffects = primary.flavorOnly && followUp ? [] : primary.effects;
  const followEffects = followUp?.effects ?? [];
  let effectsList = [...primaryEffects, ...followEffects, ...extra, ...envPassive];
  if (
    state.atSuppressed &&
    (ev.kind === "infantry_combat" || ev.kind === "defensive_stand")
  ) {
    effectsList = effectsList.filter(
      (e) => !(e.op === "mod_tank_health" && (e as { op: string; delta: number }).delta < 0),
    );
  }

  const resourceSnapshot = { ...state.resources };
  const tankHealthBefore = state.tank.healthPct;
  let applied = applyEffects(state, rng, effectsList);
  for (const eff of effectsList) {
    applied = { ...applied, state: trackMissionEffect(applied.state, eff) };
  }
  let next: GameState = {
    ...applied.state,
    rngCounter: applied.rngCounter,
    narrativeLog: [...state.narrativeLog, ...applied.logLines, ...postureLogLines],
    supportUsedThisEvent: [],
    loaderAmmoDoctrineBonus: undefined,
    pendingEncounter: undefined,
  };

  const modText = dice
    ? dice.modifiers
        .filter((m) => m.value !== 0)
        .map((m) => `${m.value >= 0 ? "+" : ""}${m.value} ${m.label}`)
        .join(", ")
    : "";
  const outcomeBody = followUp?.outcomeText ?? primary.outcomeText;
  let display = frozenPrefix;
  if (followUp) {
    display += `${reactionDisplayText(primary)}\n\n`;
  }
  if (dice) {
    display += `${dice.tierLabel} — d10 ${dice.roll}${modText ? ` (${modText})` : ""} → total ${dice.total}.\n\n`;
  }
  display += outcomeBody;
  const npcTail = followUp?.npcReply ?? primary.npcReply;
  if (npcTail) display = `${display}\n\n${npcTail}`;
  if (dice) {
    const tierLine = ev.tierFlavor?.[dice.tier];
    if (tierLine) display = `${display}\n\n${tierLine}`;
  }

  next = {
    ...next,
    pendingOutcome: {
      choice: resolving,
      dice,
      displayText: display,
      preCrewHp,
      effectLines: [...applied.logLines, ...postureLogLines],
      resourceSnapshot,
      tankHealthBefore,
    },
    meta: goPlay(playSubToOutcome(sub)),
  };

  if (next.tank.healthPct <= 0 && !next.footEvents?.length && sub.t === "event") {
    next = applyBrewUp(next);
    const foot = buildFootEvents(next);
    next = { ...next, footEvents: foot.events, rngCounter: foot.rngCounter };
  }

  return next;
}

// ─── brew-up survival rolls (spec §8.1) ──────────────────────────────────────

function applyBrewUp(s: GameState): GameState {
  let state = s;
  const log: string[] = [
    `${s.tank.name} brews up. She's gone.`,
    "Per-crew escape rolls:",
  ];
  let rng = s.rngCounter;

  for (const cm of s.crew) {
    if (cm.hp <= 0) continue;
    const roll = drawIntInclusive(s.runSeed, rng++, 1, 10);
    const conBonus = cm.constitution >= 60 ? 1 : cm.constitution < 30 ? -1 : 0;
    const total = roll + conBonus;
    if (total <= 2) {
      // KIA during escape
      const r = applyEffects(state, rng, [{ op: "mod_hp", role: cm.role, delta: -100 }]);
      state = r.state; rng = r.rngCounter;
      log.push(`${cm.nickname}: roll ${total} — trapped. KIA.`);
    } else if (total <= 4) {
      // Severe burn injury
      const r = applyEffects(state, rng, [
        { op: "mod_hp", role: cm.role, delta: -30 },
        { op: "add_trauma", role: cm.role, trauma: "shellshocked" },
        { op: "add_scar", role: cm.role, text: "burn scars from the brew-up", scarCategory: "burn" },
      ]);
      state = r.state; rng = r.rngCounter;
      log.push(`${cm.nickname}: roll ${total} — out but burned. −30 HP.`);
    } else if (total <= 6) {
      // Minor injury
      const r = applyEffects(state, rng, [
        { op: "mod_hp", role: cm.role, delta: -15 },
        { op: "mod_constitution", role: cm.role, delta: -10 },
      ]);
      state = r.state; rng = r.rngCounter;
      log.push(`${cm.nickname}: roll ${total} — out with smoke in lungs.`);
    } else {
      log.push(`${cm.nickname}: roll ${total} — clear.`);
    }
  }

  return {
    ...state,
    rngCounter: rng,
    narrativeLog: [...state.narrativeLog, ...log],
  };
}

// ─── crew support action (spec §3A.4) ────────────────────────────────────────

function applyCrewSupport(state: GameState, supporter: Role, target: Role): GameState {
  if (state.meta.t !== "play") return state;
  const sub = state.meta.sub;
  if (sub.t !== "event" && sub.t !== "foot") return state;
  if (sub.step !== "choose") return state;

  // Can't support if already used this event, or if same role
  if (state.supportUsedThisEvent.includes(supporter)) return state;
  if (supporter === target) return state;

  const supporterCm = crewByRole(state, supporter);
  const targetCm = crewByRole(state, target);
  if (!supporterCm || supporterCm.hp <= 0) return state;
  if (!canProvideSupport(supporterCm)) return state;
  if (!targetCm || targetCm.hp <= 0) return state;

  // Roll 15–25 constitution restore
  const restore = drawIntInclusive(state.runSeed, state.rngCounter, 15, 25);
  const rng = state.rngCounter + 1;

  // Clear one minor trauma from target
  const minorTraumas: TraumaStateId[] = ["shellshocked", "shaking", "jumpy"];
  const clearable = targetCm.traumaStates.find((t) => minorTraumas.includes(t));

  const effects: Effect[] = [{ op: "mod_constitution", role: target, delta: restore }];
  if (clearable) effects.push({ op: "clear_trauma", role: target, trauma: clearable });

  const applied = applyEffects({ ...state, rngCounter: rng }, rng, effects);
  const log = `${supporterCm.nickname} → ${targetCm.nickname}: +${restore} constitution.${clearable ? ` ${clearable} cleared.` : ""}`;

  return {
    ...applied.state,
    rngCounter: applied.rngCounter,
    supportUsedThisEvent: [...state.supportUsedThisEvent, supporter],
    narrativeLog: [...state.narrativeLog, log],
  };
}

// ─── medkit healing (spec §9.1) ──────────────────────────────────────────────

function applyMedkit(state: GameState, target: Role): GameState {
  if (state.meta.t !== "play") return state;
  const sub = state.meta.sub;
  // Can use during event choose step or debrief
  const validStep =
    (sub.t === "event" && (sub.step === "choose" || sub.step === "followup_choose")) ||
    (sub.t === "foot" && (sub.step === "choose" || sub.step === "followup_choose")) ||
    sub.t === "debrief";
  if (!validStep) return state;
  if (state.resources.medkits <= 0) return state;
  const cm = crewByRole(state, target);
  if (!cm || cm.hp <= 0) return state;
  if (cm.hp >= 100) return state;

  let tracked = {
    ...state,
    missionTrackers: { ...state.missionTrackers, medkitUsed: true },
  };

  // Dice roll: Loader skill + RNG for 15–35 HP restore
  const roll = drawIntInclusive(state.runSeed, state.rngCounter, 1, 10);
  const rng = state.rngCounter + 1;
  const loaderCon = state.crew.find((c) => c.role === "loader")?.constitution ?? 50;
  const bonus = loaderCon >= 60 ? 5 : loaderCon >= 40 ? 0 : -5;
  const heal = Math.max(10, Math.min(35, 15 + roll + bonus));

  const applied = applyEffects(
    { ...tracked, rngCounter: rng },
    rng,
    [
      { op: "mod_resource", key: "medkits", delta: -1 },
      { op: "mod_hp", role: target, delta: heal },
    ],
  );
  // Wounded threshold: constitution penalty if HP ≤ 15 (spec §9.1)
  const after = applied.state;
  const afterCm = crewByRole(after, target);
  let final = { ...after, rngCounter: applied.rngCounter };
  if (afterCm && afterCm.hp <= 15) {
    const r2 = applyEffects(final, final.rngCounter, [{ op: "mod_constitution", role: target, delta: -10 }]);
    final = { ...r2.state, rngCounter: r2.rngCounter };
    applied.logLines.push(`${afterCm.nickname} is still badly wounded. Constitution suffers.`);
  }
  return {
    ...final,
    narrativeLog: [...state.narrativeLog, ...applied.logLines, `Medkit on ${cm.nickname}: +${heal} HP.`],
  };
}

// ─── charm use (spec §3B) ────────────────────────────────────────────────────

function applyCharm(state: GameState, role: Role): GameState {
  if (state.meta.t !== "play") return state;
  const sub = state.meta.sub;
  const validStep =
    (sub.t === "event" && (sub.step === "choose" || sub.step === "followup_choose")) ||
    (sub.t === "foot" && (sub.step === "choose" || sub.step === "followup_choose")) ||
    sub.t === "debrief";
  if (!validStep) return state;

  const cm = crewByRole(state, role);
  if (!cm || cm.hp <= 0 || !cm.charmId) return state;
  if (cm.charmUsedThisMission) return state;

  const charm = CHARM_CATALOG[cm.charmId];
  if (!charm) return state;

  const effects = charm.effects(role);
  const applied = applyEffects(state, state.rngCounter + 1, effects);
  const crew = applied.state.crew.map((c) =>
    c.id === cm.id ? { ...c, charmUsedThisMission: true } : c,
  );

  return {
    ...applied.state,
    crew,
    rngCounter: applied.rngCounter,
    narrativeLog: [
      ...state.narrativeLog,
      `${cm.nickname} uses ${charm.name}. ${charm.flavor}`,
      ...applied.logLines,
    ],
  };
}

/** §16.2 once-per-mission role abilities (Driver terrain read, Asst. Driver suppression). */
function applyRoleAbility(state: GameState, role: "driver" | "asst_driver"): GameState {
  if (state.meta.t !== "play") return state;
  const sub = state.meta.sub;
  const cm = crewByRole(state, role);
  if (!cm || cm.hp <= 0 || cm.roleAbilityUsed) return state;

  const crew = state.crew.map((c) => (c.id === cm.id ? { ...c, roleAbilityUsed: true } : c));

  if (role === "driver") {
    // Valid during any choose step in mission events or foot beats.
    const validStep =
      (sub.t === "event" && (sub.step === "choose" || sub.step === "followup_choose")) ||
      (sub.t === "foot" && (sub.step === "choose" || sub.step === "followup_choose"));
    if (!validStep) return state;
    // Peek ahead to find the next travel or foot_beat event's atmosphere or first sentence.
    let preview: string | undefined;
    if (sub.t === "event") {
      const m = missionAt(state);
      const day = m?.days[sub.day];
      const nextEv = day?.events[sub.eventIndex + 1];
      if (nextEv) {
        preview = nextEv.atmosphere ?? nextEv.narrative.split("\n\n")[0];
      }
    } else if (sub.t === "foot") {
      const nextEv = state.footEvents?.[sub.index + 1];
      if (nextEv) {
        preview = nextEv.atmosphere ?? nextEv.narrative.split("\n\n")[0];
      }
    }
    const hint = preview
      ? `Terrain Read: ${preview}`
      : "Terrain Read: Nothing unusual ahead — the ground looks clear.";
    return {
      ...state,
      crew,
      terrainPreviewHint: hint,
      narrativeLog: [...state.narrativeLog, `${cm.nickname} reads the ground ahead. ${hint}`],
    };
  }

  if (role === "asst_driver") {
    // Valid during an infantry event choose step.
    const validStep =
      sub.t === "event" &&
      (sub.step === "choose" || sub.step === "followup_choose");
    if (!validStep) return state;
    const ev = currentRuntimeEvent(state);
    if (!ev || (ev.kind !== "infantry_combat" && ev.kind !== "defensive_stand")) return state;
    return {
      ...state,
      crew,
      atSuppressed: true,
      narrativeLog: [
        ...state.narrativeLog,
        `${cm.nickname} opens up with the hull MG. Suppressing Fire — any AT threat is pinned for this beat.`,
      ],
    };
  }

  return state;
}

// ─── current event lookup ─────────────────────────────────────────────────────

function currentRuntimeEvent(s: GameState): RuntimeEvent | undefined {
  if (s.meta.t !== "play") return undefined;
  const sub = s.meta.sub;
  const m = missionAt(s);
  if (!m) return undefined;
  if (sub.t === "briefing") return m.briefingEvent;
  if (sub.t === "foot") return s.footEvents?.[sub.index];
  if (sub.t === "event") return m.days[sub.day]?.events[sub.eventIndex];
  return undefined;
}

/** Faithful crew: moral-weight events can trigger grief regardless of constitution (§3A.3). */
function applyFaithfulMoralTrauma(state: GameState, ev: RuntimeEvent | undefined): GameState {
  if (!ev?.moralWeight) return state;
  let s = state;
  let rng = s.rngCounter;
  for (const cm of s.crew) {
    if (cm.hp <= 0 || cm.archetypeId !== "faithful") continue;
    if (cm.traumaStates.includes("grief_struck")) continue;
    if (drawIntInclusive(s.runSeed, rng++, 1, 10) <= 4) {
      const r = applyEffects(s, rng, [
        { op: "add_trauma", role: cm.role, trauma: "grief_struck" },
      ]);
      s = onTraumaAdded(r.state, cm.role, "grief_struck");
      rng = r.rngCounter;
    }
  }
  return { ...s, rngCounter: rng };
}

// ─── advance after outcome ────────────────────────────────────────────────────

function advanceAfterOutcome(state: GameState): GameState {
  const wasEventOutcome =
    state.meta.t === "play" &&
    state.meta.sub.t === "event" &&
    state.meta.sub.step === "outcome";
  const completedEv = wasEventOutcome ? currentRuntimeEvent(state) : undefined;
  const preCrewHp =
    state.pendingOutcome?.preCrewHp ?? state.crew.map((c) => ({ id: c.id, hp: c.hp }));

  const logLenBefore = state.narrativeLog.length;
  let s = applyAttritionAndTriggers({
    ...state,
    pendingOutcome: undefined,
    pendingEncounter: undefined,
    atSuppressed: undefined,
    terrainPreviewHint: undefined,
  });
  let uiAlert: string | undefined;
  if (s.narrativeLog.length > logLenBefore) {
    uiAlert = s.narrativeLog[s.narrativeLog.length - 1];
  }
  s = { ...s, uiAlert };

  if (wasEventOutcome && completedEv) {
    s = tryCharmDropAfterEvent(s, completedEv);
    s = tryCharmMoment(s, completedEv, preCrewHp);
    s = applyFaithfulMoralTrauma(s, completedEv);
    s = tickQuoteSilenceAfterEvent(s);
  }

  if (s.meta.t === "play") {
    const subNow = s.meta.sub;
    const onOutcome =
      (subNow.t === "event" && subNow.step === "outcome") ||
      (subNow.t === "foot" && subNow.step === "outcome");
    if (onOutcome) {
      const moment = pickQuoteMomentForOutcome(s, subNow.t);
      const line = formatOutcomeQuoteLine(s, moment);
      if (line) s = { ...s, narrativeLog: [...s.narrativeLog, line] };
    }
  }

  if (s.meta.t !== "play") return s;
  const sub = s.meta.sub;

  // Check all-dead loss condition
  if (s.crew.every((c) => c.hp <= 0)) {
    return { ...s, meta: goPlay({ t: "end", won: false, reason: "Nobody made it. The road doesn't keep receipts. It just keeps." }) };
  }

  if (sub.t === "between_missions" && sub.socialStep === "outcome") {
    return {
      ...s,
      meta: { t: "play", sub: { t: "between_missions" } },
      socialBeat: undefined,
    };
  }

  if (sub.t === "tank_replacement" && sub.step === "outcome") {
    return {
      ...s,
      meta: { t: "play", sub: { t: "between_missions" } },
      tankReplacementBeat: undefined,
    };
  }

  if (sub.t === "foot") {
    if (sub.step !== "outcome") return s;
    const list = s.footEvents ?? [];
    if (sub.index + 1 < list.length) {
      return { ...s, meta: goPlay({ t: "foot", index: sub.index + 1, step: "narrative" }) };
    }
    // End of foot sequence — stripped debrief or next mission
    const nextIdx = s.missionIndex + 1;
    if (nextIdx >= s.missions.length) {
      let ended = applyCampaignEndDiscoveries({
        ...s,
        footMode: false,
        footEvents: undefined,
        missionIndex: nextIdx,
        rngCounter: s.rngCounter + 1,
        salvagePoints: s.salvagePoints + 5,
        seasonPhase: s.seasonPhase,
      });
      return { ...ended, meta: goPlay(campaignEndSub(ended)) };
    }
    return {
      ...s,
      footMode: false,
      footEvents: undefined,
      missionIndex: nextIdx,
      rngCounter: s.rngCounter + 1,
      salvagePoints: s.salvagePoints + 5,
      tankReplacementBeat: formatTankReplacementEvent({ ...s, missionIndex: nextIdx }),
      narrativeLog: [
        ...s.narrativeLog,
        "Friendly lines at last. Now Division asks an ugly question: what hull do you ride next?",
      ],
      meta: goPlay({ t: "tank_replacement", step: "narrative" }),
      seasonPhase: seasonForMissionIndex(nextIdx, s.missions.length),
    };
  }

  if (sub.t === "briefing" && sub.step === "outcome") {
    return { ...s, meta: goPlay({ t: "day_intro", day: 0 }) };
  }

  if (sub.t === "event" && sub.step === "outcome") {
    if (s.tank.healthPct <= 0 && s.footEvents && s.footEvents.length > 0) {
      return { ...s, meta: goPlay({ t: "foot", index: 0, step: "narrative" }) };
    }
    const m = missionAt(s);
    if (!m) return s;
    const day = m.days[sub.day];
    if (!day) return s;
    if (sub.eventIndex + 1 < day.events.length) {
      return {
        ...s,
        meta: goPlay({ t: "event", day: sub.day, eventIndex: sub.eventIndex + 1, step: "narrative" }),
      };
    }
    if (sub.day + 1 < m.days.length) {
      return { ...s, meta: goPlay({ t: "day_intro", day: sub.day + 1 }) };
    }
    const resolved = resolveMissionHiddenObjective(s);
    return {
      ...resolved,
      meta: goPlay({ t: "debrief", picksRemaining: DIFFICULTY_PROFILE[s.difficulty].debriefPicks }),
    };
  }

  return s;
}

function applyAttritionAndTriggers(s: GameState): GameState {
  const afterAttrition = attritionTick(s);
  return applyConstitutionTriggers(afterAttrition);
}

// ─── debrief actions ─────────────────────────────────────────────────────────

function applyDebrief(state: GameState, act: DebriefAction): GameState {
  if (state.meta.t !== "play" || state.meta.sub.t !== "debrief") return state;
  const picks = state.meta.sub.picksRemaining;
  if (picks <= 0) return state;
  let s = state;
  let rng = s.rngCounter;
  const log: string[] = [];

  const pay = (effects: Effect[]) => {
    const r = applyEffects(s, rng, effects);
    s = r.state;
    rng = r.rngCounter;
    log.push(...r.logLines);
    for (const eff of effects) {
      if (eff.op === "spend_salvage") {
        s = {
          ...s,
          missionTrackers: { ...s.missionTrackers, salvageSpentThisDebrief: true },
        };
      }
    }
  };

  switch (act) {
    case "resupply":
      s = {
        ...s,
        resources: {
          ...s.resources,
          foodDays: Math.min(s.resources.foodDays + 3, 10),
          waterCanteens: Math.min(s.resources.waterCanteens + 3, 10),
          // Reduced free top-up so salvage ammo bundles stay relevant.
          ammoAP: Math.min(s.resources.ammoAP + 2, 24),
          ammoHE: Math.min(s.resources.ammoHE + 3, 30),
          ammoWP: Math.min(s.resources.ammoWP + 1, 10),
        },
      };
      log.push("Crates split. You take what you can carry.");
      break;
    case "repair": {
      const damaged = Object.entries(s.tank.components).filter(
        ([, v]) => v !== "ok",
      ) as [TankComponent, ComponentStatus][];
      if (damaged[0]) {
        const [comp] = damaged[0];
        s = { ...s, tank: { ...s.tank, components: { ...s.tank.components, [comp]: "ok" } } };
        log.push(`Repaired ${String(comp).replaceAll("_", " ")}.`);
      } else {
        s = { ...s, tank: { ...s.tank, healthPct: Math.min(100, s.tank.healthPct + 20) } };
        log.push("Nothing to repair. Patched hull armor instead (+20% hull).");
      }
      break;
    }
    case "rest":
      pay([{ op: "mod_all_constitution", delta: 20 }]);
      // Also clear minor trauma states during rest
      for (const cm of s.crew) {
        if (cm.hp > 0) {
          const minor: TraumaStateId[] = ["shellshocked", "shaking", "jumpy", "thousand_yard_stare"];
          for (const t of minor) {
            if (cm.traumaStates.includes(t)) {
              const r = applyEffects(s, rng, [{ op: "clear_trauma", role: cm.role, trauma: t }]);
              s = r.state; rng = r.rngCounter;
            }
          }
        }
      }
      break;
    case "replace_crew": {
      const dead = s.crew.find((c) => c.hp <= 0);
      if (dead) {
        const { member, next } = generateReplacement(s.runSeed, rng, dead.role);
        rng = next;
        s = {
          ...s,
          crew: s.crew.map((c) => (c.id === dead.id ? member : c)),
          crewReplaced: true,
          ...(dead.role === "commander" ? { commanderReplaced: true } : {}),
        };
        log.push(`${member.nickname} fills the ${dead.role} seat.`);
      } else log.push("No vacant billet.");
      break;
    }
    case "salvage_spend":
      if (s.salvagePoints >= 3) {
        pay([{ op: "spend_salvage", amount: 3 }, { op: "mod_resource", key: "medkits", delta: 1 }]);
        s = {
          ...s,
          missionTrackers: { ...s.missionTrackers, salvageSpentThisDebrief: true },
        };
      } else log.push("Not enough salvage.");
      break;
    case "salvage_ammo_bundle":
      if (s.salvagePoints >= 3) {
        pay([{ op: "spend_salvage", amount: 3 }]);
        s = {
          ...s,
          missionTrackers: { ...s.missionTrackers, salvageSpentThisDebrief: true },
        };
        s = {
          ...s,
          resources: {
            ...s.resources,
            ammoAP: Math.min(s.resources.ammoAP + 4, 30),
            ammoHE: Math.min(s.resources.ammoHE + 3, 32),
          },
        };
        log.push("Salvage traded for an ammo bundle.");
      } else log.push("Not enough salvage.");
      break;
    case "salvage_wp_round":
      if (s.salvagePoints >= 3) {
        pay([{ op: "spend_salvage", amount: 3 }]);
        s = {
          ...s,
          resources: { ...s.resources, ammoWP: Math.min(s.resources.ammoWP + 2, 12) },
        };
        log.push("Two WP rounds scrounged from a dead column.");
      } else log.push("Not enough salvage.");
      break;
    case "salvage_armor_patch":
      if (s.salvagePoints >= 5) {
        pay([{ op: "spend_salvage", amount: 5 }]);
        s = { ...s, armorMitigationPoints: 12 };
        log.push("Crew welds an armor patch — the next hits hurt less.");
      } else log.push("Not enough salvage.");
      break;
    case "salvage_field_rations":
      if (s.salvagePoints >= 2) {
        pay([{ op: "spend_salvage", amount: 2 }]);
        s = {
          ...s,
          resources: {
            ...s.resources,
            foodDays: Math.min(s.resources.foodDays + 2, 12),
            waterCanteens: Math.min(s.resources.waterCanteens + 2, 12),
          },
        };
        log.push("Field rations bought off a quartermaster's blind eye.");
      } else log.push("Not enough salvage.");
      break;
    case "salvage_intel_brief":
      if (s.salvagePoints >= 4) {
        pay([{ op: "spend_salvage", amount: 4 }]);
        const hint = peekNextMissionIntel(s);
        s = {
          ...s,
          missionIntelHint: hint ?? "Next leg is quiet. Too quiet.",
        };
        log.push(hint ? `Intel: ${hint}` : "Intel brief purchased — details are thin.");
      } else log.push("Not enough salvage.");
      break;
    case "medkit_heal": {
      const wounded = s.crew.filter((c) => c.hp > 0 && c.hp < 80);
      const target = wounded.sort((a, b) => a.hp - b.hp)[0];
      if (target && s.resources.medkits > 0) {
        const after = applyMedkit({ ...s, meta: { t: "play", sub: { t: "debrief", picksRemaining: picks } } }, target.role);
        s = { ...after, meta: s.meta };
        rng = s.rngCounter;
      } else if (s.resources.medkits <= 0) {
        log.push("No medkits.");
      } else {
        log.push("Nobody needs patching.");
      }
      break;
    }
  }

  if (act.startsWith("salvage_")) {
    s = {
      ...s,
      missionTrackers: { ...s.missionTrackers, salvageSpentThisDebrief: true },
    };
  }

  const nextPicks = picks - 1;
  const isFinalPick = nextPicks <= 0;

  let socialBeat: typeof s.socialBeat = s.socialBeat;
  let queueRest = s.socialBeatQueue;
  if (isFinalPick) {
    let beatId: string | undefined = s.socialBeatQueue[0];
    if (beatId) {
      queueRest = s.socialBeatQueue.slice(1);
    } else {
      const idx = drawIntInclusive(s.runSeed, rng++, 0, SOCIAL_BEAT_POOL.length - 1);
      beatId = SOCIAL_BEAT_POOL[idx];
    }
    const beatBase = beatId ? EVENT_CATALOG[beatId] : undefined;
    if (beatBase) {
      const m = s.missions[s.missionIndex];
      const vars = narrativeVars(s.crew, s.tank.name, m?.objective ?? "");
      socialBeat = formatEventStrings(structuredClone(beatBase), vars);
    }
  }

  const hasInteractiveSocial =
    isFinalPick && Boolean(socialBeat && socialBeat.choices.length > 0);
  const meta: MetaPhase = isFinalPick
    ? {
        t: "play",
        sub: hasInteractiveSocial
          ? { t: "between_missions", socialStep: "narrative" }
          : { t: "between_missions" },
      }
    : goPlay({ t: "debrief", picksRemaining: nextPicks });

  let next: GameState = {
    ...s,
    rngCounter: rng,
    narrativeLog: [...s.narrativeLog, ...log],
    meta,
    socialBeat,
    socialBeatQueue: queueRest,
  };
  if (isFinalPick) next = tryMissionCompleteCharmMoment(next);
  return next;
}
