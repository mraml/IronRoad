import type { Difficulty, EnvironmentId, GameState, PlaySub } from "../engine/types";

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

const DAY_PHASES = ["Dawn", "Morning", "Midday", "Afternoon", "Dusk", "Night"] as const;

export function envLabel(e: EnvironmentId): string {
  return ENV_LABELS[e] ?? e;
}

export function deriveDayPhase(eventIndex: number, eventsInDay: number): string {
  if (eventsInDay <= 1) return DAY_PHASES[2]!;
  const ratio = eventIndex / Math.max(eventsInDay - 1, 1);
  const idx = Math.min(DAY_PHASES.length - 1, Math.round(ratio * (DAY_PHASES.length - 1)));
  return DAY_PHASES[idx]!;
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

  if (sub) {
    switch (sub.t) {
      case "briefing":
        phaseLabel = "Briefing";
        dayLabel = m ? `Day 1 of ${m.days.length}` : "";
        weather = m?.days[0] ? envLabel(m.days[0].environment) : null;
        timeOfDay = "Dawn";
        break;
      case "day_intro":
        phaseLabel = "Day start";
        dayLabel = m ? `Day ${sub.day + 1} of ${m.days.length}` : "";
        weather = m?.days[sub.day] ? envLabel(m.days[sub.day].environment) : null;
        timeOfDay = "Dawn";
        break;
      case "event": {
        phaseLabel = "In mission";
        dayLabel = m ? `Day ${sub.day + 1} of ${m.days.length}` : "";
        const day = m?.days[sub.day];
        weather = day ? envLabel(day.environment) : null;
        const n = day?.events.length ?? 0;
        timeOfDay = n > 0 ? deriveDayPhase(sub.eventIndex, n) : null;
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
        timeOfDay = "Night";
        break;
      case "tank_replacement":
        phaseLabel = "Tank replacement";
        break;
      case "end":
        phaseLabel = sub.won ? "Campaign end" : "Campaign lost";
        break;
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
    season: game.seasonPhase,
    timeOfDay,
    beatLabel,
    supplyAlerts: getSupplyAlerts(game),
    uiAlert: game.uiAlert ?? null,
  };
}
