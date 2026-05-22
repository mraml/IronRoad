import { drawIntInclusive, pickManyUnique } from "../engine/rng";
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
  "Walter", "Harold", "Donald", "Arthur", "Joseph", "Richard", "Lawrence",
  "Virgil", "Norman", "Albert", "Elmer", "Floyd", "Leon", "Lloyd", "Russell",
  "Ernest", "Clifford", "Herbert", "Willard", "Orville", "Merle", "Harvey",
  // Hispanic
  "Ernesto", "Miguel", "Carmine", "Sal", "Jesus", "Rodrigo", "Armando", "Manuel",
  "Diego", "Felipe", "Ignacio", "Rafael", "Lorenzo", "Domingo",
  // Jewish-American
  "Stan", "Seymour", "Marvin", "Myron", "Leonard", "Irving", "Sol", "Mort",
  // Southern
  "Bobby", "Earl", "Lyle", "Dewey", "Aubrey", "Clem", "Virgil", "Rufus",
  "Buford", "Odell", "Garland", "Lonnie", "Dwayne", "Junior",
  // Working class
  "Pete", "Hank", "Clyde", "Mitch", "Wendell", "Barney", "Mort", "Slim",
  "Dutch", "Bud", "Walt", "Red", "Zeke", "Gus", "Lars", "Sven",
  // Italian-American
  "Vito", "Enzo", "Bruno", "Rocco", "Tony", "Mario", "Gino", "Luca",
  // Polish/Eastern European
  "Stefan", "Casimir", "Tadeusz", "Boleslaw",
  // Irish-American
  "Seamus", "Declan", "Brendan", "Kieran", "Finn",
];

export const LAST_NAMES: string[] = [
  // Anglo
  "Briggs", "Harmon", "Whitfield", "Tanner", "Washington", "Jackson", "Marsh",
  "Pruitt", "Duvall", "Holloway", "Greer", "Hoover", "Raines", "Phelps", "Boyle",
  "Mathers", "Grier", "Caldwell", "Haynes", "Flynn", "Sharpe", "Odom",
  "Henderson", "Crawford", "Sutton", "Bowers", "Garrett", "Norris", "Holt",
  "Ramsey", "Malone", "Vance", "Barker", "Fowler", "Dodge", "Hale", "Cross",
  "Stanton", "Church", "Keller", "Gentry", "Rankin", "Parrish", "Cobb",
  "Pickett", "Stokes", "Underwood", "Vickers", "Womack", "Yates", "Zimmer",
  // Ethnic
  "Santos", "Deluca", "Esposito", "Kowalski", "Goldberg", "Nakamura", "Ruiz",
  "Bernstein", "Moretti", "Stavros", "Jablonski", "Dubois", "Navarro",
  "Wojcik", "Szymanski", "Gutierrez", "Ferrara", "Ricci", "Lombardi",
  "Schwartz", "Weiss", "Horowitz", "Castillo", "Reyes", "Mendoza",
  "O'Brien", "O'Connor", "Murphy", "Donnelly", "Gallagher",
  // Southern
  "Boudreaux", "Thibodaux", "Fontenot", "Arceneaux", "Landry", "Broussard",
  "Guidry", "Trosclair", "Credeur",
];

export const NICKNAMES: string[] = [
  // Classic soldier handles
  "Tombstone", "Goose", "Lucky", "Padre", "Sawbones", "Halfpint", "Duchess",
  "Twitchy", "Ace", "Duke", "Books", "Preacher", "Crispy", "Chief", "Smitty",
  "Tank", "Wheels", "Junior", "Tex", "Cajun", "Gator", "Sarge", "Pappy",
  "Hollywood", "Brooklyn", "Jersey", "Ghost", "Deuce", "Bones", "Nails",
  "Sparky", "Wrench", "Gunner", "Zero", "Hotrod", "Stitches",
  // Extended — geography
  "Georgia", "Kansas", "Dixie", "Dakota", "Memphis", "Frisco", "Chicago",
  "Savannah", "Montana", "Philly", "Baton", "Harlem", "Toledo",
  // Extended — physical
  "Tiny", "Stretch", "Stumpy", "Beanpole", "Ox", "Curly", "Patch",
  "Squint", "Lefty", "Gimpy", "Scrawny", "Pudge", "Knuckles",
  // Extended — character
  "Preacher", "Deacon", "Doc", "Prof", "Schoolboy", "Poet", "Icebox",
  "Sunshine", "Gloom", "Loner", "Joker", "Wildcat", "Bulldog", "Wolf",
  "Hawk", "Crow", "Raven", "Fox", "Bear", "Cougar", "Viper", "Mule",
  // Extended — mechanical/war
  "Trigger", "Hammer", "Rivet", "Socket", "Grease", "Smoky", "Dusty",
  "Cannon", "Shovel", "Crowbar", "Copper", "Brass", "Powder", "Fuse",
  // Extended — fate/fortune
  "Snake Eyes", "Seven", "Jinx", "Hoodoo", "Charm", "Doomsday",
  "Judgment", "Pilgrim", "Ranger", "Scout", "Reaper", "Saint",
  // One-word evocative
  "Diesel", "Vapor", "Flint", "Cinder", "Slag", "Rust", "Colt",
  "Specter", "Phantom", "Banshee", "Fury", "Havoc", "Riot",
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
  // Draw all 5 nicknames up front without replacement so no two crew share one.
  const { picked: nicknames, nextCounter: c1 } = pickManyUnique(seed, c, NICKNAMES, ROLES_ORDER.length);
  c = c1;
  const crew: CrewMember[] = ROLES_ORDER.map((role, i) => {
    const first = pick(seed, c++, FIRST_NAMES);
    const last = pick(seed, c++, LAST_NAMES);
    const archetypeId = pick(seed, c++, ARCHETYPES as unknown as string[]);
    return {
      id: `cm_${role}_${i}`,
      role,
      firstName: first,
      lastName: last,
      nickname: nicknames[i]!,
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
