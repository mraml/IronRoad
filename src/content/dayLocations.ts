import type { EnvironmentId, MissionBriefArchetype, SeasonPhase } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";
import { placeGridLabel } from "./areaEntries";

export type LocationKind =
  | "town_center"
  | "village"
  | "farm"
  | "factory"
  | "camp"
  | "friendly_base"
  | "enemy_line"
  | "river_crossing"
  | "valley"
  | "county_road"
  | "hill_switchbacks"
  | "rolling_plains"
  | "district"
  | "region_sector";

export type CrowdFeel = "busy" | "lonely" | "tense" | "abandoned";

export interface DayLocationTemplate {
  placeName: string;
  place: string;
  approach: string;
  crowd: CrowdFeel;
}

export interface DayLocationPick {
  kind: LocationKind;
  template: DayLocationTemplate;
  placeGrid: string;
}

const CROWD_PROSE: Record<CrowdFeel, string> = {
  busy: "streets still carry civilian hurry between shuttered shops",
  lonely: "nothing moves except wind through broken wire",
  tense: "every window feels like it might hold a muzzle flash",
  abandoned: "doors hang open on houses that stopped pretending anyone lives here",
};

export function crowdProse(crowd: CrowdFeel): string {
  return CROWD_PROSE[crowd];
}

const LOCATION_POOLS: Record<LocationKind, readonly DayLocationTemplate[]> = {
  town_center: [
    {
      placeName: "Market square near {placeGrid}",
      place: "the market square",
      approach:
        "You roll into the town center. An officer waits at the crossroads with fresh orders clipped to a board.",
      crowd: "tense",
    },
    {
      placeName: "Town hall district, grid {placeGrid}",
      place: "the town hall district",
      approach:
        "You approach the civic square through rubble that still smells like yesterday's bread. Staff cars idle under broken eaves.",
      crowd: "busy",
    },
  ],
  village: [
    {
      placeName: "Village edge at {placeGrid}",
      place: "the village edge",
      approach:
        "You enter at the village limit where a stone cross still marks the road. A runner points you toward the church steeple.",
      crowd: "lonely",
    },
    {
      placeName: "Hamlet near {placeGrid}",
      place: "the hamlet",
      approach:
        "You creep into a hamlet that maps call a dot. Chickens scatter from tread noise; a farmer watches from a barn door.",
      crowd: "abandoned",
    },
  ],
  farm: [
    {
      placeName: "Farm lane, grid {placeGrid}",
      place: "the farm lane",
      approach:
        "You turn onto a farm lane between stone walls. A hay wagon blocks half the trace until infantry shoves it aside.",
      crowd: "lonely",
    },
    {
      placeName: "Orchard tract near {placeGrid}",
      place: "the orchard tract",
      approach:
        "You pass through an orchard where trees throw shade on parked supply trucks. A quartermaster waves you toward the next gate.",
      crowd: "tense",
    },
  ],
  factory: [
    {
      placeName: "Factory yard at {placeGrid}",
      place: "the factory yard",
      approach:
        "You enter a factory yard where chimneys stand broken but the floor still holds weight. A foreman points at a side gate.",
      crowd: "abandoned",
    },
    {
      placeName: "Mill complex, {placeGrid}",
      place: "the mill complex",
      approach:
        "You approach a mill complex requisitioned as a supply dump. Crates stack under tarps that flap like wounded birds.",
      crowd: "busy",
    },
  ],
  camp: [
    {
      placeName: "Bivouac trace at {placeGrid}",
      place: "the bivouac trace",
      approach:
        "You pull into a bivouac where cook smoke marks the only friendly geometry for miles. A sergeant reads names off a clipboard.",
      crowd: "busy",
    },
    {
      placeName: "Forward camp, grid {placeGrid}",
      place: "the forward camp",
      approach:
        "You reach a forward camp dug into a hedgerow line. Tents hug the ground like they expect artillery.",
      crowd: "tense",
    },
  ],
  friendly_base: [
    {
      placeName: "Friendly CP at {placeGrid}",
      place: "the friendly CP",
      approach:
        "You approach a friendly command post where sandbags frame a map board. An officer meets you with grease pencil still on his fingers.",
      crowd: "busy",
    },
    {
      placeName: "Battalion assembly near {placeGrid}",
      place: "the battalion assembly area",
      approach:
        "You enter the battalion assembly area. Tank parks sit in rows while mechanics swear at frozen link pins.",
      crowd: "tense",
    },
  ],
  enemy_line: [
    {
      placeName: "Enemy line sector {placeGrid}",
      place: "the enemy line",
      approach:
        "You roll toward the enemy line where shell craters stitch the fields. Forward observers crouch in a ditch with radios hot.",
      crowd: "tense",
    },
    {
      placeName: "Breach lane at {placeGrid}",
      place: "the breach lane",
      approach:
        "You enter a breach lane cleared by engineers who look like they aged overnight. Wire curls in the tread marks ahead.",
      crowd: "abandoned",
    },
  ],
  river_crossing: [
    {
      placeName: "River crossing at {placeGrid}",
      place: "the river crossing",
      approach:
        "You approach the river crossing where engineers argue with current and clock. Boats and treads share a bank that keeps sliding.",
      crowd: "busy",
    },
    {
      placeName: "Bridge approach, grid {placeGrid}",
      place: "the bridge approach",
      approach:
        "You reach a bridge approach under smoke from burning timbers. A traffic controller waves two fingers — hold, then go.",
      crowd: "tense",
    },
  ],
  valley: [
    {
      placeName: "Valley floor near {placeGrid}",
      place: "the valley floor",
      approach:
        "You descend into a valley where sound carries wrong and ridges hide everything. The column bunches despite orders to spread.",
      crowd: "lonely",
    },
    {
      placeName: "Fold in the land at {placeGrid}",
      place: "the fold in the land",
      approach:
        "You enter a fold in the land where fog pools even on clear days. Infantry scouts mark tree lines with chalk.",
      crowd: "tense",
    },
  ],
  county_road: [
    {
      placeName: "County road at {placeGrid}",
      place: "the county road",
      approach:
        "You take a county road that maps call secondary and mud calls primary. Mile markers lean like drunk sentries.",
      crowd: "lonely",
    },
    {
      placeName: "Paved trace near {placeGrid}",
      place: "the paved trace",
      approach:
        "You roll onto a paved trace rare enough to feel suspicious. Civilian cars sit abandoned in ditches.",
      crowd: "abandoned",
    },
  ],
  hill_switchbacks: [
    {
      placeName: "Hill switchbacks at {placeGrid}",
      place: "the hill switchbacks",
      approach:
        "You climb hill switchbacks where each turn exposes your flank to the ridgeline. A guide on foot jogs ahead waving you on.",
      crowd: "lonely",
    },
    {
      placeName: "Ridge road, grid {placeGrid}",
      place: "the ridge road",
      approach:
        "You approach a ridge road cut into chalk that crumbles under weight. Dust plumes mark every halt for observers.",
      crowd: "tense",
    },
  ],
  rolling_plains: [
    {
      placeName: "Open plain at {placeGrid}",
      place: "the open plain",
      approach:
        "You enter rolling plains where every hull throws a shadow long enough to draw fire. The horizon offers no cover story.",
      crowd: "lonely",
    },
    {
      placeName: "Wheat stubble near {placeGrid}",
      place: "the wheat stubble",
      approach:
        "You cross wheat stubble burned flat by retreating units. Smoke still threads the ground at ankle height.",
      crowd: "abandoned",
    },
  ],
  district: [
    {
      placeName: "Industrial district at {placeGrid}",
      place: "the industrial district",
      approach:
        "You enter an industrial district where rail sidings and brick walls funnel movement into kill zones. A guide marks a safe lane in chalk.",
      crowd: "tense",
    },
    {
      placeName: "Warehouse row, grid {placeGrid}",
      place: "the warehouse row",
      approach:
        "You approach a warehouse row reeking of diesel and wet coal. Forklift tracks cross tank treads at confused angles.",
      crowd: "busy",
    },
  ],
  region_sector: [
    {
      placeName: "Sector {placeGrid}",
      place: "the sector",
      approach:
        "You enter the sector where grid lines on the map finally meet ground that argues back. A liaison officer waits with updated trace marks.",
      crowd: "tense",
    },
    {
      placeName: "County boundary near {placeGrid}",
      place: "the county boundary",
      approach:
        "You reach a county boundary marked by a stone that nobody respects anymore. MPs wave the column through a checkpoint of sandbags.",
      crowd: "busy",
    },
  ],
};

