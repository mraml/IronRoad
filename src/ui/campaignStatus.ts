import type { Difficulty, EnvironmentId, GameState, PlaySub } from "../engine/types";
import { seasonForMissionIndex } from "../engine/config";
import {
  deriveCampaignCalendar,
  SEASON_LABELS,
  type CalendarBeatInput,
} from "../engine/campaignCalendar";

const ENV_LABELS: Record<EnvironmentId, string> = {
  clear: "Clear",
  scorching_heat: "Scorching heat",
  dust_storm: "Dust storm",
  heavy_rain: "Heavy rain",
  deep_mud: "Deep mud",
  thick_fog: "Thick fog",
  light_snow: "Light snow",
  blizzard: "Blizzard",
  hard_freeze: "Hard freeze",
  ice: "Ice on roads",
  thaw_mud: "Thaw mud",
  overcast: "Overcast",
};

const DIFF_LABELS: Record<Difficulty, string> = {
  green: "Green",
  veteran: "Veteran",
  fury: "Fury",
};

export { deriveDayPhase } from "../engine/campaignCalendar";

export function envLabel(e: EnvironmentId): string {
  return ENV_LABELS[e] ?? e;
}

function calendarInputForSub(game: GameState, sub: PlaySub): CalendarBeatInput | null {
  const m = game.missions[game.missionIndex];
  if (!m?.days.length) return null;

  const base = {
    runSeed: game.runSeed,
    missionIndex: game.missionIndex,
    seasonPhase: game.seasonPhase,
  };

  switch (sub.t) {
    case "briefing":
      return {
        ...base,
        dayIndex: 0,
        eventIndex: 0,
        eventsInDay: m.days[0]?.events.length ?? 1,
      };
    case "day_intro":
      return {
        ...base,
        dayIndex: sub.day,
        eventIndex: 0,
        eventsInDay: m.days[sub.day]?.events.length ?? 1,
      };
    case "event":
      return {
        ...base,
        dayIndex: sub.day,
        eventIndex: sub.eventIndex,
        eventsInDay: m.days[sub.day]?.events.length ?? 1,
      };
    case "debrief": {
      const lastDay = m.days.length - 1;
      const n = m.days[lastDay]?.events.length ?? 1;
      return {
        ...base,
        dayIndex: lastDay,
        eventIndex: Math.max(0, n - 1),
        eventsInDay: n,
      };
    }
    case "foot": {
      const lastDay = m.days.length - 1;
      const n = m.days[lastDay]?.events.length ?? 1;
      return {
        ...base,
        dayIndex: lastDay,
        eventIndex: Math.max(0, n - 1),
        eventsInDay: n,
      };
    }
    case "tank_replacement":
      return {
        ...base,
        dayIndex: 0,
        eventIndex: 0,
        eventsInDay: m.days[0]?.events.length ?? 1,
      };
    case "between_missions": {
      const nextIdx = Math.min(game.missionIndex + 1, game.missions.length - 1);
      const next = game.missions[nextIdx];
      return {
        runSeed: game.runSeed,
        missionIndex: nextIdx,
        seasonPhase: seasonForMissionIndex(nextIdx, game.missions.length),
        dayIndex: 0,
        eventIndex: 0,
        eventsInDay: next?.days[0]?.events.length ?? 1,
      };
    }
    default:
      return null;
  }
}

export interface SupplyAlert {
  level: "warning" | "critical";
  message: string;
}

export function getSupplyAlerts(game: GameState): SupplyAlert[] {
  const alerts: SupplyAlert[] = [];
  const { foodDays, waterCanteens } = game.resources;
  if (foodDays <= 0) {
    alerts.push({
      level: "critical",
      message: "No food — crew loses health each encounter",
    });
  } else if (foodDays <= 2) {
    alerts.push({ level: "warning", message: `Food low (${foodDays} days)` });
  }
  if (waterCanteens <= 0) {
    alerts.push({
      level: "critical",
      message: "No water — crew loses health each encounter",
    });
  } else if (waterCanteens <= 2) {
    alerts.push({ level: "warning", message: `Water low (${waterCanteens})` });
  }
  return alerts;
}

export interface CampaignStatusView {
  theater: string;
  difficulty: string;
  missionLine: string;
  objective: string;
  phaseLabel: string;
  dayLabel: string;
  weather: string | null;
  season: string;
  weekday: string | null;
  dateLabel: string | null;
  timeOfDay: string | null;
  beatLabel: string | null;
  supplyAlerts: SupplyAlert[];
  uiAlert: string | null;
}

export function buildCampaignStatus(game: GameState, sub: PlaySub | null): CampaignStatusView {
  const m = game.missions[game.missionIndex];
  const missionLine = m
    ? `Mission ${game.missionIndex + 1}/${game.missions.length} — ${m.title}`
    : `Mission ${game.missionIndex + 1}/${game.missions.length}`;

  let phaseLabel = "Campaign";
  let dayLabel = "";
  let weather: string | null = null;
  let timeOfDay: string | null = null;
  let beatLabel: string | null = null;
  let weekday: string | null = null;
  let dateLabel: string | null = null;

  if (sub) {
    switch (sub.t) {
      case "briefing":
        phaseLabel = "Briefing";
        dayLabel = m ? `Day 1 of ${m.days.length}` : "";
        weather = m?.days[0] ? envLabel(m.days[0].environment) : null;
        break;
      case "day_intro":
        phaseLabel = "Day start";
        dayLabel = m ? `Day ${sub.day + 1} of ${m.days.length}` : "";
        weather = m?.days[sub.day] ? envLabel(m.days[sub.day].environment) : null;
        break;
      case "event": {
        phaseLabel = "In mission";
        dayLabel = m ? `Day ${sub.day + 1} of ${m.days.length}` : "";
        const day = m?.days[sub.day];
        weather = day ? envLabel(day.environment) : null;
        const n = day?.events.length ?? 0;
        beatLabel =
          n > 0 ? `Encounter ${sub.eventIndex + 1} of ${n}` : null;
        break;
      }
      case "debrief":
        phaseLabel = "Debrief";
        dayLabel = "Between days";
        break;
      case "between_missions":
        phaseLabel = "Between missions";
        break;
      case "foot":
        phaseLabel = "On foot";
        beatLabel = `Beat ${sub.index + 1} of ${game.footEvents?.length ?? 0}`;
        break;
      case "tank_replacement":
        phaseLabel = "Tank replacement";
        break;
      case "end":
        phaseLabel = sub.won ? "Campaign end" : "Campaign lost";
        break;
    }

    const calInput = calendarInputForSub(game, sub);
    if (calInput) {
      const cal = deriveCampaignCalendar(calInput);
      weekday = cal.weekday;
      dateLabel = cal.dateLabel;
      timeOfDay = sub.t === "foot" ? "Night" : cal.timeOfDay;
    }
  }

  return {
    theater: "ETO 1944–45",
    difficulty: DIFF_LABELS[game.difficulty],
    missionLine,
    objective: m?.objective ?? "",
    phaseLabel,
    dayLabel,
    weather,
    season: SEASON_LABELS[game.seasonPhase],
    weekday,
    dateLabel,
    timeOfDay,
    beatLabel,
    supplyAlerts: getSupplyAlerts(game),
    uiAlert: game.uiAlert ?? null,
  };
}
