import type { NarrativeSlide } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";
import { formatNarrativeSlide, type NarrativeTemplateVars } from "../engine/template";

export type MilestoneBeatKind = "mid" | "final";

const MID_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Wet wool and gun oil — autumn turning into something harder.",
      narrative:
        "Maj. Stafford — voice carrying the weight of a revised order — meets the column at {briefingPlace} where half the missions are already behind you. Half the road still wants a receipt, he says.\n\nThe Siegfried Line shows on his map like a scar. The Ardennes mud is on every boot in the column. {season} does not get kinder from here.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Artillery rolls closer than it used to — not distant thunder, just the next grid arguing. Stafford watches {tank} idle and names the next job: {objective}.\n\n{tank} still runs. The crew still answers. That is not victory yet, he tells {cmd}; it is momentum with casualties — and momentum is all Division buys today.",
      quote: '{cmd}: "Same names so far. We keep it that way if we can."',
    },
  ],
  [
    {
      sensoryFocus: "touch",
      atmosphere: "Cold metal through glove leather — winter finding every seal.",
      narrative:
        "Lt. Graves — pencil nub tapping a damp map — stops {cmd} at {briefingPlace} on this {weekday} in {season}. You have seen summer heat and autumn rain, he says; the calendar stopped pretending to be fair weeks ago.\n\nHalfway is a fiction clerks use, he tells the crew. The real measure is who still answers on {tank} — and what {objective} will cost you next.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Burn marks and tire ruts overlap on every trace east. Graves lets you read the lesson someone else's column wrote in chalk on {tank}'s glacis.\n\nMid-campaign is where green crews become veterans or statistics, he says. Then he names {objective} and walks away before anyone can ask for reassurance.",
      quote: "Graves: \"Boring patrols save lives. Exciting ones spend them.\"",
    },
  ],
];

const FINAL_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "sound",
      atmosphere: "Multiple nets at once — voices finishing each other's sentences.",
      narrative:
        "Col. Whitfield — boots still polished, which means both confidence and desperation — briefs at {briefingPlace} while spring air carries rumors that the war is ending somewhere ahead of you.\n\nHe spreads a map where the Elbe approach shows like a last line someone will declare sacred. He tells {cmd} {objective} may be one of the last lines before someone calls the road done.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Columns move on three horizons — friend, enemy, smoke that will not declare itself. Whitfield watches {tank} staged with the rest and does not soften the words.\n\nHold speed, hold intervals, do not stop for souvenirs, he says. Stopping now costs more than moving — and {cmd} already knows what that arithmetic feels like.",
      quote: '{cmd}: "Last mission on the roster. Then we argue about who goes home first."',
    },
  ],
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Diesel and thaw mud — spring that smells like endings.",
      narrative:
        "Division liaison — clipboard heavier than his sidearm — finds you at {briefingPlace} on this {weekday} morning. The map is mostly arrows now; town names on the paper are towns that stopped being towns.\n\nFinal push means spend what you kept for later, he tells {cmd}. He names {objective} and says the war wants one more signature before someone goes home.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "The liaison looks at {tank} and whoever is still breathing on the roster. End of the war is a clerical act, he says; your job is to survive the last mile.\n\nHe does not wish you luck. He checks his watch, marks the map, and expects you to be moving when the hand hits the line.",
      quote: "Division: \"Clear the corridor. Then argue about victory later.\"",
    },
  ],
];

export function milestoneForMission(
  missionIndex: number,
  totalMissions: number,
): MilestoneBeatKind | null {
  if (totalMissions <= 1) return null;
  if (missionIndex === totalMissions - 1) return "final";
  if (totalMissions > 2 && missionIndex === Math.floor(totalMissions / 2)) return "mid";
  return null;
}

function pickVariant(seed: string, slot: number, poolLength: number): number {
  return drawIntInclusive(seed, slot, 0, poolLength - 1);
}

export function resolveMilestonePages(
  beat: MilestoneBeatKind,
  runSeed: string,
  missionIndex: number,
  vars: NarrativeTemplateVars,
): NarrativeSlide[] {
  const pools = beat === "mid" ? MID_POOLS : FINAL_POOLS;
  const slot = missionIndex * 17 + (beat === "mid" ? 3 : 41);
  const variant = pickVariant(runSeed, slot, pools.length);
  const pool = pools[variant] ?? pools[0]!;
  return pool.map((slide) => formatNarrativeSlide(slide, vars));
}
