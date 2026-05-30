import type { MissionBriefArchetype } from "../engine/types";
import { drawIntInclusive } from "../engine/rng";

/** Default briefing officer per mission archetype (Wave 27). */
export const ARCHETYPE_BRIEFER: Record<MissionBriefArchetype, string> = {
  generic: "Company Commander",
  attack: "Capt. Hayes",
  defense: "Lt. Morales",
  pursuit: "Maj. Connelly",
  patrol: "Lt. Graves",
  withdrawal: "Maj. Holt",
  night_move: "Maj. Ellis",
  ammo_hold: "Lt. Carver",
  final_push: "Col. Whitfield",
};

const BRIEFER_ALTS: Partial<Record<MissionBriefArchetype, readonly string[]>> = {
  generic: ["Company Commander", "Maj. Stafford"],
  attack: ["Capt. Hayes", "Capt. Hess"],
  defense: ["Lt. Morales", "Capt. Brennan"],
  withdrawal: ["Maj. Holt", "Maj. Ellis"],
};

const BRIEFING_PLACES = [
  "a rain-wet crossroads CP east of grid {placeGrid}",
  "battalion headquarters in a requisitioned school annex at {placeGrid}",
  "a canvas briefing tent pitched beside the trace near {placeGrid}",
  "the orchard lane staging area outside grid {placeGrid}",
  "a barn loft cleared for maps and grease pencil at {placeGrid}",
] as const;

export function pickBrieferForMission(
  seed: string,
  missionIndex: number,
  archetype: MissionBriefArchetype,
): string {
  const pool = BRIEFER_ALTS[archetype] ?? [ARCHETYPE_BRIEFER[archetype]];
  const idx = drawIntInclusive(seed, missionIndex * 7 + 3, 0, pool.length - 1);
  return pool[idx] ?? ARCHETYPE_BRIEFER[archetype];
}

export function pickBriefingPlace(seed: string, missionIndex: number): string {
  const idx = drawIntInclusive(seed, missionIndex * 11 + 5, 0, BRIEFING_PLACES.length - 1);
  return BRIEFING_PLACES[idx] ?? BRIEFING_PLACES[0];
}
