import type { AreaEntryBeat, EnvironmentId, SeasonPhase } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";
import { substituteTemplate } from "../engine/template";

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
        "The road runs straight through farmland that still pretends to be peaceful. Tire tracks overlap in the dust.\n\nYou enter {place} with {tank} at the head of the column. {weather} — {light}.",
    },
    {
      placeName: "Farm lane near {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Wind through broken poplars — a dry rattle like bones in a sack.",
      narrative:
        "Stone walls divide fields into boxes the map never drew. Gates hang open on rusted hinges.\n\nYou enter {place} under {weather} — {light}, and clear skies just mean the enemy can see you farther.",
    },
  ],
  scorching_heat: [
    {
      placeName: "Dust track south of {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Heat rises off the glacis — metal you feel through boot soles.",
      narrative:
        "The road shimmer blurs the column ahead into treads and misery. Crew drink water like penance.\n\nAt {place}, {weather} — {temp}. {tank} idles with hatches cracked.",
    },
    {
      placeName: "Dry orchard, grid {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Rotting fruit under dust — sweet decay that turns the stomach.",
      narrative:
        "Trees offer shade that lies about distance. Ground is hard as brick on tracks.\n\nYou roll into {place} at {timeOfDay}. Scorching heat turns patience into a casualty before contact.",
    },
  ],
  dust_storm: [
    {
      placeName: "Blowing trace at {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Grit on lips and in the teeth — dust that finds every seal the tank owns.",
      narrative:
        "Visibility shrinks to the hull ahead and the hand you cannot see at arm's length.\n\nYou creep into {place} by feel, {tank} trusting the driver. {weather} — {light}.",
    },
    {
      placeName: "Dust bowl near {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Brown air that turns {timeOfDay} into a single flat color.",
      narrative:
        "The trace disappears into grit that stings every exposed inch of skin.\n\nAt {place}, the column closes up until {tank} nearly kisses the stern ahead.",
    },
  ],
  heavy_rain: [
    {
      placeName: "Low ground near {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Rain hammering steel — a drumroll that drowns orders unless you shout.",
      narrative:
        "Ditches fill and spill across the trace. The column bunches because spreading out means losing the man ahead.\n\nYou enter {place} through {weather} — {light}. Water finds hatches and maps turn to pulp.",
    },
    {
      placeName: "River approach, {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Wet earth and diesel — mud that smells like a grave opened early.",
      narrative:
        "Banks slide under weight. Engineers swear bridges will hold in voices that don't believe it.\n\nAt {place}, rain turns every halt into a gamble with the clock.",
    },
  ],
  deep_mud: [
    {
      placeName: "Sunken lane, {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Mud sucks at treads with a wet kiss that steals inches every second.",
      narrative:
        "The trace is ruts piled on ruts. Trees lean in as if to watch whether you make it through.\n\nYou crawl into {place}. {weather} — {light} — and deep mud wins by minutes, not bullets.",
    },
    {
      placeName: "Mire near {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Rotting leaves under tread — a sweet stink that clings to boot leather.",
      narrative:
        "Every halt sinks another inch. Winch cables groan before the column moves again.\n\n{place} holds the column longer than the enemy ever could at {timeOfDay}.",
    },
  ],
  thick_fog: [
    {
      placeName: "Fog line at {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Grey so thick the turret disappears from the driver's seat.",
      narrative:
        "Sound carries wrong in fog. A track squeal might be ten meters or a kilometer.\n\nYou enter {place} blind, {tank} creeping on brake levers. {weather} — {light}.",
    },
    {
      placeName: "Hedgerow fold at {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Damp silence that swallows shouted orders after three meters.",
      narrative:
        "The column strings out on a trace nobody trusts. Guides walk beside hulls like shepherds.\n\nAt {place}, fog turns {timeOfDay} into guesswork with live rounds waiting.",
    },
  ],
  light_snow: [
    {
      placeName: "Snow verge, grid {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Fresh snow erases tire marks — a clean page that hides old mines.",
      narrative:
        "Fields look peaceful in white until you remember what peace costs here.\n\nYou enter {place} under {weather} — {light}. Light snow is pretty until the first burst turns it pink.",
    },
    {
      placeName: "Tree line at {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Cold that finds every gap in hatch seals and collar wool.",
      narrative:
        "Pines hold snow in clumps that fall when exhaust hits them. The trace narrows between trunks.\n\n{place} at {timeOfDay} — {temp} — and the crew keeps gloves on inside the turret.",
    },
  ],
  blizzard: [
    {
      placeName: "Whiteout on the {placeGrid} trace",
      sensoryFocus: "touch",
      atmosphere: "Needle ice on skin wherever the hatch opens.",
      narrative:
        "The world shrinks to arm's reach. Compasses lie. The column risks losing itself to weather.\n\nYou push into {place}. {weather} — {light} — and blizzard entry is survival math.",
    },
    {
      placeName: "Frozen halt, grid {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Wind that screams through antenna wire like a bad radio net.",
      narrative:
        "Engines labor. Men share heat in the lee of hulls that offer little shelter.\n\nAt {place}, {timeOfDay} means counting minutes before frostbite becomes the mission.",
    },
  ],
  hard_freeze: [
    {
      placeName: "Frozen halt at {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Metal pings as it contracts — the tank speaking its own cold language.",
      narrative:
        "Engines resist like they remember summer. Fuel gels in lines if you stop too long.\n\nYou hold at {place}. {weather} — {temp} — and every start is a dice roll with the day.",
    },
    {
      placeName: "Ice-bound trace near {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Breath freezes on the hatch rim before it can fall.",
      narrative:
        "Tracks crackle on frozen ground that looks solid until weight proves otherwise.\n\n{place} at {timeOfDay} — the column waits on {cmd}'s call to move or freeze in place.",
    },
  ],
  ice: [
    {
      placeName: "Iced slope near {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Glass-smooth ruts under tread — traction that exists only in memory.",
      narrative:
        "The road gleams like a trap laid on purpose. One degree of slope becomes a slide.\n\nYou descend into {place}. {weather} — {light}. Ice punishes hurry.",
    },
    {
      placeName: "Switchback ice at {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Sun on ice throws glare into every periscope until eyes water.",
      narrative:
        "The driver curses softly on every turn. Infantry walks ahead marking the lane with chalk.\n\n{tank} climbs {place} at {timeOfDay} like a drunk on skates.",
    },
  ],
  thaw_mud: [
    {
      placeName: "Thaw line at {placeGrid}",
      sensoryFocus: "smell",
      atmosphere: "Rot and diesel mixing as ice gives up the dead ground underneath.",
      narrative:
        "What was frozen hard yesterday is soup today. Tracks cut trenches that fill with brown water.\n\nYou enter {place} through {weather}. Thaw is the ground arguing with spring — and spring cheats.",
    },
    {
      placeName: "Soft verge near {placeGrid}",
      sensoryFocus: "touch",
      atmosphere: "Ground that gives underfoot like a sponge full of yesterday's snow.",
      narrative:
        "Every halt leaves a trench that fills before the column clears it.\n\nAt {place}, {light} and {temp} turn {timeOfDay} into a race against sinking treads.",
    },
  ],
  overcast: [
    {
      placeName: "Grey trace at {placeGrid}",
      sensoryFocus: "sight",
      atmosphere: "Flat light that kills depth — every ditch looks the same distance away.",
      narrative:
        "Overcast country hides nothing and forgives nothing. The column moves in a washed photograph.\n\nYou enter {place} with {tank} leading. {weather} — {light}.",
    },
    {
      placeName: "Low ridge at {placeGrid}",
      sensoryFocus: "sound",
      atmosphere: "Distant artillery rolls under cloud cover like weather you cannot outrun.",
      narrative:
        "The trace climbs a fold that offers no cover story. Smoke from cook fires hangs low.\n\n{place} at {timeOfDay} — {crowd} — and the sector feels watched.",
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

/** Merge env atmosphere with day location vars for area-entry slide (Wave 32). */
export function buildAreaEntryBeat(
  envTemplate: AreaEntryTemplate,
  vars: Record<string, string>,
): AreaEntryBeat {
  return {
    placeName: vars.placeName ?? substituteTemplate(envTemplate.placeName, vars),
    atmosphere: substituteTemplate(envTemplate.atmosphere, vars),
    narrative: substituteTemplate(envTemplate.narrative, vars),
    sensoryFocus: envTemplate.sensoryFocus,
  };
}
