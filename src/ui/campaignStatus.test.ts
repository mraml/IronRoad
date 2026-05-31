import { describe, expect, it } from "vitest";
import type { GameState, PlaySub } from "../engine/types";
import { buildCampaignStatus, deriveDayPhase, getSupplyAlerts } from "./campaignStatus";

function minimalGame(overrides: Partial<GameState> = {}): GameState {
  return {
    meta: { t: "play", sub: { t: "briefing", step: "narrative" } },
    difficulty: "veteran",
    missionIndex: 0,
    missions: [
      {
        title: "Breakout",
        objective: "Reach the bridge",
        briefingEvent: { id: "b", kind: "briefing", narrative: "", choices: [] },
        days: [
          {
            environment: "clear",
            events: [
              { id: "e1", kind: "travel", narrative: "", choices: [] },
              { id: "e2", kind: "travel", narrative: "", choices: [] },
              { id: "e3", kind: "travel", narrative: "", choices: [] },
              { id: "e4", kind: "travel", narrative: "", choices: [] },
            ],
          },
        ],
      },
    ],
    seasonPhase: "summer",
    resources: {
      foodDays: 5,
      waterCanteens: 4,
      ammoAP: 10,
      ammoHE: 10,
      ammoWP: 0,
      ammoHEAT: 0,
      smallArmsMags: 20,
      medkits: 2,
    },
    ...overrides,
  } as GameState;
}

describe("deriveDayPhase", () => {
  it("maps first beat to Dawn and last to Night on a four-beat day", () => {
    expect(deriveDayPhase(0, 4)).toBe("Dawn");
    expect(deriveDayPhase(3, 4)).toBe("Night");
  });

  it("returns Midday for a single-event day", () => {
    expect(deriveDayPhase(0, 1)).toBe("Midday");
  });
});

describe("getSupplyAlerts", () => {
  it("flags critical food and water at zero", () => {
    const game = minimalGame({
      resources: {
        foodDays: 0,
        waterCanteens: 0,
        ammoAP: 0,
        ammoHE: 0,
        ammoWP: 0,
        ammoHEAT: 0,
        smallArmsMags: 0,
        medkits: 0,
      },
    });
    const alerts = getSupplyAlerts(game);
    expect(alerts.some((a) => a.level === "critical" && a.message.includes("food"))).toBe(true);
    expect(alerts.some((a) => a.level === "critical" && a.message.includes("water"))).toBe(true);
  });
});

describe("buildCampaignStatus", () => {
  it("includes mission line and encounter progress during events", () => {
    const sub: PlaySub = { t: "event", day: 0, eventIndex: 1, step: "choose" };
    const v = buildCampaignStatus(minimalGame(), sub);
    expect(v.missionLine).toContain("Breakout");
    expect(v.beatLabel).toBe("Encounter 2 of 4");
    expect(v.timeOfDay).toBeTruthy();
    expect(v.weekday).toBeTruthy();
    expect(v.dateLabel).toMatch(/\d{1,2} \w{3}/);
    expect(v.season).toBe("Summer");
  });

  it("labels debrief and foot phases", () => {
    const debrief = buildCampaignStatus(minimalGame(), { t: "debrief", picksRemaining: 2 });
    expect(debrief.phaseLabel).toBe("Debrief");

    const foot = buildCampaignStatus(
      minimalGame({ footEvents: [{ id: "f1", kind: "travel", narrative: "", choices: [] }] }),
      { t: "foot", index: 0, step: "narrative" },
    );
    expect(foot.phaseLabel).toBe("On foot");
  });
});
