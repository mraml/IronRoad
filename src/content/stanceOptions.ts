import type { Effect, EncounterStance, EventChoice, Role, RuntimeEvent } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";

export type { EncounterStance };

export interface StanceOptionTemplate {
  id: string;
  labels: readonly string[];
  role: Role;
  modifierBonus?: number;
  choiceRisk?: EventChoice["choiceRisk"];
  /** Applied on every turn this option is chosen (before tier extras). */
  partialEffects?: Effect[];
  /** Ends encounter immediately — threat resolves as withdraw/success. */
  terminal?: "withdraw" | "success";
}

type StancePool = Record<EncounterStance, readonly StanceOptionTemplate[]>;

const COMBAT_POOL: StancePool = {
  push: [
    {
      id: "engage",
      labels: ["Main gun — engage now.", "Pour HE on the treeline.", "Commit the hull forward."],
      role: "gunner",
      modifierBonus: 1,
      choiceRisk: "aggressive",
      partialEffects: [{ op: "mod_all_constitution", delta: -2 }],
    },
    {
      id: "suppress",
      labels: [
        "Hull MG — suppress and move.",
        "Coax and MG — keep their heads down.",
        "Suppress while the driver shifts.",
      ],
      role: "asst_driver",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
    {
      id: "break",
      labels: [
        "Break contact — smoke and go.",
        "Pull hull back behind cover.",
        "Disengage before they bracket us.",
      ],
      role: "commander",
      modifierBonus: -1,
      choiceRisk: "cautious",
      terminal: "withdraw",
      partialEffects: [{ op: "mod_all_constitution", delta: 3 }],
    },
  ],
  hold: [
    {
      id: "hold_fire",
      labels: [
        "Hold fire — let them show themselves.",
        "Stay hull-down. Wait for the shot.",
        "Patience — one trigger pull.",
      ],
      role: "commander",
      modifierBonus: 0,
      choiceRisk: "cautious",
      partialEffects: [{ op: "mod_all_constitution", delta: 2 }],
    },
    {
      id: "volley",
      labels: [
        "One disciplined volley.",
        "Gunner — single shot, then assess.",
        "Fire on my mark only.",
      ],
      role: "gunner",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
    {
      id: "fallback",
      labels: [
        "Ease back to alternate hull-down.",
        "Driver — reverse under cover.",
        "Fall back one bound — keep the angle.",
      ],
      role: "driver",
      modifierBonus: -1,
      choiceRisk: "cautious",
      terminal: "withdraw",
    },
  ],
  clever: [
    {
      id: "flank",
      labels: [
        "Driver — wide flank through the smoke.",
        "Use the ditch — deny their angle.",
        "Work the dead ground on the left.",
      ],
      role: "driver",
      modifierBonus: 1,
      choiceRisk: "tactical",
    },
    {
      id: "smoke",
      labels: [
        "WP screen — move under cover.",
        "Smoke the lane, then shift.",
        "Loader — WP on the treeline.",
      ],
      role: "loader",
      modifierBonus: 0,
      choiceRisk: "tactical",
      partialEffects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
    },
    {
      id: "break",
      labels: [
        "Break contact clean.",
        "Leave them guessing — pull out.",
        "Disengage while they reload.",
      ],
      role: "commander",
      modifierBonus: -1,
      choiceRisk: "cautious",
      terminal: "withdraw",
    },
  ],
};

const SURVIVAL_POOL: StancePool = {
  push: [
    {
      id: "fight",
      labels: [
        "Fight back — controlled bursts.",
        "Return fire and move.",
        "Make them pay for the contact.",
      ],
      role: "gunner",
      modifierBonus: 0,
      choiceRisk: "aggressive",
      partialEffects: [{ op: "mod_all_constitution", delta: -3 }],
    },
    {
      id: "sprint",
      labels: [
        "Run — cross the open ground fast.",
        "Sprint the gap before they adjust.",
        "Move now while they're reloading.",
      ],
      role: "driver",
      modifierBonus: -1,
      choiceRisk: "desperate",
    },
    {
      id: "scatter",
      labels: [
        "Scatter — every man his own tree.",
        "Break into the treeline.",
        "Fan out — don't give them a cluster.",
      ],
      role: "commander",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
  ],
  hold: [
    {
      id: "hide",
      labels: [
        "Go to ground — don't move.",
        "Freeze in the ditch.",
        "Hold still until the firing stops.",
      ],
      role: "loader",
      modifierBonus: 1,
      choiceRisk: "cautious",
      partialEffects: [{ op: "mod_all_constitution", delta: 4 }],
    },
    {
      id: "crawl",
      labels: [
        "Crawl the drainage — slow and low.",
        "Inch toward the tree line.",
        "Low crawl — no silhouettes.",
      ],
      role: "driver",
      modifierBonus: 0,
      choiceRisk: "cautious",
    },
    {
      id: "wait",
      labels: [
        "Wait for dark or friendly noise.",
        "Hold position — listen first.",
        "Stay put until someone calls friend.",
      ],
      role: "commander",
      modifierBonus: 0,
      choiceRisk: "cautious",
    },
  ],
  clever: [
    {
      id: "trap",
      labels: [
        "Booby the trail behind us.",
        "Wire a grenade on the path.",
        "Leave a surprise for whoever follows.",
      ],
      role: "loader",
      modifierBonus: 1,
      choiceRisk: "tactical",
    },
    {
      id: "sneak",
      labels: [
        "Sneak wide — no metal, no talk.",
        "Circle through the farm wall.",
        "Ghost through the hedgerow.",
      ],
      role: "driver",
      modifierBonus: 1,
      choiceRisk: "tactical",
    },
    {
      id: "feint",
      labels: [
        "Throw something loud the other way.",
        "Feint a run — then drop.",
        "Draw fire left while we slip right.",
      ],
      role: "commander",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
  ],
};

const APPROACH_POOL: StancePool = {
  push: [
    {
      id: "push_through",
      labels: [
        "Push through — no half measures.",
        "Drive the column forward.",
        "Commit — the road won't wait.",
      ],
      role: "driver",
      modifierBonus: 0,
      choiceRisk: "aggressive",
      partialEffects: [{ op: "mod_tank_health", delta: -3 }],
    },
    {
      id: "force",
      labels: [
        "Force the issue — loader on the hatch.",
        "Bull through the bottleneck.",
        "Ram the problem if we have to.",
      ],
      role: "loader",
      modifierBonus: -1,
      choiceRisk: "aggressive",
    },
    {
      id: "press",
      labels: [
        "Press the question — now.",
        "Ask loud if we have to.",
        "Don't leave without an answer.",
      ],
      role: "commander",
      modifierBonus: 0,
      choiceRisk: "aggressive",
      partialEffects: [{ op: "mod_all_constitution", delta: -2 }],
    },
  ],
  hold: [
    {
      id: "wait",
      labels: [
        "Wait it out — patience costs time.",
        "Hold the column — listen.",
        "Sit tight until the picture clears.",
      ],
      role: "commander",
      modifierBonus: 1,
      choiceRisk: "cautious",
      partialEffects: [{ op: "mod_all_constitution", delta: 4 }],
    },
    {
      id: "observe",
      labels: [
        "Observe first — glass out.",
        "Watch the treeline before we move.",
        "Eyes on the road — hands off triggers.",
      ],
      role: "gunner",
      modifierBonus: 0,
      choiceRisk: "cautious",
    },
    {
      id: "alt",
      labels: [
        "Mark an alternate route.",
        "Map says there's another way.",
        "Back up — find parallel ground.",
      ],
      role: "driver",
      modifierBonus: 0,
      choiceRisk: "tactical",
      terminal: "withdraw",
    },
  ],
  clever: [
    {
      id: "wide",
      labels: [
        "Go wide — deny the obvious lane.",
        "Flank the obstacle on the map.",
        "Parallel route through the trees.",
      ],
      role: "driver",
      modifierBonus: 1,
      choiceRisk: "tactical",
    },
    {
      id: "trap",
      labels: [
        "Set a watch — trip flare if needed.",
        "Wire a warning on the approach.",
        "Leave a tell if someone follows.",
      ],
      role: "loader",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
    {
      id: "talk",
      labels: [
        "Talk first — hands visible.",
        "Commander handles the words.",
        "Parley before we spend rounds.",
      ],
      role: "commander",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
  ],
};

const DEFENSIVE_POOL: StancePool = {
  ...COMBAT_POOL,
  hold: [
    {
      id: "hold_line",
      labels: [
        "Hold the line — no premature fire.",
        "Let them come into the kill zone.",
        "Discipline — one shot at a time.",
      ],
      role: "commander",
      modifierBonus: 1,
      choiceRisk: "cautious",
      partialEffects: [{ op: "mod_all_constitution", delta: 1 }],
    },
    {
      id: "volley",
      labels: ["Volley on my command.", "Coordinated fire — then assess.", "All guns — one sweep."],
      role: "gunner",
      modifierBonus: 0,
      choiceRisk: "tactical",
    },
    {
      id: "fallback",
      labels: [
        "Bound back to the next hull-down.",
        "Fall back one position — stay organized.",
        "Withdraw by bounds — not a rout.",
      ],
      role: "driver",
      modifierBonus: -1,
      choiceRisk: "cautious",
      terminal: "withdraw",
    },
  ],
};

function poolForEvent(ev: RuntimeEvent, footMode: boolean): StancePool {
  if (footMode) return SURVIVAL_POOL;
  if (ev.kind === "defensive_stand") return DEFENSIVE_POOL;
  if (
    ev.kind === "tank_combat" ||
    ev.kind === "infantry_combat" ||
    ev.kind === "offensive_assault" ||
    ev.kind === "elite_encounter"
  ) {
    return COMBAT_POOL;
  }
  return APPROACH_POOL;
}

function pickLabel(seed: string, counter: number, labels: readonly string[]): string {
  const idx = drawIntInclusive(seed, counter, 0, labels.length - 1);
  return labels[idx] ?? labels[0] ?? "Commit.";
}

export function stanceChoicesForTurn(args: {
  runSeed: string;
  rngCounter: number;
  event: RuntimeEvent;
  stance: EncounterStance;
  turn: number;
  footMode: boolean;
}): { choices: EventChoice[]; nextCounter: number } {
  const pool = poolForEvent(args.event, args.footMode)[args.stance];
  let counter = args.rngCounter;
  const choices: EventChoice[] = pool.map((template, i) => {
    const label = pickLabel(args.runSeed, counter++, template.labels);
    return {
      id: `stance_${args.stance}_${template.id}_t${args.turn}_${i}`,
      label,
      role: template.role,
      modifierBonus: template.modifierBonus,
      choiceRisk: template.choiceRisk,
      outcomeText: "",
      effects: template.partialEffects ?? [],
      reactionBeat: undefined,
    };
  });
  return { choices, nextCounter: counter };
}

export function templateForChoice(
  ev: RuntimeEvent,
  stance: EncounterStance,
  choiceId: string,
  footMode: boolean,
): StanceOptionTemplate | undefined {
  const pool = poolForEvent(ev, footMode)[stance];
  const match = choiceId.match(/stance_(push|hold|clever)_(\w+)_t/);
  if (!match) return undefined;
  const templateId = match[2];
  return pool.find((t) => t.id === templateId);
}

export const STANCE_PICKER_OPTIONS: {
  id: EncounterStance;
  label: string;
  hint: string;
}[] = [
  { id: "push", label: "Push hard", hint: "Fight through — higher upside, higher cost" },
  { id: "hold", label: "Hold back", hint: "Probe and protect — slower, safer turns" },
  { id: "clever", label: "Work clever", hint: "Sneak, trap, or flank — situational edge" },
];
