import type { Difficulty, EnvironmentId, SeasonPhase, TankType, TankTypeProfile } from "./types";

export interface DifficultyProfile {
  missions: number;
  eventsMin: number;
  eventsMax: number;
  daysMin: number;
  daysMax: number;
  eventsPerDayMin: number;
  eventsPerDayMax: number;
  anchorsMin: number;
  anchorsMax: number;
  /** Actions available in the debrief stop after each mission. */
  debriefPicks: number;
}

export const DIFFICULTY_PROFILE: Record<Difficulty, DifficultyProfile> = {
  green: {
    missions: 4,
    eventsMin: 5,
    eventsMax: 8,
    daysMin: 2,
    daysMax: 3,
    eventsPerDayMin: 2,
    eventsPerDayMax: 3,
    anchorsMin: 2,
    anchorsMax: 3,
    debriefPicks: 2,
  },
  veteran: {
    missions: 6,
    eventsMin: 8,
    eventsMax: 12,
    daysMin: 3,
    daysMax: 4,
    eventsPerDayMin: 3,
    eventsPerDayMax: 4,
    anchorsMin: 4,
    anchorsMax: 5,
    debriefPicks: 3,
  },
  fury: {
    missions: 8,
    eventsMin: 12,
    eventsMax: 18,
    daysMin: 4,
    daysMax: 5,
    eventsPerDayMin: 4,
    eventsPerDayMax: 5,
    anchorsMin: 6,
    anchorsMax: 7,
    debriefPicks: 3,
  },
};

/** Kept for backward compatibility — use DIFFICULTY_PROFILE[d].debriefPicks in new code. */
export const DEBRIEF_PICKS = 2;

export const TANK_TYPE_PROFILES: Record<TankType, TankTypeProfile> = {
  sherman: {
    id: "sherman",
    label: "Sherman M4A3",
    description:
      "Balanced baseline — 75% hull, even AP/HE load. The default American workhorse.",
    startHealthPct: 75,
    componentBonus: 0,
    startAmmoBonus: { AP: 2, HE: 2 },
    passiveLabel: "Balanced",
  },
  churchill: {
    id: "churchill",
    label: "Churchill IV",
    description:
      "90% hull, +1 component durability, HE-heavy. Drivers take −1 on travel — slow but hard to kill.",
    startHealthPct: 90,
    componentBonus: 1,
    startAmmoBonus: { AP: 2, HE: 3 },
    passiveLabel: "+durability · slow travel",
  },
  t34: {
    id: "t34",
    label: "T-34/85",
    description:
      "65% hull, +3 AP, less HE. Gunner gets +1 on tank combat — fragile, aggressive.",
    startHealthPct: 65,
    componentBonus: 0,
    startAmmoBonus: { AP: 3, HE: -4, HEAT: 1 },
    passiveLabel: "+gunner vs tanks",
  },
};

/** Environment pools by season phase (subset of spec §6.3). */
export const ENV_POOL: Record<SeasonPhase, EnvironmentId[]> = {
  summer: ["clear", "scorching_heat", "dust_storm", "overcast"],
  autumn: ["heavy_rain", "deep_mud", "thick_fog", "overcast", "clear"],
  winter: ["light_snow", "blizzard", "hard_freeze", "ice", "thick_fog"],
  spring: ["thaw_mud", "heavy_rain", "overcast", "clear"],
};

export function seasonForMissionIndex(
  missionIndex: number,
  totalMissions: number,
): SeasonPhase {
  if (totalMissions <= 1) return "summer";
  const t = missionIndex / (totalMissions - 1);
  if (t < 0.28) return "summer";
  if (t < 0.55) return "autumn";
  if (t < 0.82) return "winter";
  return "spring";
}
