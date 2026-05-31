import { describe, expect, it } from "vitest";
import { pickDayLocation } from "./dayLocations";
import { substituteTemplate } from "../engine/template";

describe("dayLocations", () => {
  it("pickDayLocation is deterministic for the same seed", () => {
    const a = pickDayLocation("seed-a", 0, 1, 0, "attack", "clear", "summer");
    const b = pickDayLocation("seed-a", 0, 1, 0, "attack", "clear", "summer");
    expect(a.pick.kind).toBe(b.pick.kind);
    expect(a.pick.placeGrid).toBe(b.pick.placeGrid);
  });

  it("substitutes placeGrid into location templates", () => {
    const { pick } = pickDayLocation("seed-b", 5, 0, 1, "patrol", "heavy_rain", "autumn");
    const placeName = substituteTemplate(pick.template.placeName, { placeGrid: pick.placeGrid });
    expect(placeName).not.toContain("{placeGrid}");
    expect(placeName).toMatch(/\d{3}/);
  });

  it("biases river crossing in heavy rain", () => {
    let riverHits = 0;
    for (let i = 0; i < 40; i++) {
      const { pick } = pickDayLocation(`rain-${i}`, 0, 0, 0, "generic", "heavy_rain", "spring");
      if (pick.kind === "river_crossing") riverHits++;
    }
    expect(riverHits).toBeGreaterThan(0);
  });
});
