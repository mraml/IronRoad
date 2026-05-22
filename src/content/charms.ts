/**
 * Charm catalog (spec §3B, §14).
 * Charms are per-crew items usable once per mission.
 * Rarity: common | rare | elite.
 */

import { drawIntInclusive } from "../engine/rng";
import type { Effect, Role } from "../engine/types";

export type CharmRarity = "common" | "rare" | "elite" | "legendary";

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
  unit_patch: {
    id: "unit_patch",
    name: "Unit Patch",
    rarity: "common",
    flavor: "Torn from a dead man's sleeve. Still has meaning if you let it.",
    archetypeAffinity: "veteran",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 12 },
      { op: "add_salvage", amount: 1 },
    ],
  },
  broken_watch: {
    id: "broken_watch",
    name: "Broken Watch",
    rarity: "common",
    flavor: "Stopped at a time that mattered to someone else.",
    archetypeAffinity: "homesick_one",
    effects: (role) => [{ op: "mod_constitution", role, delta: 14 }],
  },
  childs_drawing: {
    id: "childs_drawing",
    name: "Child's Drawing",
    rarity: "common",
    flavor: "Crayon on folded paper. A house with a flag.",
    archetypeAffinity: "protector",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 18 },
      { op: "mod_hp", role, delta: 5 },
    ],
  },
  cigarette_case: {
    id: "cigarette_case",
    name: "Cigarette Case",
    rarity: "rare",
    flavor: "Initials inside the lid. You don't ask whose.",
    archetypeAffinity: "dark_comedian",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 10 },
      { op: "clear_trauma", role, trauma: "jumpy" },
    ],
  },
  bible_page: {
    id: "bible_page",
    name: "Bible Page",
    rarity: "rare",
    flavor: "Psalm 23, folded until the creases went soft.",
    archetypeAffinity: "faithful",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 16 },
      { op: "clear_trauma", role, trauma: "grief_struck" },
    ],
  },
  pressed_flower: {
    id: "pressed_flower",
    name: "Pressed Flower",
    rarity: "rare",
    flavor: "Someone pressed it between letters. The color is mostly gone.",
    archetypeAffinity: "homesick_one",
    effects: (role) => [{ op: "mod_constitution", role, delta: 22 }],
  },
  last_cigarette: {
    id: "last_cigarette",
    name: "Last Cigarette",
    rarity: "elite",
    flavor: "One cigarette left in the pack. The joke writes itself.",
    archetypeAffinity: "dark_comedian",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 25 },
      { op: "clear_trauma", role, trauma: "checked_out" },
    ],
  },
  silver_star_medal: {
    id: "silver_star_medal",
    name: "Silver Star (found)",
    rarity: "legendary",
    flavor: "Not yours. You carry it anyway because someone has to.",
    archetypeAffinity: "glory_hound",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 25 },
      { op: "mod_hp", role, delta: 20 },
      { op: "add_salvage", amount: 3 },
    ],
  },
  york_bible_card: {
    id: "york_bible_card",
    name: "Prayer Card",
    rarity: "legendary",
    flavor: "A card from a famous unit. The war doesn't believe in fame. You do, a little.",
    archetypeAffinity: "faithful",
    effects: (role) => [
      { op: "mod_constitution", role, delta: 30 },
      { op: "clear_trauma", role, trauma: "shellshocked" },
      { op: "clear_trauma", role, trauma: "breaking" },
    ],
  },
};

/**
 * Drop tiers per spec §14.2:
 * - standard: base rate (travel, human moment)
 * - infantry: combat success (infantry) — +Common
 * - tank: combat success (tank) — +Rare
 * - elite_anchor: elite encounter / historical anchor — +Epic
 * - legendary_npc: named legendary NPC — +Legendary (same pool as elite)
 */
export type CharmDropTier = "standard" | "infantry" | "tank" | "elite_anchor" | "legendary_npc";

