import type { AreaEntryBeat, EnvironmentId, SeasonPhase } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";

interface AreaEntryTemplate {
  placeName: string;
  atmosphere: string;
  narrative: string;
  sensoryFocus: AreaEntryBeat["sensoryFocus"];
}

/** Area-entry prose — two short paragraphs per beat (Wave 22). */
const AREA_POOLS: Record<EnvironmentId, readonly AreaEntryTemplate[]> = {
  clear: [
    {
      placeName: "Open crossroads at {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Sun on bare fields — every hedge throws a shadow long enough to hide a gun.",
      narrative:
        "The road runs straight through farmland that still pretends to be peaceful. Tire tracks overlap in the dust.\n\nYou enter with {tank} at the head of a column that smells like fuel and impatience.",
    },
    {
      placeName: "Farm lane near {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Wind through broken poplars — a dry rattle like bones in a sack.",
      narrative:
        "Stone walls divide fields into boxes the map never drew. Gates hang open on rusted hinges.\n\nClear skies just mean the enemy can see you farther.",
    },
  ],
  scorching_heat: [
    {
      placeName: "Dust track south of {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Heat rises off the glacis — metal you feel through boot soles.",
      narrative:
        "The road shimmer blurs the column ahead into treads and misery. Crew drink water like penance.\n\nEvery halt is a furnace. {tank} idles with hatches cracked.",
    },
    {
      placeName: "Dry orchard, grid {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Rotting fruit under dust — sweet decay that turns the stomach.",
      narrative:
        "Trees offer shade that lies about distance. Ground is hard as brick on tracks.\n\nScorching days turn patience into a casualty before contact.",
    },
  ],
  dust_storm: [
    {
      placeName: "Blowing trace at {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Grit on lips and in the teeth — dust that finds every seal the tank owns.",
      narrative:
        "Visibility shrinks to the hull ahead and the hand you cannot see at arm's length.\n\nYou creep in by feel, {tank} trusting the driver.",
    },
  ],
  heavy_rain: [
    {
      placeName: "Low ground near {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Rain hammering steel — a drumroll that drowns orders unless you shout.",
      narrative:
        "Ditches fill and spill across the trace. The column bunches because spreading out means losing the man ahead.\n\nWater finds hatches and maps turn to pulp.",
    },
    {
      placeName: "River approach, {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Wet earth and diesel — mud that smells like a grave opened early.",
      narrative:
        "Banks slide under weight. Engineers swear bridges will hold in voices that don't believe it.\n\nRain turns every halt into a gamble with the clock.",
    },
  ],
  deep_mud: [
    {
      placeName: "Sunken lane, {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Mud sucks at treads with a wet kiss that steals inches every second.",
      narrative:
        "The trace is ruts piled on ruts. Trees lean in as if to watch whether you make it through.\n\nDeep mud wins by minutes, not bullets.",
    },
  ],
  thick_fog: [
    {
      placeName: "Fog line at {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Grey so thick the turret disappears from the driver's seat.",
      narrative:
        "Sound carries wrong in fog. A track squeal might be ten meters or a kilometer.\n\nYou enter blind, {tank} creeping on brake levers and bad instincts.",
    },
  ],
  light_snow: [
    {
      placeName: "Snow verge, grid {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Fresh snow erases tire marks — a clean page that hides old mines.",
      narrative:
        "Fields look peaceful in white until you remember what peace costs here.\n\nLight snow is pretty until the first burst turns it pink.",
    },
  ],
  blizzard: [
    {
      placeName: "Whiteout on the {placeGrid} trace",
      sensoryFocus: "touch",
      atmosphere: "Needle ice on skin wherever the hatch opens.",
      narrative:
        "The world shrinks to arm's reach. Compasses lie. The column risks losing itself to weather.\n\nBlizzard entry is survival math — move, freeze, or vanish.",
    },
  ],
  hard_freeze: [
    {
      placeName: "Frozen halt at {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Metal pings as it contracts — the tank speaking its own cold language.",
      narrative:
        "Engines resist like they remember summer. Fuel gels in lines if you stop too long.\n\nHard freeze turns every start into a dice roll with the day.",
    },
  ],
  ice: [
    {
      placeName: "Iced slope near {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Glass-smooth ruts under tread — traction that exists only in memory.",
      narrative:
        "The road gleams like a trap laid on purpose. One degree of slope becomes a slide.\n\nIce punishes hurry. {tank} moves like a drunk on skates.",
    },
  ],
  thaw_mud: [
    {
      placeName: "Thaw line at {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Rot and diesel mixing as ice gives up the dead ground underneath.",
      narrative:
        "What was frozen hard yesterday is soup today. Tracks cut trenches that fill with brown water.\n\nThaw is the road arguing with spring — and spring cheats.",
    },
  ],
  overcast: [
    {
      placeName: "Grey trace at {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Flat light that kills depth — every ditch looks the same distance away.",
      narrative:
        "Overcast country hides nothing and forgives nothing. The column moves in a washed photograph.\n\nYou enter the sector with {tank} leading a line that could stretch or vanish in the next fold.",
    },
  ],
};

export function seasonProseTag(season: SeasonPhase): string {
  switch (season) {
    case "summer":
      return "late summer";
    case "autumn":
      return "autumn";
    case "winter":
      return "winter";
    case "spring":
      return "spring thaw";
  }
}

/** Deterministic fictional grid reference for mission/area templating. */
export function placeGridLabel(runSeed: string, missionIndex: number, dayIndex: number): string {
  const slot = missionIndex * 31 + dayIndex * 7 + 11;
  return String(drawIntInclusive(runSeed, slot, 210, 599));
}

export function pickAreaEntryTemplate(
  seed: string,
  counter: number,
  environment: EnvironmentId,
): { template: AreaEntryTemplate; nextCounter: number } {
  const pool = AREA_POOLS[environment] ?? AREA_POOLS.clear;
  const idx = drawIntInclusive(seed, counter, 0, pool.length - 1);
  return { template: pool[idx]!, nextCounter: counter + 1 };
}
