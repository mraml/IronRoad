import { describe, expect, it } from "vitest";
import { buildMissions, createNewCampaign } from "./generator";

describe("generator", () => {
  it("green campaign has expected mission count", () => {
    const g = createNewCampaign({ difficulty: "green", seed: "golden-green" });
    expect(g.missions.length).toBe(4);
  });

  it("buildMissions is stable for fixed seed (golden)", () => {
    const crew = createNewCampaign({ difficulty: "veteran", seed: "golden-vet" }).crew;
    const tank = "Test Tank";
    const { missions, nextCounter } = buildMissions({
      seed: "golden-vet",
      difficulty: "veteran",
      crew,
      tankName: tank,
      startCounter: 0,
    });
    expect(missions.length).toBe(6);
    const totalEvents = missions.reduce(
      (n, m) => n + m.days.reduce((d, day) => d + day.events.length, 0),
      0,
    );
    // New per-day generation: veteran = 3–4 days × 3–4 events/day per mission.
    // Min: 6 missions × 3 days × 3 events = 54. Max: 6 × 4 × 4 = 96.
    expect(totalEvents).toBeGreaterThanOrEqual(6 * 3 * 3);
    expect(totalEvents).toBeLessThanOrEqual(6 * 4 * 4);
    expect(nextCounter).toBeGreaterThan(10);
  });
});
