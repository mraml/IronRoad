import { describe, expect, it } from "vitest";
import { slidesForArchetype } from "./missionBriefs";
import { createNewCampaign } from "../engine/generator";

describe("missionBriefs", () => {
  it("attack archetype has two slides with narrative", () => {
    const slides = slidesForArchetype("attack", "autumn");
    expect(slides.length).toBeGreaterThanOrEqual(2);
    expect(slides[0]?.narrative.length).toBeGreaterThan(80);
    expect(slides[0]?.sensoryFocus).toBeTruthy();
  });

  it("new campaigns include mission brief pages and area entries", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "mb-pages" });
    const m = game.missions[0]!;
    expect(m.missionBriefPages.length).toBeGreaterThanOrEqual(3);
    expect(m.briefingArchetype).toBeTruthy();
    expect(m.days[0]?.areaEntry.placeName.length).toBeGreaterThan(5);
    expect(m.days[0]?.areaEntry.narrative.length).toBeGreaterThan(40);
  });
});
