import { crowdProse, type DayLocationPick, type LocationKind } from "../content/dayLocations";
import { deriveEnvironmentProse } from "../content/environmentProse";
import { seasonProseTag } from "../content/areaEntries";
import { deriveCampaignCalendar } from "./campaignCalendar";
import type {
  CrewMember,
  DayGroundingSnapshot,
  EnvironmentId,
  GameState,
  PlaySub,
  SeasonPhase,
} from "./types";
import { narrativeVars, substituteTemplate, type NarrativeTemplateVars } from "./template";
import { seasonForMissionIndex } from "./config";

export interface DayGroundingInput {
  runSeed: string;
  missionIndex: number;
  dayIndex: number;
  eventIndex: number;
  eventsInDay: number;
  season: SeasonPhase;
  environment: EnvironmentId;
  locationPick: DayLocationPick;
  crew: CrewMember[];
  tankName: string;
  objective: string;
  extras?: Partial<NarrativeTemplateVars>;
}

export function buildDayGroundingVars(input: DayGroundingInput): NarrativeTemplateVars {
  const cal = deriveCampaignCalendar({
    runSeed: input.runSeed,
    missionIndex: input.missionIndex,
    dayIndex: input.dayIndex,
    eventIndex: input.eventIndex,
    eventsInDay: input.eventsInDay,
    seasonPhase: input.season,
  });
  const envProse = deriveEnvironmentProse(input.environment, cal.timeOfDay);
  const tmpl = input.locationPick.template;
  const placeGrid = input.locationPick.placeGrid;
  const partialGrid = { placeGrid };

  return narrativeVars(input.crew, input.tankName, input.objective, {
    season: seasonProseTag(input.season),
    weekday: cal.weekday,
    dateLabel: cal.dateLabel,
    timeOfDay: cal.timeOfDay,
    placeGrid,
    place: substituteTemplate(tmpl.place, partialGrid),
    placeName: substituteTemplate(tmpl.placeName, partialGrid),
    approach: substituteTemplate(tmpl.approach, partialGrid),
    crowd: crowdProse(tmpl.crowd),
    weather: envProse.weather,
    light: envProse.light,
    temp: envProse.temp,
    activity: envProse.activity,
    ...input.extras,
  });
}

export function snapshotFromGroundingVars(
  locationPick: DayLocationPick,
  vars: NarrativeTemplateVars,
): DayGroundingSnapshot {
  return {
    locationKind: locationPick.kind,
    placeGrid: locationPick.placeGrid,
    placeName: vars.placeName,
    place: vars.place,
    approach: vars.approach,
    crowd: vars.crowd,
  };
}

/** Reconstruct a location pick from persisted snapshot (follow-ups / runtime beats). */
export function locationPickFromSnapshot(snapshot: DayGroundingSnapshot): DayLocationPick {
  return {
    kind: snapshot.locationKind as LocationKind,
    placeGrid: snapshot.placeGrid,
    template: {
      placeName: snapshot.placeName,
      place: snapshot.place,
      approach: snapshot.approach,
      crowd: "tense",
    },
  };
}

export function groundingVarsForPlay(
  s: GameState,
  dayIndex: number,
  eventIndex: number,
  eventsInDay: number,
): NarrativeTemplateVars {
  const m = s.missions[s.missionIndex];
  const day = m?.days[dayIndex];
  const objective = m?.objective ?? "Survive";
  const season = seasonForMissionIndex(s.missionIndex, s.missions.length);
  if (day?.dayGrounding) {
    return buildDayGroundingVars({
      runSeed: s.runSeed,
      missionIndex: s.missionIndex,
      dayIndex,
      eventIndex,
      eventsInDay,
      season,
      environment: day.environment,
      locationPick: locationPickFromSnapshot(day.dayGrounding),
      crew: s.crew,
      tankName: s.tank.name || "The hull",
      objective,
    });
  }
  return narrativeVars(s.crew, s.tank.name || "The hull", objective);
}

export function groundingVarsFromSub(s: GameState, sub: PlaySub): NarrativeTemplateVars {
  const m = s.missions[s.missionIndex];
  if (sub.t === "event") {
    const day = m?.days[sub.day];
    return groundingVarsForPlay(s, sub.day, sub.eventIndex, day?.events.length ?? 1);
  }
  if (sub.t === "foot") {
    const dayIndex = 0;
    const day = m?.days[dayIndex];
    return groundingVarsForPlay(
      s,
      dayIndex,
      sub.index,
      s.footEvents?.length ?? day?.events.length ?? 1,
    );
  }
  const lastDay = Math.max((m?.days.length ?? 1) - 1, 0);
  return groundingVarsForPlay(
    s,
    lastDay,
    0,
    m?.days[lastDay]?.events.length ?? 1,
  );
}
