/**
 * Charm catalog (spec §3B, §14).
 * Charms are per-crew items usable once per mission.
 * Rarity: common | rare | elite.
 */

import { drawIntInclusive } from "../engine/rng";
import type { Effect, Role } from "../engine/types";

export type CharmRarity = "common" | "rare" | "elite";

export interface CharmDef {
  id: string;
  name: string;
  rarity: CharmRarity;
  /** Flavor text displayed when used. */
  flavor: string;
  /** Archetype that gets best benefit — not enforced, just narrative. */
  archetypeAffinity?: string;
  /** Effects applied when used. */
  effects: (role: Role) => Effect[];
}

export const CHARM_CATALOG: Record<string, CharmDef> = {
  lucky_coin: {
    id: "lucky_coin",
    name: "Lucky Coin",
    rarity: "common",
    flavor: "A coin worn smooth on one face from years of nervous thumbing.",
    archetypeAffinity: "kid",
    effects: (role) => [{ op: "mod_constitution", role, delta: 15 }],
  },
  huertgen_casing: {
    id: "huertgen_casing",
    name: "Hürtgen Casing",
    rarity: "rare",
    flavor: "Shell casing from the forest. Still smells like winter.",
    archetypeAffinity: "veteran",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 10 },
      { op: "clear_trauma", role, trauma: "shellshocked" },
    ],
  },
  saint_christopher: {
    id: "saint_christopher",
    name: "St. Christopher Medal",
    rarity: "common",
    flavor: "Patron of travelers. Appropriate.",
    archetypeAffinity: "faithful",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 12 },
      { op: "mod_hp", role, delta: 5 },
    ],
  },
  photograph: {
    id: "photograph",
    name: "Photograph",
    rarity: "common",
    flavor: "Someone who's waiting. The edges are worn from folding.",
    archetypeAffinity: "homesick_one",
    effects: (role) => [{ op: "mod_constitution", role, delta: 20 }],
  },
  ace_of_spades: {
    id: "ace_of_spades",
    name: "Ace of Spades",
    rarity: "rare",
    flavor: "Somebody's joke. Nobody laughs at it anymore.",
    archetypeAffinity: "dark_comedian",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 8 },
      { op: "clear_trauma", role, trauma: "jumpy" },
    ],
  },
  wedding_ring: {
    id: "wedding_ring",
    name: "Wedding Ring",
    rarity: "common",
    flavor: "Kept on a cord around the neck, not the finger. Safer.",
    archetypeAffinity: "protector",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 15 },
      { op: "mod_hp", role, delta: 8 },
    ],
  },
  rosary: {
    id: "rosary",
    name: "Rosary",
    rarity: "common",
    flavor: "Twelve decades. Counts for something.",
    archetypeAffinity: "faithful",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 18 },
      { op: "clear_trauma", role, trauma: "grief_struck" },
    ],
  },
  compass: {
    id: "compass",
    name: "Brass Compass",
    rarity: "rare",
    flavor: "Points true north. Still true.",
    archetypeAffinity: "natural",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 10 },
      { op: "add_salvage", amount: 2 },
    ],
  },
  fury_pennant: {
    id: "fury_pennant",
    name: "Tank Pennant",
    rarity: "elite",
    flavor: "A strip of cloth from the first tank you served in. It was a long time ago.",
    archetypeAffinity: "old_hand",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 20 },
      { op: "mod_hp", role, delta: 15 },
      { op: "clear_trauma", role, trauma: "shellshocked" },
    ],
  },
};

/** Drop table weighted by rarity: anchor/elite events get elite chance. Returns next RNG counter. */
export function rollCharmDrop(
  seed: string,
  startCounter: number,
  isEliteOrAnchor: boolean,
): { charmId: string | null; nextCounter: number } {
  let c = startCounter;
  const roll = drawIntInclusive(seed, c++, 0, 99);
  let rarity: CharmRarity | null = null;
  if (isEliteOrAnchor) {
    if (roll < 15) rarity = "elite";
    else if (roll < 50) rarity = "rare";
    else if (roll < 85) rarity = "common";
  } else {
    if (roll < 3) rarity = "rare";
    else if (roll < 25) rarity = "common";
  }
  if (!rarity) return { charmId: null, nextCounter: c };

  const matching = Object.values(CHARM_CATALOG).filter((ch) => ch.rarity === rarity);
  if (matching.length === 0) return { charmId: null, nextCounter: c };
  const idx = drawIntInclusive(seed, c++, 0, matching.length - 1);
  return { charmId: matching[idx]!.id, nextCounter: c };
}

/** Famous combination check (spec §15). */
export function checkFamousCombination(
  tankName: string,
  crewNicknames: string[],
): { name: string; description: string } | null {
  if (tankName === "Fury" && crewNicknames.some((n) => n === "Wardaddy" || n === "Bible")) {
    return {
      name: "The Fury Crew",
      description: "Some combinations are legendary. The odds of this crew, this tank — the war notices.",
    };
  }
  if (crewNicknames.includes("Lucky") && crewNicknames.length === 5) {
    return {
      name: "Lucky's Run",
      description: "Every crew has a Lucky. Not every Lucky makes it. This one's still here.",
    };
  }
  if (tankName === "Cobra King") {
    return {
      name: "Cobra King",
      description: "The name carries history. Those who know, know.",
    };
  }
  return null;
}
