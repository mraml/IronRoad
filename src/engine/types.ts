import type { CrewRank } from "../content/ranks";

export const SAVE_VERSION = 1 as const;

export type Difficulty = "green" | "veteran" | "fury";

export type Role =
  | "commander"
  | "gunner"
  | "driver"
  | "asst_driver"
  | "loader";

export type EventKind =
  | "travel"
  | "tank_combat"
  | "infantry_combat"
  | "defensive_stand"
  | "offensive_assault"
  | "supply"
  | "human_moment"
  | "historical_anchor"
  | "elite_encounter"
  | "rest"
  | "briefing"
  | "debrief"
  | "npc_conversation";

export type TankComponent =
  | "engine"
  | "track_left"
  | "track_right"
  | "main_gun"
  | "hull_mg"
  | "radio"
  | "optics"
  | "hatch"
  | "armor_front";

export type ComponentStatus = "ok" | "damaged" | "broken";

export type TraumaStateId =
  | "shellshocked"
  | "frozen"
  | "jumpy"
  | "thousand_yard_stare"
  | "shaking"
  | "grief_struck"
  | "rage"
  | "checked_out"
  | "numb"
  | "breaking";

export type AmmoType = "AP" | "HE" | "WP" | "HEAT";

export type EnvironmentId =
  | "clear"
  | "scorching_heat"
  | "dust_storm"
  | "heavy_rain"
  | "deep_mud"
  | "thick_fog"
  | "light_snow"
  | "blizzard"
  | "hard_freeze"
  | "ice"
  | "thaw_mud"
  | "overcast";

export type SeasonPhase = "summer" | "autumn" | "winter" | "spring";

export interface CrewMember {
  id: string;
  role: Role;
  /** Enlisted or junior officer rank — tank-crew appropriate (cosmetic v1). */
  rank: CrewRank;
  firstName: string;
  lastName: string;
  nickname: string;
  archetypeId: string;
  hp: number;
  constitution: number;
  traumaStates: TraumaStateId[];
  scars: CrewScar[];
  charmId?: string;
  /** When a crewmate died, another may double a role */
  coveringRole?: Role;
  /** Charm used this mission */
  charmUsedThisMission?: boolean;
  /** Once-per-mission role ability used (§16.2) */
  roleAbilityUsed?: boolean;
}

export interface TankState {
  name: string;
  healthPct: number;
  components: Record<TankComponent, ComponentStatus>;
}

export interface Resources {
  ammoAP: number;
  ammoHE: number;
  ammoWP: number;
  ammoHEAT: number;
  smallArmsMags: number;
  medkits: number;
  foodDays: number;
  waterCanteens: number;
}

export type Effect =
  | { op: "mod_hp"; role: Role; delta: number }
  | { op: "mod_constitution"; role: Role; delta: number }
  | { op: "mod_all_constitution"; delta: number }
  | { op: "add_trauma"; role: Role; trauma: TraumaStateId }
  | { op: "clear_trauma"; role: Role; trauma: TraumaStateId }
  | { op: "mod_tank_health"; delta: number }
  | { op: "set_component"; component: TankComponent; status: ComponentStatus }
  | { op: "damage_random_component" }
  | { op: "spend_ammo"; ammo: AmmoType; amount: number }
  | { op: "mod_resource"; key: "medkits" | "foodDays" | "waterCanteens" | "smallArmsMags"; delta: number }
  | { op: "add_salvage"; amount: number }
  | { op: "spend_salvage"; amount: number }
  | { op: "seed_flag"; flag: string }
  | { op: "grant_charm"; role: Role; charmId: string }
  | { op: "add_scar"; role: Role; text: string; rolePenalty?: number; scarCategory?: "shrapnel" | "hearing" | "vision" | "burn" | "crush" }
  | { op: "journal"; text: string; kind?: FieldJournalEntry["kind"] }
  | { op: "discovery_stub"; id: string };

export interface CrewScar {
  text: string;
  rolePenalty?: number;
}

export interface EventChoice {
  id: string;
  label: string;
  role?: Role;
  /** Added to dice total before tiering */
  modifierBonus?: number;
  outcomeText: string;
  effects: Effect[];
  /** What the crew member says when choosing this option — shown as dialogue before the outcome. */
  dialogueLine?: string;
  /** NPC responds after the outcome — creates back-and-forth. Italicized, below outcomeText. */
  npcReply?: string;
  /** True = no dice, no engine effects, purely narrative — for flavour dialogue choices. */
  flavorOnly?: boolean;
  /** Risk band for table-talk / UI (aggressive = high upside, high downside). */
  choiceRisk?: "aggressive" | "tactical" | "cautious" | "desperate";
  /** Short tradeoff summary shown on the choice button. */
  choiceHint?: string;
}

