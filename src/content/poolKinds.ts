/** Kind buckets for GENERIC_POOL — single source of truth for campaign filler draws (§2.9). */

export type PoolKind =
  | "travel"
  | "combat"
  | "infantry"
  | "defensive"
  | "offensive"
  | "supply"
  | "rest"
  | "human"
  | "npc"
  | "elite";

export type PoolKindBuckets = Record<PoolKind, readonly string[]>;

const BASE_BUCKETS: PoolKindBuckets = {
  travel: [
    "gen_travel_fork",
    "gen_travel_mine",
    "gen_travel_bridge_down",
    "gen_travel_fuel_shortage",
    "gen_travel_checkpoint_abandoned",
    "gen_travel_convoy_pass",
    "gen_travel_bogged_soft",
    "gen_travel_crossroads_smoke",
    "gen_travel_rubble_choke",
    "gen_travel_night_halt",
    "gen_cmd_crossing",
    "gen_officer_roadblock",
  ],
  supply: ["gen_supply_risk", "gen_supply_black_market", "gen_loader_shell_stuck"],
  rest: ["gen_rest_coffee", "gen_rest_smoke"],
  human: [
    "gen_human_letters",
    "gen_human_watch",
    "gen_human_photo_wall",
    "gen_human_piano_key",
    "gen_human_wounded_horse",
    "gen_radio_squeal",
    "gen_injury_scar",
  ],
  combat: [
    "gen_combat_tiger_lite",
    "gen_combat_panther",
    "gen_combat_pak",
    "gen_combat_heat_round",
    "gen_combat_mortar",
    "gen_combat_halftrack_belt",
    "gen_combat_88_flash",
  ],
  infantry: [
    "gen_infantry_treeline",
    "gen_infantry_cellar",
    "gen_infantry_sniper_drain",
    "gen_combat_mg_nest",
  ],
  defensive: ["gen_defensive_wave", "gen_defensive_flare", "gen_defensive_counter_battery", "gen_asst_periscope"],
  offensive: ["gen_offensive_push", "gen_offensive_smoke_screen"],
  npc: [
    "npc_local_woman",
    "npc_local_kids",
    "npc_officer_orders",
    "npc_replacement_depot",
    "npc_other_crew",
    "npc_medic_check",
    "npc_war_correspondent",
    "npc_prisoner_moment",
    "npc_padre_field",
    "npc_old_farmer",
    "npc_engineer_bridge",
    "npc_refugee_family",
    "npc_cook_truck",
    "legendary_sergeant_york_moment",
  ],
  elite: [
    "elite_night_ambush_stub",
    "elite_stug_nest",
    "elite_konkurs_column",
    "elite_remagen",
    "elite_tiger_wallendorf",
  ],
};

let mergedBuckets: PoolKindBuckets = { ...BASE_BUCKETS };

/** Register additional ids (Wave 13+) into kind buckets. */
export function registerPoolKindBuckets(extra: Partial<PoolKindBuckets>): void {
  const next = { ...mergedBuckets };
  for (const kind of Object.keys(extra) as PoolKind[]) {
    const add = extra[kind];
    if (!add?.length) continue;
    next[kind] = [...next[kind], ...add];
  }
  mergedBuckets = next;
}

export function getPoolKindBuckets(): PoolKindBuckets {
  return mergedBuckets;
}

const kindById = new Map<string, PoolKind>();

function rebuildKindIndex(): void {
  kindById.clear();
  for (const kind of Object.keys(mergedBuckets) as PoolKind[]) {
    for (const id of mergedBuckets[kind]) {
      kindById.set(id, kind);
    }
  }
}

rebuildKindIndex();

export function rebuildGenericPoolFromBuckets(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const kind of Object.keys(mergedBuckets) as PoolKind[]) {
    for (const id of mergedBuckets[kind]) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function registerPoolKindsAndRebuildPool(extra: Partial<PoolKindBuckets>): string[] {
  registerPoolKindBuckets(extra);
  rebuildKindIndex();
  GENERIC_POOL = rebuildGenericPoolFromBuckets();
  return GENERIC_POOL;
}

export function getPoolKind(id: string): PoolKind | undefined {
  return kindById.get(id) ?? tier2KindById.get(id);
}

export function isTravelOrSupply(id: string): boolean {
  const k = kindById.get(id);
  return k === "travel" || k === "supply";
}

export function isHumanOrNpc(id: string): boolean {
  const k = kindById.get(id);
  return k === "human" || k === "npc";
}

export function isElite(id: string): boolean {
  return kindById.get(id) === "elite";
}

/** Initial pool at module load (Wave 12 size). Call registerPoolKindsAndRebuildPool after Wave 13 register. */
export let GENERIC_POOL: string[] = rebuildGenericPoolFromBuckets();

const EMPTY_BUCKETS: PoolKindBuckets = {
  travel: [],
  combat: [],
  infantry: [],
  defensive: [],
  offensive: [],
  supply: [],
  rest: [],
  human: [],
  npc: [],
  elite: [],
};

let mergedTier2Buckets: PoolKindBuckets = { ...EMPTY_BUCKETS };
const tier2KindById = new Map<string, PoolKind>();
const tier2IdSet = new Set<string>();

function rebuildTier2KindIndex(): void {
  tier2KindById.clear();
  tier2IdSet.clear();
  for (const kind of Object.keys(mergedTier2Buckets) as PoolKind[]) {
    for (const id of mergedTier2Buckets[kind]) {
      tier2KindById.set(id, kind);
      tier2IdSet.add(id);
    }
  }
}

export function rebuildTier2PoolFromBuckets(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const kind of Object.keys(mergedTier2Buckets) as PoolKind[]) {
    for (const id of mergedTier2Buckets[kind]) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Register Tier-2 filler ids (Wave 16+). Must not overlap Tier-1 GENERIC_POOL. */
export function registerTier2PoolKinds(extra: Partial<PoolKindBuckets>): string[] {
  const next = { ...mergedTier2Buckets };
  for (const kind of Object.keys(extra) as PoolKind[]) {
    const add = extra[kind];
    if (!add?.length) continue;
    next[kind] = [...next[kind], ...add];
  }
  mergedTier2Buckets = next;
  rebuildTier2KindIndex();
  GENERIC_POOL_TIER2 = rebuildTier2PoolFromBuckets();
  return GENERIC_POOL_TIER2;
}

export function getTier2PoolKindBuckets(): PoolKindBuckets {
  return mergedTier2Buckets;
}

export function isTier2Filler(id: string): boolean {
  return tier2IdSet.has(id);
}

/** Tier-2 procedural fillers — second campaign pass (§2.9). */
export let GENERIC_POOL_TIER2: string[] = [];
