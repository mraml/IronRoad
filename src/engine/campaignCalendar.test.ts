import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";
import {
  assertEnvPoolsMatchSeasonMatrix,
  deriveCampaignCalendar,
  deriveDayPhase,
  isEnvironmentValidForSeason,
} from "./campaignCalendar";
import { seasonForMissionIndex } from "./config";

describe("campaignCalendar", () => {
  it("deriveDayPhase maps beat index across a day", () => {
    expect(deriveDayPhase(0, 4)).toBe("Dawn");
    expect(deriveDayPhase(3, 4)).toBe("Night");
  });

  it("deriveCampaignCalendar is stable for fixed inputs", () => {
    const a = deriveCampaignCalendar({
      runSeed: "cal-stable",
      missionIndex: 2,
      dayIndex: 1,
      eventIndex: 2,
      eventsInDay: 4,
      seasonPhase: "winter",
    });
    const b = deriveCampaignCalendar({
      runSeed: "cal-stable",
      missionIndex: 2,
      dayIndex: 1,
      eventIndex: 2,
      eventsInDay: 4,
      seasonPhase: "winter",
    });
    expect(a).toEqual(b);
    expect(a.dateLabel).toMatch(/^\d{1,2} (Dec|Jan|Feb)$/);
  });

  it("summer calendar months never use winter month tokens", () => {
    for (let i = 0; i < 20; i++) {
      const cal = deriveCampaignCalendar({
        runSeed: `summer-cal-${i}`,
        missionIndex: 0,
        dayIndex: 0,
        eventIndex: 0,
        eventsInDay: 3,
        seasonPhase: "summer",
      });
      expect(cal.dateLabel).not.toMatch(/Dec|Jan|Feb/);
    }
  });

  it("ENV_POOL matches authoritative season matrix", () => {
    assertEnvPoolsMatchSeasonMatrix();
  });

  it("blizzard is winter-only in the matrix", () => {
    expect(isEnvironmentValidForSeason("blizzard", "winter")).toBe(true);
    expect(isEnvironmentValidForSeason("blizzard", "summer")).toBe(false);
    expect(isEnvironmentValidForSeason("scorching_heat", "summer")).toBe(true);
    expect(isEnvironmentValidForSeason("scorching_heat", "winter")).toBe(false);
  });

  it("generated campaigns never assign cross-season environments", () => {
    const g = createNewCampaign({ difficulty: "fury", seed: "season-env-w17" });
    for (let mi = 0; mi < g.missions.length; mi++) {
      const season = seasonForMissionIndex(mi, g.missions.length);
      for (const day of g.missions[mi]!.days) {
        expect(isEnvironmentValidForSeason(day.environment, season), day.environment).toBe(
          true,
        );
      }
    }
  });
});
