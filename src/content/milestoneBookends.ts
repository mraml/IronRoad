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
        "Half the missions are behind you. Half the road still wants a receipt.\n\nThe Siegfried Line shows on maps like a scar. The Ardennes mud shows on boots like a promise.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Artillery rolls closer than it used to — not distant thunder, just the next grid arguing.\n\n{tank} still runs. The crew still answers. That is not victory yet; it is momentum with casualties.",
      quote: '{cmd}: "Same names so far. Do not get used to it — {season} gets meaner from here."',
    },
  ],
  [
    {
      sensoryFocus: "touch",
      atmosphere: "Cold metal through glove leather — winter finding every seal.",
      narrative:
        "You have seen summer heat and autumn rain. The calendar says {season} now and the road stops pretending to be fair.\n\nMission {missionNum} of {missionsTotal} — halfway is a fiction clerks use.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Burn marks and tire ruts overlap on every trace east. Someone else's column wrote the lesson; you read it in chalk on {tank}'s glacis.\n\n{objective} waits ahead. So do the names you have not lost yet.",
      quote: 'Battalion: "Mid-campaign is where green crews become veterans — or statistics."',
    },
  ],
];

const FINAL_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "sound",
      atmosphere: "Multiple nets at once — voices finishing each other's sentences.",
      narrative:
        "Spring {season} air and rumors that the war is ending somewhere ahead of you.\n\nMission {missionNum} of {missionsTotal}. The Elbe approach shows on the map like a last line someone will declare sacred.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Columns move on three horizons — friend, enemy, smoke that will not declare itself.\n\n{objective} may be one of the last lines before someone calls the road done. {tank} rolls because stopping now costs more than moving.",
      quote: '{cmd}: "Last mission on the roster. Then we argue about who goes home first."',
    },
  ],
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Diesel and thaw mud — spring that smells like endings.",
      narrative:
        "The map is mostly arrows now. Town names on paper are towns that stopped being towns.\n\nFinal push means spend what you kept for later. You are {missionsTotal} missions in and the war wants one more signature.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "{weekday}, {dateLabel} — grid {placeGrid}. Battalion CP feels temporary even when the tent is permanent.\n\n{objective}. {tank} and whoever is still breathing on the roster. Someone will declare victory soon. It might not feel like it.",
      quote: 'Division: "End of the war is a clerical act. Your job is to survive the last mile."',
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
