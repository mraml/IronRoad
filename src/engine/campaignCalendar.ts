import type { EnvironmentId, SeasonPhase } from "./types";
import { ENV_POOL } from "./config";
import { drawIntInclusive } from "./rng";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DAY_PHASES = ["Dawn", "Morning", "Midday", "Afternoon", "Dusk", "Night"] as const;

/** Beat index within a day → immersion time label (shared with mission overview). */
export function deriveDayPhase(eventIndex: number, eventsInDay: number): string {
  if (eventsInDay <= 1) return DAY_PHASES[2]!;
  const ratio = eventIndex / Math.max(eventsInDay - 1, 1);
  const idx = Math.min(DAY_PHASES.length - 1, Math.round(ratio * (DAY_PHASES.length - 1)));
  return DAY_PHASES[idx]!;
}

const MONTHS_BY_SEASON: Record<SeasonPhase, readonly string[]> = {
  summer: ["Jun", "Jul", "Aug"],
  autumn: ["Sep", "Oct", "Nov"],
  winter: ["Dec", "Jan", "Feb"],
  spring: ["Mar", "Apr", "May"],
};

export const SEASON_LABELS: Record<SeasonPhase, string> = {
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
  spring: "Spring",
};

/** Authoritative season ↔ environment matrix (mirrors ENV_POOL in config). */
export const ENVIRONMENT_SEASONS: Record<EnvironmentId, readonly SeasonPhase[]> = {
  clear: ["summer", "autumn", "spring"],
  scorching_heat: ["summer"],
  dust_storm: ["summer"],
  overcast: ["summer", "autumn", "spring"],
  heavy_rain: ["autumn", "spring"],
  deep_mud: ["autumn"],
  thick_fog: ["autumn", "winter"],
  light_snow: ["winter"],
  blizzard: ["winter"],
  hard_freeze: ["winter"],
  ice: ["winter"],
  thaw_mud: ["spring"],
};

export function isEnvironmentValidForSeason(
  environment: EnvironmentId,
  season: SeasonPhase,
): boolean {
  return ENVIRONMENT_SEASONS[environment]?.includes(season) ?? false;
}

/** Dev/test guard: ENV_POOL entries must match ENVIRONMENT_SEASONS. */
export function assertEnvPoolsMatchSeasonMatrix(): void {
  for (const season of Object.keys(ENV_POOL) as SeasonPhase[]) {
    for (const env of ENV_POOL[season]) {
      if (!isEnvironmentValidForSeason(env, season)) {
        throw new Error(`ENV_POOL[${season}] contains ${env} but matrix disallows it`);
      }
    }
  }
}

export interface CalendarBeatInput {
  runSeed: string;
  missionIndex: number;
  dayIndex: number;
  eventIndex: number;
  eventsInDay: number;
  seasonPhase: SeasonPhase;
}

export interface CampaignCalendarLabels {
  weekday: string;
  dateLabel: string;
  timeOfDay: string;
}

/**
 * Deterministic fictional calendar for mission overview (not historical ETO dates).
 */
export function deriveCampaignCalendar(input: CalendarBeatInput): CampaignCalendarLabels {
  const slot = input.missionIndex * 80 + input.dayIndex * 12 + Math.min(input.eventIndex, 11);
  const weekday = WEEKDAYS[drawIntInclusive(input.runSeed, slot, 0, 6)]!;
  const month =
    MONTHS_BY_SEASON[input.seasonPhase][
      drawIntInclusive(input.runSeed, slot + 1, 0, MONTHS_BY_SEASON[input.seasonPhase].length - 1)
    ]!;
  const day = drawIntInclusive(input.runSeed, slot + 2, 1, 28);
  const dateLabel = `${day} ${month}`;
  const timeOfDay = deriveDayPhase(input.eventIndex, Math.max(input.eventsInDay, 1));
  return { weekday, dateLabel, timeOfDay };
}
