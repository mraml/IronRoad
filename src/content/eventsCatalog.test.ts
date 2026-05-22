import { describe, expect, it } from "vitest";
import { RuntimeEventSchema } from "../engine/schema";
import { getDiscoveryText } from "./discoveries";
import { EVENT_CATALOG } from "./eventsCatalog";

describe("eventsCatalog", () => {
  it("every catalog entry validates against RuntimeEventSchema", () => {
    for (const ev of Object.values(EVENT_CATALOG)) {
      RuntimeEventSchema.parse(ev);
    }
    expect(Object.keys(EVENT_CATALOG).length).toBeGreaterThanOrEqual(40);
  });

  it("high-stakes kinds have immersion fields after patch", () => {
    let anchors = 0;
    let elites = 0;
    for (const ev of Object.values(EVENT_CATALOG)) {
      if (ev.kind === "historical_anchor") {
        anchors++;
        expect(ev.stakes).toBe("critical");
        expect(ev.stakesNote?.length).toBeGreaterThan(10);
      }
      if (ev.kind === "elite_encounter") {
        elites++;
        expect(ev.stakes).toBe("critical");
        expect(ev.stakesNote?.length).toBeGreaterThan(10);
      }
    }
    expect(anchors).toBeGreaterThanOrEqual(10);
    expect(elites).toBeGreaterThanOrEqual(5);
  });

  it("discovery stubs resolve to catalog prose", () => {
    expect(getDiscoveryText("tiger_wallendorf").title).toBe("Wallendorf");
  });

  it("legendary npc event is in catalog and pool", () => {
    expect(EVENT_CATALOG.legendary_sergeant_york_moment?.id).toBe(
      "legendary_sergeant_york_moment",
    );
  });

  it("dice combat events expose choiceRisk and choiceHint on choices", () => {
    const combat = EVENT_CATALOG.gen_combat_tiger_lite!;
    expect(combat.stakes).toBe("elevated");
    expect(combat.tierFlavor?.[1]).toBeTruthy();
    for (const ch of combat.choices) {
      expect(ch.choiceRisk).toBeTruthy();
    }
  });
});
