import type { EpilogueOutcome, GameState, NarrativeSlide } from "../engine/types";
import { formatNarrativeSlide, type NarrativeTemplateVars } from "../engine/template";

const EPILOGUE_POOLS: Record<EpilogueOutcome, readonly (readonly NarrativeSlide[])[]> = {
  win_full: [
    [
      {
        sensoryFocus: "sound",
        atmosphere: "Engines idling down — the column finally stops asking for speed.",
        narrative:
          "All five of you. Names that still answer when called.\n\nThe war calls it victory. You call it a list that did not shrink.",
      },
      {
        sensoryFocus: "sight",
        narrative:
          "{tank} rolls into the assembly area with treads intact and crew whole — a combination the road rarely keeps.\n\nWhatever comes next, you came back together. That almost never happens.",
        quote: '{cmd}: "Same crew. Same hull. I will not pretend that was easy."',
      },
    ],
  ],
  win_partial: [
    [
      {
        sensoryFocus: "smell",
        atmosphere: "Burnt powder and rain — victory that still smells like someone missing.",
        narrative:
          "You made it to the end of the roster. Not everyone made it to the end of the road.\n\nThe names that survived remember the ones that did not — quietly, the way soldiers learn to.",
      },
      {
        sensoryFocus: "touch",
        narrative:
          "Field journal entries stack like receipts. {tank} still runs. The crew is thinner than when you started.\n\nYou remember the road. You do not talk about it much. That is how you know it mattered.",
        quote: "Division clerk: \"Campaign complete. Condolence forms are in the second stack.\"",
      },
    ],
  ],
  win_lone: [
    [
      {
        sensoryFocus: "sound",
        atmosphere: "One engine in a parking lot full of silence.",
        narrative:
          "One name left on the roster. The others are in the ground somewhere back there.\n\nThe war calls this a victory. The survivor probably does not.",
      },
      {
        sensoryFocus: "sight",
        narrative:
          "{tank} or another hull — it hardly matters when the crew is one person and a list of ghosts.\n\nThe field journal records it without fanfare. Just the name, the tank, and the date.",
        quote: "Chaplain: \"You made it. That is not the same as being whole.\"",
      },
    ],
  ],
  loss_kia: [
    [
      {
        sensoryFocus: "touch",
        atmosphere: "Cold mud on dog tags — metal that outlasted the crew.",
        narrative:
          "Nobody made it. The road does not keep receipts. It just keeps.\n\n{tank} sits empty or gone. The names stop answering on the net.",
      },
      {
        sensoryFocus: "sound",
        narrative:
          "Static on the radio where five voices used to be. Division moves the grease pencil to another grid.\n\nAnother crew will draw another hull tomorrow. The war does not pause for eulogies.",
        quote: "Battalion: \"Acknowledged. Names forwarded. Next column moves at dawn.\"",
      },
    ],
    [
      {
        sensoryFocus: "sight",
        atmosphere: "Smoke thinning over a trace that keeps going without you.",
        narrative:
          "All crew lost. The campaign ends here — not with a speech, with paperwork someone else will file.\n\nThe Iron Road took what it wanted and did not look back.",
      },
      {
        sensoryFocus: "smell",
        narrative:
          "Burnt oil and wet earth. {tank} is a memory or a wreck. The field journal will list the names if anyone finds the book.\n\nThe road does not reward suffering with sentimentality. It just continues east.",
        quote: "S-2: \"Copy. Crew status: zero. Route remains contested.\"",
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
