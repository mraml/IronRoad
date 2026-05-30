import { pickBriefingPlace, pickBrieferForMission } from "../content/briefers";
import { placeGridLabel } from "../content/areaEntries";
import type { CrewMember, MissionBriefArchetype, SeasonPhase } from "./types";
import { seasonForMissionIndex } from "./config";
import { deriveCampaignCalendar } from "./campaignCalendar";
import { buildSlideVars } from "./template";

/** Shared template vars for mission bookend slides and interactive briefing. */
export function missionNarrativeVars(args: {
  runSeed: string;
  missionIndex: number;
  totalMissions: number;
  archetype: MissionBriefArchetype;
  crew: CrewMember[];
  tankName: string;
  objective: string;
}): ReturnType<typeof buildSlideVars> {
  const season = seasonForMissionIndex(args.missionIndex, args.totalMissions);
  const placeGrid = placeGridLabel(args.runSeed, args.missionIndex, 0);
  const cal = deriveCampaignCalendar({
    runSeed: args.runSeed,
    missionIndex: args.missionIndex,
    dayIndex: 0,
    eventIndex: 0,
    eventsInDay: 1,
    seasonPhase: season,
  });
  const briefer = pickBrieferForMission(args.runSeed, args.missionIndex, args.archetype);
  const briefingPlace = pickBriefingPlace(args.runSeed, args.missionIndex).replace(
    "{placeGrid}",
    placeGrid,
  );
  return buildSlideVars(
    args.crew,
    args.tankName,
    args.objective,
    season,
    cal.weekday,
    placeGrid,
    {
      dateLabel: cal.dateLabel,
      theater: "ETO 1944–45",
      missionNum: String(args.missionIndex + 1),
      missionsTotal: String(args.totalMissions),
      briefer,
      briefingPlace,
    },
  );
}