/** Drop table weighted by rarity. Returns next RNG counter. */
export function rollCharmDrop(
  seed: string,
  startCounter: number,
  tier: CharmDropTier | boolean,
): { charmId: string | null; nextCounter: number } {
  // Legacy boolean support: true → elite_anchor
  const t: CharmDropTier =
    typeof tier === "boolean" ? (tier ? "elite_anchor" : "standard") : tier;
  let c = startCounter;
  const roll = drawIntInclusive(seed, c++, 0, 99);
  let rarity: CharmRarity | null = null;
  if (t === "legendary_npc") {
    if (roll < 8) rarity = "legendary";
    else if (roll < 25) rarity = "elite";
    else if (roll < 55) rarity = "rare";
    else if (roll < 85) rarity = "common";
  } else if (t === "elite_anchor") {
    if (roll < 15) rarity = "elite";
    else if (roll < 50) rarity = "rare";
    else if (roll < 85) rarity = "common";
  } else if (t === "tank") {
    if (roll < 8) rarity = "rare";
    else if (roll < 40) rarity = "common";
  } else if (t === "infantry") {
    if (roll < 3) rarity = "rare";
    else if (roll < 45) rarity = "common";
  } else {
    // standard
    if (roll < 3) rarity = "rare";
    else if (roll < 25) rarity = "common";
  }
  if (!rarity) return { charmId: null, nextCounter: c };

  const matching = Object.values(CHARM_CATALOG).filter((ch) => ch.rarity === rarity);
  if (matching.length === 0) return { charmId: null, nextCounter: c };
  const idx = drawIntInclusive(seed, c++, 0, matching.length - 1);
  return { charmId: matching[idx]!.id, nextCounter: c };
}

export interface FamousDiscovery {
  catalogId: string;
  name: string;
  description: string;
}

/** Famous combination checks (spec §15). Returns all matches at campaign start. */
export function findFamousDiscoveries(
  tankName: string,
  crew: { nickname: string; lastName: string; archetypeId: string }[],
): FamousDiscovery[] {
  const out: FamousDiscovery[] = [];
  const nicknames = crew.map((c) => c.nickname);

  const furyNames = new Set(["Wardaddy", "Bible", "Coon-Ass", "Gordo"]);
  const furyHits = nicknames.filter((n) => furyNames.has(n)).length;
  if (tankName === "Fury" && furyHits >= 3) {
    out.push({
      catalogId: "fury_full_crew",
      name: "The Fury crew",
      description:
        "The names line up wrong — too perfect. The Journal records it quietly.",
    });
  } else if (tankName === "Fury" && nicknames.some((n) => n === "Wardaddy" || n === "Bible")) {
    out.push({
      catalogId: "fury_full_crew",
      name: "The Fury Crew",
      description: "Some combinations are legendary. The odds of this crew, this tank — the war notices.",
    });
  }

  if (nicknames.includes("Lucky") && crew.length === 5) {
    out.push({
      catalogId: "lucky_survivor",
      name: "Lucky's Run",
      description: "Every crew has a Lucky. Not every Lucky makes it. This one's still here.",
    });
  }

  if (tankName === "Cobra King") {
    out.push({
      catalogId: "cobra_king",
      name: "Cobra King",
      description: "The name carries history. Those who know, know.",
    });
  }

  if (tankName === "Thunderbolt") {
    out.push({
      catalogId: "thunderbolt_abrams",
      name: "Thunderbolt",
      description: "The tank's name carries weight — commanders and distances and old stories.",
    });
  }

  const lastCounts = new Map<string, number>();
  for (const cm of crew) {
    lastCounts.set(cm.lastName, (lastCounts.get(cm.lastName) ?? 0) + 1);
  }
  if ([...lastCounts.values()].some((n) => n >= 2)) {
    out.push({
      catalogId: "same_last_name",
      name: "Same name",
      description: "Two men on the roster share a last name. The crew noticed.",
    });
  }

  return out;
}

/** @deprecated Use findFamousDiscoveries — first match only. */
export function checkFamousCombination(
  tankName: string,
  crewNicknames: string[],
): { name: string; description: string } | null {
  const crew = crewNicknames.map((nickname) => ({
    nickname,
    lastName: "",
    archetypeId: "",
  }));
  const first = findFamousDiscoveries(tankName, crew)[0];
  return first ? { name: first.name, description: first.description } : null;
}
