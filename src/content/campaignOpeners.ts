import type { NarrativeSlide } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";
import { formatNarrativeSlide } from "../engine/template";
import type { NarrativeTemplateVars } from "../engine/template";

/** Seeded campaign opener variants — 2 slides each (Wave 26). */
export const CAMPAIGN_OPENER_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "sound",
      atmosphere: "Replacement depot — diesel, wet canvas, and a net full of static.",
      narrative:
        "The beaches are weeks behind you now. Third Army keeps feeding hulls east and names into empty bunks.\n\nYou drew {tank} and five strangers who still pretend they are not counting each other's habits.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "{weekday}, {dateLabel} — {season} on the ETO calendar. Division has another grid square and another receipt to collect.\n\n{cmd} reads the roster once. The war reads it twice.",
      quote:
        'Battalion XO: "Welcome to the road. {objective} is Mission {missionNum}. Try to come back with the same five names."',
    },
  ],
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Hot oil and cold mud — a staging area that never stays staged.",
      narrative:
        "Someone else's tread marks lead out of the depot. Someone else's crew left their coffee ring on the map table.\n\nYou are the next line on the grease pencil — {tank}, fresh paint, old war.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "Paper orders stack like bandages. {weekday} {dateLabel} — the calendar moves whether you are ready or not.\n\nS-2 taps {placeGrid} and says the column pushes at first light. {cmd} nods like agreement is optional.",
      quote: 'S-2: "{cmd}, your crew. {tank}. {objective}. The road does not care which mission this is for you."',
    },
  ],
  [
    {
      sensoryFocus: "sight",
      atmosphere: "Low sun on a line of hulls — each one a bet someone else already lost.",
      narrative:
        "After D-Day the war became arithmetic: tanks in, names out, miles east. You picked a difficulty and a hull like drawing straws.\n\n{tank} waits with five crew who have not yet learned each other's tells.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Nets crackle with someone else's fight three grids over. {weekday}, {dateLabel} — {season} air and a briefing tent that never quite blocks the wind.\n\nMission {missionNum} of {missionsTotal} starts when you stop pretending this is a training exercise.",
      quote:
        'Division liaison: "ETO {theater}. {objective}. Attrition is the plan — try not to be the subtraction."',
    },
  ],
  [
    {
      sensoryFocus: "touch",
      atmosphere: "Steel still warm from the rail flatbed — {tank} smells new and already tired.",
      narrative:
        "The replacement depot hands you keys to thirty-five tons and a roster printed this morning.\n\nPost-beach Europe is a conveyor belt: crews climb in, the road takes what it wants, Division sends another hull east.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Map board shows arrows through country that still has civilian laundry on the lines. {weekday} {dateLabel} · grid {placeGrid}.\n\n{cmd} checks the crew once. S-2 checks the clock. You check {tank}'s ammo trays because empty is relative on this road.",
      quote:
        'S-2: "{objective}. Mission {missionNum}. {season} weather, {theater} theater — same war, new grid."',
    },
  ],
];

export function pickOpenerVariant(
  seed: string,
  counter: number,
): { variant: number; nextCounter: number } {
  const variant = drawIntInclusive(seed, counter, 0, CAMPAIGN_OPENER_POOLS.length - 1);
  return { variant, nextCounter: counter + 1 };
}

export function resolveCampaignOpenerPages(
  variant: number,
  vars: NarrativeTemplateVars,
): NarrativeSlide[] {
  const pool = CAMPAIGN_OPENER_POOLS[variant % CAMPAIGN_OPENER_POOLS.length] ?? CAMPAIGN_OPENER_POOLS[0]!;
  return pool.map((slide) => formatNarrativeSlide(slide, vars));
}