const ARCHETYPE_WEIGHTS: Record<MissionBriefArchetype, readonly LocationKind[]> = {
  attack: ["enemy_line", "rolling_plains", "town_center", "hill_switchbacks", "river_crossing"],
  defense: ["friendly_base", "hill_switchbacks", "village", "factory", "camp"],
  pursuit: ["county_road", "rolling_plains", "village", "farm", "region_sector"],
  patrol: ["county_road", "village", "valley", "farm", "region_sector"],
  withdrawal: ["river_crossing", "county_road", "camp", "valley", "friendly_base"],
  night_move: ["valley", "county_road", "camp", "village", "region_sector"],
  ammo_hold: ["friendly_base", "factory", "camp", "district", "farm"],
  final_push: ["town_center", "enemy_line", "district", "river_crossing", "rolling_plains"],
  generic: ["region_sector", "county_road", "village", "farm", "valley"],
};

const ENV_BIAS: Partial<Record<EnvironmentId, LocationKind>> = {
  heavy_rain: "river_crossing",
  deep_mud: "county_road",
  thaw_mud: "county_road",
  thick_fog: "valley",
  blizzard: "camp",
  light_snow: "rolling_plains",
  hard_freeze: "camp",
  ice: "hill_switchbacks",
  scorching_heat: "rolling_plains",
  dust_storm: "rolling_plains",
};

function buildCandidatePool(
  archetype: MissionBriefArchetype,
  environment: EnvironmentId,
): LocationKind[] {
  const base = [...ARCHETYPE_WEIGHTS[archetype]];
  const bias = ENV_BIAS[environment];
  if (bias && !base.includes(bias)) base.unshift(bias);
  else if (bias) {
    const idx = base.indexOf(bias);
    if (idx > 0) {
      base.splice(idx, 1);
      base.unshift(bias);
    }
  }
  return base;
}

export function pickDayLocation(
  seed: string,
  counter: number,
  missionIndex: number,
  dayIndex: number,
  archetype: MissionBriefArchetype,
  environment: EnvironmentId,
  _season: SeasonPhase,
): { pick: DayLocationPick; nextCounter: number } {
  const placeGrid = placeGridLabel(seed, missionIndex, dayIndex);
  const candidates = buildCandidatePool(archetype, environment);
  const kindIdx = drawIntInclusive(seed, counter, 0, candidates.length - 1);
  const kind = candidates[kindIdx]!;
  const pool = LOCATION_POOLS[kind];
  const templateIdx = drawIntInclusive(seed, counter + 1, 0, pool.length - 1);
  return {
    pick: {
      kind,
      template: pool[templateIdx]!,
      placeGrid,
    },
    nextCounter: counter + 2,
  };
}
