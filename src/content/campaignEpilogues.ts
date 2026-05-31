import type { EpilogueOutcome, GameState, NarrativeSlide } from "../engine/types";
import { formatNarrativeSlide, type NarrativeTemplateVars } from "../engine/template";

const EPILOGUE_POOLS: Record<EpilogueOutcome, readonly (readonly NarrativeSlide[])[]> = {
  win_full: [
    [
      {
        sensoryFocus: "sound",
        atmosphere: "Engines idling down — the column finally stops asking for speed.",
        narrative:
          "A division clerk — tea stains on his cuff, forms stacked like cordite — watches {tank} roll into the assembly area with all five names still answering on the net.\n\nThe war calls it victory, he says without looking up. You call it a list that did not shrink — and that almost never happens on this road.",
      },
      {
        sensoryFocus: "sight",
        narrative:
          "The clerk marks the roster and lets you sit in the silence a moment longer than regulations require. Treads intact, crew whole — a combination the road rarely keeps.\n\nWhatever comes next, you came back together. {cmd} does not pretend it was easy; nobody on {tank} does.",
        quote: '{cmd}: "Same crew. Same hull. That is enough for today."',
      },
    ],
  ],
  win_partial: [
    [
      {
        sensoryFocus: "smell",
        atmosphere: "Burnt powder and rain — victory that still smells like someone missing.",
        narrative:
          "Padre Walsh — collar dark with road dust, boots laced evenly — finds the crew at the assembly pens where the roster ends. You made it to the end of the list, he says quietly. Not everyone made it to the end of the road.\n\nThe names that survived remember the ones that did not — the way soldiers learn to, without speeches.",
      },
      {
        sensoryFocus: "touch",
        narrative:
          "Walsh does not offer false comfort. He watches {tank} idle with a crew thinner than when you started and tells {cmd} the field journal will hold what you will not say aloud.\n\nYou remember the road. You do not talk about it much. That is how you know it mattered.",
        quote: 'Walsh: "Campaign complete. Grief is in the second stack — take your time with it."',
      },
    ],
  ],
  win_lone: [
    [
      {
        sensoryFocus: "sound",
        atmosphere: "One engine in a parking lot full of silence.",
        narrative:
          "Chaplain — unhurried posture, tea stains on his cuff — stands beside {tank} where one name is left on the roster. The others are in the ground somewhere back there, he says, and does not dress it up.\n\nThe war calls this a victory. You probably do not — and he does not argue with you about it.",
      },
      {
        sensoryFocus: "sight",
        narrative:
          "The chaplain opens the field journal to one page: the tank, the date, one name. No fanfare, no parade speech — just paper that outlasts the net static where five voices used to be.\n\nYou made it, he says. That is not the same as being whole. He leaves you with that and the engine ticking cool.",
        quote: 'Chaplain: "You made it. That is not the same as being whole."',
      },
    ],
  ],
  loss_kia: [
    [
      {
        sensoryFocus: "touch",
        atmosphere: "Cold mud on dog tags — metal that outlasted the crew.",
        narrative:
          "Battalion S-2 — voice flat on the net where five voices used to answer — copies the names forward without ceremony. Nobody made it. {tank} sits empty or gone.\n\nThe road does not keep receipts, he says to no one in particular. It just keeps east.",
      },
      {
        sensoryFocus: "sound",
        narrative:
          "Static replaces the crew on the radio. Division moves the grease pencil to another grid; another hull will draw another roster tomorrow.\n\nThe war does not pause for eulogies, the S-2 says. Acknowledged. Names forwarded. Next column moves at dawn.",
        quote: 'Battalion: "Acknowledged. Names forwarded. Next column moves at dawn."',
      },
    ],
    [
      {
        sensoryFocus: "sight",
        atmosphere: "Smoke thinning over a trace that keeps going without you.",
        narrative:
          "A division clerk files the campaign close — not with a speech, with paperwork someone else will read later. All crew lost. The Iron Road took what it wanted and did not look back.\n\n{tank} is a memory or a wreck on a trace that still carries traffic east.",
      },
      {
        sensoryFocus: "smell",
        narrative:
          "Burnt oil and wet earth hang over the assembly area where your names will be typed twice and sent up the chain. The field journal will list you if anyone finds the book.\n\nThe road does not reward suffering with sentimentality, the clerk says. It just continues.",
        quote: 'S-2: "Copy. Crew status: zero. Route remains contested."',
      },
    ],
  ],
};

export function resolveEpilogueOutcome(s: GameState): EpilogueOutcome {
  const living = s.crew.filter((c) => c.hp > 0);
  if (living.length === 0) return "loss_kia";
  if (living.length === 5) return "win_full";
  if (living.length === 1) return "win_lone";
  return "win_partial";
}

export function epilogueWon(outcome: EpilogueOutcome): boolean {
  return outcome !== "loss_kia";
}

export function resolveEpiloguePages(
  outcome: EpilogueOutcome,
  vars: NarrativeTemplateVars,
): NarrativeSlide[] {
  const pools = EPILOGUE_POOLS[outcome];
  const pool = pools[0]!;
  return pool.map((slide) => formatNarrativeSlide(slide, vars));
}

/** Short tagline for EndPanel after slides (first slide atmosphere or outcome line). */
export function epilogueTagline(outcome: EpilogueOutcome, vars: NarrativeTemplateVars): string {
  const pages = resolveEpiloguePages(outcome, vars);
  const first = pages[0];
  if (first?.atmosphere) return first.atmosphere;
  const line = first?.narrative.split("\n\n")[0];
  return line ?? (outcome === "loss_kia" ? "Lost." : "End of the road.");
}

export function campaignEpilogueSub(s: GameState): import("../engine/types").PlaySub {
  const outcome = resolveEpilogueOutcome(s);
  return { t: "campaign_epilogue", page: 0, outcome };
}