export type StakesLevel = "routine" | "elevated" | "critical";

export type TierFlavorMap = Partial<Record<1 | 2 | 3 | 4, string>>;

/** Metadata on the opposing force in a combat event. */
export interface EnemyMeta {
  /** Suggested optimal ammo type to defeat the enemy. */
  idealAmmo?: AmmoType;
  /** Difficulty modifier applied to dice in this combat. */
  combatMod?: number;
  /** Flavor label for the enemy (e.g. "Tiger I", "dug-in infantry"). */
  label?: string;
}

export interface RuntimeEvent {
  id: string;
  kind: EventKind;
  narrative: string;
  quote?: string;
  postQuote?: string;
  choices: EventChoice[];
  /** If true, outcome tier adjusts narrative severity (optional flavor) */
  useDice?: boolean;
  /** Combat encounter metadata — drives ammo-type bonuses and enemy modifiers. */
  enemy?: EnemyMeta;
  /** 1–2 sentence environmental/sensory line — italicized, renders before narrative. */
  atmosphere?: string;
  /** NPC speaks before the player chooses. Renders as a speech block after narrative/quote. */
  preChoiceNpc?: { speaker: string; line: string };
  /** Encounter stakes — drives UI emphasis. */
  stakes?: StakesLevel;
  /** One-line telegraph before choices (hull, crew, ammo risk). */
  stakesNote?: string;
  /** Extra prose appended to outcome by dice tier when useDice is true. */
  tierFlavor?: TierFlavorMap;
}

export interface MissionDayPlan {
  environment: EnvironmentId;
  events: RuntimeEvent[];
}

export interface ActiveMission {
  title: string;
  objective: string;
  briefing: string;
  /** Interactive briefing beat (cloned from catalog + templated). */
  briefingEvent: RuntimeEvent;
  days: MissionDayPlan[];
}

export type PlaySub =
  | { t: "briefing"; step: "narrative" | "choose" | "outcome" }
  | { t: "day_intro"; day: number }
  | { t: "event"; day: number; eventIndex: number; step: "narrative" | "choose" | "outcome" }
  | { t: "debrief"; picksRemaining: number }
  /** `socialStep` set when a social beat has interactive choices. */
  | { t: "between_missions"; socialStep?: "narrative" | "choose" | "outcome" }
  /** After on-foot survival — pick how the crew gets a hull again (§8.3). */
  | { t: "tank_replacement"; step: "narrative" | "choose" | "outcome" }
  | { t: "foot"; index: number; step: "narrative" | "choose" | "outcome" }
  | { t: "end"; won: boolean; reason: string };

/** Three tank types the player can choose at campaign start (§1003). */
export type TankType = "sherman" | "churchill" | "t34";

export interface TankTypeProfile {
  id: TankType;
  label: string;
  description: string;
  /** Starting hull health percentage */
  startHealthPct: number;
  /** Component durability bonus — mitigates random component hits when positive */
  componentBonus: number;
  /** Starting ammo loadout deltas from base */
  startAmmoBonus: { AP?: number; HE?: number; HEAT?: number; WP?: number };
  /** Short HUD label for in-mission display */
  passiveLabel: string;
}

export type MetaPhase =
  | { t: "title" }
  | { t: "content_warning" }
  | { t: "pick_difficulty" }
  | { t: "pick_tank" }
  | { t: "crew_reveal" }
  | { t: "play"; sub: PlaySub };

export interface DiceBreakdown {
  roll: number;
  modifiers: { label: string; value: number }[];
  total: number;
  tier: 1 | 2 | 3 | 4;
  tierLabel: string;
}

export interface PendingOutcome {
  choice: EventChoice;
  dice?: DiceBreakdown;
  displayText: string;
  /** Crew HP snapshot before choice effects — used for charm moment death detection. */
  preCrewHp?: { id: string; hp: number }[];
}

export interface FieldJournalEntry {
  id: string;
  at: number;
  text: string;
  kind: "moment" | "crew" | "tank" | "discovery";
}

/**
 * Co-op scaffold (§16) — foundation only, no UI or networking.
 * A seat maps a player id to the role they are assigned.
 * When `seats` is populated, `applyChoice` will no-op if the acting role's
 * seat doesn't match the current player.
 */
export interface CoopSeat {
  playerId: string;
  assignedRole: Role;
}

