import type { NarrativeSlide } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";
import { formatNarrativeSlide, type NarrativeTemplateVars } from "../engine/template";

export type MilestoneBeatKind = "mid" | "final";

export const MID_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Wet wool and gun oil — autumn turning into something harder.",
      narrative:
        "{briefer} — voice carrying the weight of a revised order — meets the column where half the missions are already behind you. Half the road still wants a receipt, he says.\n\nThe Siegfried Line shows on his map like a scar. The Ardennes mud is on every boot in the column. {season} does not get kinder from here.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Artillery rolls closer than it used to — not distant thunder, just the next grid arguing. He watches {tank} idle and names the next job without softening it: {objective}.\n\n{tank} still runs. The crew still answers. That is not victory yet, he tells {cmd}; it is momentum with casualties — and momentum is all Division buys today.",
      quote: '{cmd}: "Same names so far. We keep it that way if we can."',
    },
  ],
  [
    {
      sensoryFocus: "touch",
      atmosphere: "Cold metal through glove leather — winter finding every seal.",
      narrative:
        "{briefer} stops {cmd} at the trace on this {weekday} in {season}. You have seen summer heat and autumn rain, he says; the calendar stopped pretending to be fair weeks ago.\n\nHalfway is a fiction clerks use. The real measure is who still answers on {tank} — and what {objective} will cost you next.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Burn marks and tire ruts overlap on every trace east. He lets you read the lesson someone else's column wrote in chalk on {tank}'s glacis.\n\nMid-campaign is where green crews become veterans or statistics, he says. Then he names {objective} and walks away before anyone can ask for reassurance.",
      quote: '{cmd}: "Boring patrols save lives. Exciting ones spend them."',
    },
  ],
];

export const FINAL_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "sound",
      atmosphere: "Multiple nets at once — voices finishing each other's sentences.",
      narrative:
        "{briefer} — boots still polished, which means both confidence and desperation — finds {cmd} while spring air carries rumors that the war is ending somewhere ahead of you.\n\nHe does not read orders again. He asks who on {tank} still has a photograph folded small enough to survive a brew-up.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "The crew checks each other the way men do when they stop pretending the roster is permanent. Someone laughs too loud at a joke that is not funny.\n\n{briefer} watches {tank} staged with the rest and says only this: make the last miles count for the names still breathing.",
      quote: '{cmd}: "We know the job. We\'ll do it like we mean to come home."',
    },
  ],
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Diesel and thaw mud — spring that smells like endings.",
      narrative:
        "Division liaison — clipboard heavier than his sidearm — finds you on this {weekday} morning. The map is mostly arrows now; the ink has outlasted half the towns it names.\n\nHe tells {cmd} the column has spent everything it hoarded for later. One more push, he says, and someone gets to argue about victory in a bar instead of a tent.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "The liaison looks at {tank} and whoever is still breathing on the roster. End of the war is a clerical act, he says; your job is to survive the last mile.\n\nHe does not wish you luck. He checks his watch and expects you to be moving when the hand hits the line.",
      quote: 'Division: "Clear the corridor. Then argue about victory later."',
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
