import { describe, expect, it } from "vitest";
import { drawPersonalObjective, evaluateHiddenObjective } from "./personalObjectives";
import { createNewCampaign } from "../engine/generator";

describe("personalObjectives", () => {
  it("draws deterministic objective from seed", () => {
    const crew = createNewCampaign({ difficulty: "green", seed: "obj-draw" }).crew;
    const a = drawPersonalObjective("obj-draw", 0, crew);
    const b = drawPersonalObjective("obj-draw", 0, crew);
    expect(a.def.id).toBe(b.def.id);
  });

  it("evaluates no_wp when wp not used", () => {
    const s = createNewCampaign({ difficulty: "green", seed: "obj-wp" });
    const check = evaluateHiddenObjective({
      ...s,
      hiddenObjective: { id: "no_wp", met: false },
      missionTrackers: { wpUsed: false },
    });
    expect(check).toBe(true);
  });
});
