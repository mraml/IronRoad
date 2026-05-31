import type { NarrativeSlide } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";
import { formatNarrativeSlide } from "../engine/template";
import type { NarrativeTemplateVars } from "../engine/template";

/** Seeded campaign opener variants — NPC-led 2 slides each (Wave 27). */
export const CAMPAIGN_OPENER_POOLS: readonly (readonly NarrativeSlide[])[] = [
  [
    {
      sensoryFocus: "sound",
      atmosphere: "Replacement depot — diesel, wet canvas, and a net full of static.",
      narrative:
        "The beaches are weeks behind you now. A division liaison — voice flat from too many rosters read aloud — finds you at the staging pens where Third Army feeds hulls east and names into empty bunks.\n\nHe tells {cmd} that {tank} and five strangers are yours until the road takes its cut. Nobody pretends the crew already trusts each other; they just climb in anyway.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "The liaison names the first job without ceremony: {objective}. Try to come back with the same five names, he says — then turns back to the net before you can answer.",
      quote: '{cmd}: "Copy. We\'ll learn each other on the road."',
    },
  ],
  [
    {
      sensoryFocus: "smell",
      atmosphere: "Hot oil and cold mud — a staging area that never stays staged.",
      narrative:
        "Someone else's tread marks lead out of the depot. A battalion XO — knuckles black with grease, staff tabs still polished — meets {cmd} beside a map table someone else left coffee rings on.\n\nYou are the next line on the grease pencil, he says: {tank}, fresh paint, old war. The column pushes at first light whether you feel ready or not.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "The XO speaks like a man billing time he cannot afford. {cmd}, your crew, your hull — then the words that matter: {objective}.\n\nThe road does not care which mission this is for you, he says. {cmd} nods like agreement is optional.",
      quote: '{cmd}: "We\'ll be moving when you are."',
    },
  ],
  [
    {
      sensoryFocus: "sight",
      atmosphere: "Low sun on a line of hulls — each one a bet someone else already lost.",
      narrative:
        "After D-Day the war became arithmetic: tanks in, names out, miles east. An S-2 officer — map case lashed with wire, eyes on the road like it might change its mind — briefs new crews the way a clerk briefs debts.\n\n{tank} waits with five men who have not learned each other's tells. He tells {cmd} attrition is the plan and your job is not to be the subtraction.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Nets crackle with someone else's fight three grids over while the S-2 finishes. {season} air in the tent; wind that will not block the truth.\n\nHe names {objective} and tells {cmd} the column moves when the watch says move — not when the crew feels brave.",
      quote: 'S-2: "Same war. New grid. Listen close."',
    },
  ],
  [
    {
      sensoryFocus: "touch",
      atmosphere: "Steel still warm from the rail flatbed — {tank} smells new and already tired.",
      narrative:
        "The replacement depot hands you keys to thirty-five tons and a roster printed this morning. A quartermaster sergeant — manifest spread on a dented hood — reads names like inventory and does not apologize for it.\n\nPost-beach Europe is a conveyor belt, he says. Crews climb in, the road takes what it wants, Division sends another hull east. Yours is {tank}.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "The QM checks the crew once while {cmd} checks ammo trays because empty is relative on this road. The sergeant names {objective} without looking up from his board.\n\nFirst mission on the Iron Road, he says. Same war as yesterday — just a different grid square waiting to collect.",
      quote: "{cmd}: \"Tray's thin. We'll spend it like we mean to come back.\"",
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
  const pool =
    CAMPAIGN_OPENER_POOLS[variant % CAMPAIGN_OPENER_POOLS.length] ?? CAMPAIGN_OPENER_POOLS[0]!;
  return pool.map((slide) => formatNarrativeSlide(slide, vars));
}