export interface GameState {
  version: typeof SAVE_VERSION;
  runSeed: string;
  /** Tank type chosen at campaign start. */
  tankType: TankType;
  /**
   * Optional co-op seats. Empty/absent = solo mode.
   * Each entry assigns a player to a crew role.
   */
  seats?: CoopSeat[];
  /** The player id for the local client in co-op. Ignored in solo. */
  localPlayerId?: string;
  /** Monotonic draw counter for deterministic RNG (FNV-based draws). */
  rngCounter: number;
  difficulty: Difficulty;
  contentWarningAccepted: boolean;
  meta: MetaPhase;
  missionIndex: number;
  seasonPhase: SeasonPhase;
  crew: CrewMember[];
  tank: TankState;
  resources: Resources;
  salvagePoints: number;
  seededFlags: string[];
  missions: ActiveMission[];
  pendingOutcome?: PendingOutcome;
  narrativeLog: string[];
  fieldJournal: FieldJournalEntry[];
  /** True after catastrophic loss — simplified on-foot track */
  footMode: boolean;
  /** Runtime foot beat sequence (set when tank is lost). */
  footEvents?: RuntimeEvent[];
  /** Roles that have already used the crew-support action this event. */
  supportUsedThisEvent: Role[];
  /** How many consecutive events each crew member has been below constitution 20 (for Numb trigger). */
  lowConstitutionStreak: Partial<Record<Role, number>>;
  /** Social beat displayed at the between-missions screen. */
  socialBeat?: RuntimeEvent;
  /** Tank replacement fork (§8.3) — set when entering `tank_replacement` from on-foot recovery. */
  tankReplacementBeat?: RuntimeEvent;
  /** Intel from salvage spend — shown on next mission day intro. */
  missionIntelHint?: string;
  /** Previous meta preserved when going to title so "Continue" can restore it. */
  resumeMeta?: MetaPhase;
  /** +1 to next combat d10 when crew follows loader ammo recommendation (§4.2). Cleared after that roll. */
  loaderAmmoDoctrineBonus?: number;
  /** First hull hit after patch absorbs extra damage (mitigation points). §10.3 armor patch. */
  armorMitigationPoints?: number;
  /** Driver Terrain Read result — shown as a one-line preview before choices render. Cleared after narrative step. */
  terrainPreviewHint?: string;
  /** Asst. Driver Suppressing Fire active — prevents AT damage in current infantry event outcome. Cleared after outcome. */
  atSuppressed?: boolean;
}

export type DebriefAction =
  | "resupply"
  | "repair"
  | "rest"
  | "replace_crew"
  | "salvage_spend"
  | "medkit_heal"
  /** Salvage-priced upgrades (§10.3). */
  | "salvage_ammo_bundle"
  | "salvage_wp_round"
  | "salvage_armor_patch"
  | "salvage_field_rations"
  | "salvage_intel_brief";

export type GameAction =
  | { type: "ACCEPT_CONTENT_WARNING" }
  | { type: "START_CAMPAIGN"; difficulty: Difficulty; seed?: string }
  | { type: "PICK_TANK"; tankType: TankType }
  /**
   * Co-op: assign a player to a role. No-op in solo (no seats).
   * Also sets `localPlayerId` if this is the first assignment from this client.
   */
  | { type: "ASSIGN_ROLE"; playerId: string; role: Role }
  | { type: "CONTINUE_AFTER_CREW" }
  | { type: "DAY_INTRO_CONTINUE" }
  | { type: "EVENT_CONTINUE" }
  | { type: "CHOOSE_OPTION"; choiceId: string }
  /** Before resolving a combat choice with dice, follow loader ideal-ammo doctrine (+1 next roll). */
  | { type: "SET_LOADER_AMMO_DOCTRINE"; useRecommended: boolean }
  | { type: "CREW_SUPPORT"; supporter: Role; target: Role }
  | { type: "USE_MEDKIT"; target: Role }
  | { type: "USE_CHARM"; role: Role }
  /**
   * §16.2 — Driver: preview terrain element of next travel event.
   * §16.2 — Asst. Driver: suppress AT threat for current infantry event.
   */
  | { type: "USE_ROLE_ABILITY"; role: "driver" | "asst_driver" }
  | { type: "OUTCOME_CONTINUE" }
  | { type: "DEBRIEF_ACTION"; action: DebriefAction }
  | { type: "BETWEEN_MISSIONS_CONTINUE" }
  | { type: "ABANDON_TO_TITLE" }
  | { type: "BEGIN_NEW_RUN" }
  | { type: "LOAD_STATE"; state: GameState };
