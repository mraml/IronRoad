import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";

describe("generator grounding", () => {
  it("formats pool events with per-day place and per-event timeOfDay", () => {
    const state = createNewCampaign({
      seed: "grounding-test-seed",
      difficulty: "green",
    });
    const day0 = state.missions[0]?.days[0];
    expect(day0?.dayGrounding?.placeName.length).toBeGreaterThan(5);
    expect(day0?.areaEntry.placeName).toBe(day0?.dayGrounding?.placeName);

    const events = day0?.events ?? [];
    if (events.length >= 2) {
      const first = events[0]!.narrative;
      const last = events[events.length - 1]!.narrative;
      expect(first).not.toMatch(/\{place\b|\{weather\b|\{timeOfDay\b/);
      if (events.length > 1) {
        expect(first).not.toEqual(last);
      }
    }
  });
});
