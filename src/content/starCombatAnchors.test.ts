import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import {
  CURATED_COMBAT_ANCHORS_PROSE,
  combatAnchorsPoolIds,
  combatPoolIds,
} from "./starCombatAnchorsProsePatch";
import { ANCHOR_IDS } from "./pools";

describe("starCombatAnchorsProsePatch", () => {
  it("curated map covers all anchors and most combat-family pool ids", () => {
    const pool = combatPoolIds();
    const curated = new Set(Object.keys(CURATED_COMBAT_ANCHORS_PROSE));
    const poolCovered = pool.filter((id) => curated.has(id));
    const anchorsCovered = ANCHOR_IDS.filter((id) => curated.has(id));
    expect(pool.length).toBeGreaterThanOrEqual(70);
    expect(poolCovered.length / pool.length).toBeGreaterThan(0.85);
    expect(anchorsCovered.length).toBe(ANCHOR_IDS.length);
  });

  it("combatAnchorsPoolIds includes pool and anchors", () => {
    const ids = combatAnchorsPoolIds();
    expect(ids).toContain("gen_combat_panther");
    expect(ids).toContain("anchor_bulge");
    expect(new Set(ids).size).toBeGreaterThanOrEqual(90);
  });

  it("curated panther beat has two STAR paragraphs after patch", () => {
    const ev = EVENT_CATALOG.gen_combat_panther!;
    expect(ev.narrative.split("\n\n").length).toBe(2);
    expect(ev.narrative).toContain("{objective}");
  });
});
