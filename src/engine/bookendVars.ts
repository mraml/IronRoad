import { placeGridLabel } from "../content/areaEntries";
import { seasonForMissionIndex } from "./config";
import { deriveCampaignCalendar } from "./campaignCalendar";
import { buildSlideVars } from "./template";
import type { GameState } from "./types";

/** Template vars for campaign bookend slides (opener, milestone, epilogue). */
export function bookendVars(s: GameState, missionIndex = s.missionIndex) {
  const m = s.missions[missionIndex];
  const objective = m?.objective ?? "";
  const season = seasonForMissionIndex(missionIndex, s.missions.length);
  const cal = deriveCampaignCalendar({
    runSeed: s.runSeed,
    missionIndex,
    dayIndex: 0,
    eventIndex: 0,
    eventsInDay: m?.days[0]?.events.length ?? 1,
    seasonPhase: season,
  });
  return buildSlideVars(
    s.crew,
    s.tank.name,
    objective,
    season,
    cal.weekday,
    placeGridLabel(s.runSeed, missionIndex, 0),
    {
      dateLabel: cal.dateLabel,
      theater: "ETO 1944–45",
      missionNum: String(missionIndex + 1),
      missionsTotal: String(s.missions.length),
    },
  );
}
