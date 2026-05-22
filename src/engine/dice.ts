import { fnv1a32 } from "./rng";
import type { Difficulty, DiceBreakdown } from "./types";

/** Spec §7.1 — tiers from modified 1d10 roll. */
export function tierFromTotal(total: number): 1 | 2 | 3 | 4 {
  if (total >= 9) return 4;
  if (total >= 6) return 3;
  if (total >= 3) return 2;
  return 1;
}

export function tierLabel(tier: 1 | 2 | 3 | 4): string {
  switch (tier) {
    case 4:
      return "Clean success";
    case 3:
      return "Success with cost";
    case 2:
      return "Partial failure";
    case 1:
      return "Failure";
  }
}

export function difficultyDiceMod(d: Difficulty): number {
  switch (d) {
    case "green":
      return 1;
    case "veteran":
      return 0;
    case "fury":
      return -1;
  }
}

export function resolveD10Check(input: {
  seed: string;
  counter: number;
  /** Base modifiers with labels */
  modifiers: { label: string; value: number }[];
}): { breakdown: DiceBreakdown; nextCounter: number } {
  const roll = drawD10(input.seed, input.counter);
  let c = input.counter + 1;
  const mods = [...input.modifiers];
  const flat = mods.reduce((s, m) => s + m.value, 0);
  const total = clampRollTotal(roll + flat);
  const tier = tierFromTotal(total);
  return {
    breakdown: {
      roll,
      modifiers: mods,
      total,
      tier,
      tierLabel: tierLabel(tier),
    },
    nextCounter: c,
  };
}

function clampRollTotal(n: number): number {
  return Math.max(1, Math.min(10, n));
}

function drawD10(seed: string, counter: number): number {
  const h = fnv1a32(`${seed}|d10|${counter}`) % 10;
  return h + 1;
}
