import { drawIntInclusive } from "../engine/rng";
import type { CrewMember, Role } from "../engine/types";

export const ARCHETYPES = [
  "veteran",
  "kid",
  "dark_comedian",
  "pragmatist",
  "faithful",
  "angry_one",
  "quiet_one",
  "homesick_one",
  "glory_hound",
  "cynical_one",
  "natural",
  "old_hand",
  "reluctant_one",
  "protector",
  "displaced",
] as const;

export const FIRST_NAMES: string[] = [
  // Anglo-American
  "James", "Robert", "William", "John", "Thomas", "Eugene", "Raymond", "Willie",
  "Leroy", "Patrick", "Samuel", "Irving", "Henry", "George", "Frank", "Roy",
  "Carl", "Eddie", "Clarence", "Howard", "Luther", "Alvin", "Chester", "Dale",
  // Hispanic
  "Ernesto", "Miguel", "Carmine", "Sal", "Jesus", "Rodrigo", "Armando", "Manuel",
  // Jewish-American
  "Stan", "Seymour", "Marvin", "Myron", "Leonard",
  // Southern
  "Bobby", "Earl", "Lyle", "Dewey", "Aubrey",
  // Working class
  "Pete", "Hank", "Clyde", "Mitch", "Wendell",
];

export const LAST_NAMES: string[] = [
  // Anglo
  "Briggs", "Harmon", "Whitfield", "Tanner", "Washington", "Jackson", "Marsh",
  "Pruitt", "Duvall", "Holloway", "Greer", "Hoover", "Raines", "Phelps", "Boyle",
  "Mathers", "Grier", "Caldwell", "Haynes", "Flynn", "Sharpe", "Odom",
  // Ethnic
  "Santos", "Deluca", "Esposito", "Kowalski", "Goldberg", "Nakamura", "Ruiz",
  "Bernstein", "Moretti", "Stavros", "Jablonski", "Dubois", "Navarro",
  // Southern
  "Boudreaux", "Thibodaux", "Fontenot",
];

export const NICKNAMES: string[] = [
  "Tombstone", "Goose", "Lucky", "Padre", "Sawbones", "Halfpint", "Duchess",
  "Twitchy", "Ace", "Duke", "Books", "Preacher", "Crispy", "Chief", "Smitty",
  "Tank", "Wheels", "Junior", "Tex", "Cajun", "Gator", "Sarge", "Pappy",
  "Hollywood", "Brooklyn", "Jersey", "Ghost", "Deuce", "Bones", "Nails",
  "Sparky", "Wrench", "Gunner", "Zero", "Hotrod", "Stitches",
];

export const TANK_NAMES: string[] = [
  // Fury reference
  "Fury",
  // Original pool
  "Iron Mary", "Lady Luck", "Ol' Bastard", "The Confessor", "Widowmaker",
  "Absolution", "Stinky Pete", "Gutpunch", "Hellgate", "Cornelia",
  "Thunderbolt", "Cobra King",
  // Extended
  "Devil's Acre", "Belladonna", "Iron Fist", "Lazarus", "The Last Word",
  "Nemesis", "Providence", "Reckoning", "Sister Death", "Perdition",
  "Hard Times", "Retribution", "Deliverance", "Cain", "Old Reliable",
];

export const ANCHOR_IDS = [
  "anchor_cobra",
  "anchor_bulge",
  "anchor_rhine",
  "anchor_huertgen",
  "anchor_paris_skirt",
  "anchor_siegfried",
  "anchor_push_germany",
  "anchor_seine_crossing",
  "anchor_cologne",
  "anchor_ve_day",
] as const;

/** Scar name pools keyed by category (spec §9.1a). Used by drawScarName in effects.ts. */
export const SCAR_NAME_POOLS: Record<"shrapnel" | "hearing" | "vision" | "burn" | "crush", string[]> = {
  shrapnel: [
    "Bent trigger finger",
    "Two-knuckle gap",
    "Dead middle finger",
    "Notched left palm",
    "Thumb won't close all the way",
    "Seam across the knuckles",
    "One less finger than he started with",
  ],
  hearing: [
    "Half-deaf left ear",
    "Ringing that won't stop",
    "Gone in the left",
    "Keeps asking people to repeat",
    "Hears the shot before the sound",
    "The left side is just static now",
  ],
  vision: [
    "Milky right eye",
    "Blind in the sun",
    "One good eye left",
    "Can't judge distance anymore",
    "Light gives him headaches",
    "The right eye doesn't track right",
  ],
  burn: [
    "Seamed neck",
    "Tight shoulder",
    "Graft on the forearm",
    "Skin that doesn't move right on the collarbone",
    "Burns up the left side",
    "The hand that caught the fire",
  ],
  crush: [
    "Drags the left",
    "Bad hip since Falaise",
    "Stiff knee",
    "Walks with what he won't call a limp",
    "The knee that predicts rain",
    "Something in the hip that never set right",
  ],
};

export const ROLES_ORDER: Role[] = [
  "commander",
  "gunner",
  "driver",
  "asst_driver",
  "loader",
];

export function pick<T>(seed: string, counter: number, arr: readonly T[]): T {
  return arr[drawIntInclusive(seed, counter, 0, arr.length - 1)]!;
}

export function generateCrew(seed: string, start: number): { crew: CrewMember[]; next: number } {
  let c = start;
  const crew: CrewMember[] = ROLES_ORDER.map((role, i) => {
    const first = pick(seed, c++, FIRST_NAMES);
    const last = pick(seed, c++, LAST_NAMES);
    const nickname = pick(seed, c++, NICKNAMES);
    const archetypeId = pick(seed, c++, ARCHETYPES as unknown as string[]);
    return {
      id: `cm_${role}_${i}`,
      role,
      firstName: first,
      lastName: last,
      nickname,
      archetypeId,
      hp: 100,
      constitution: 100,
      traumaStates: [],
      scars: [],
    };
  });
  return { crew, next: c };
}

export function generateTankName(seed: string, counter: number): string {
  return pick(seed, counter, TANK_NAMES);
}

export function generateReplacement(
  seed: string,
  counter: number,
  role: Role,
): { member: CrewMember; next: number } {
  let c = counter;
  const first = pick(seed, c++, FIRST_NAMES);
  const last = pick(seed, c++, LAST_NAMES);
  const nickname = pick(seed, c++, NICKNAMES);
  const archetypeId = pick(seed, c++, ARCHETYPES as unknown as string[]);
  return {
    member: {
      id: `cm_rep_${role}_${c}`,
      role,
      firstName: first,
      lastName: last,
      nickname,
      archetypeId,
      hp: 100,
      constitution: 80,
      traumaStates: [],
      scars: [],
    },
    next: c,
  };
}
