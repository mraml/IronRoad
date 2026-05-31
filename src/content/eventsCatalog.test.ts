import { describe, expect, it } from "vitest";
import { RuntimeEventSchema } from "../engine/schema";
import { getDiscoveryText } from "./discoveries";
import { ANCHOR_IDS } from "./pools";
import {
  EVENT_CATALOG,
  FOOT_BEAT_IDS,
  GENERIC_POOL,
  GENERIC_POOL_TIER2,
  SOCIAL_BEAT_POOL,
} from "./eventsCatalog";
import {
  DEPTH_REQUIRED_KINDS,
  hasEncounterDepth,
  shouldDeferForFollowUp,
} from "../engine/encounterFlow";
import { usesTacticalEncounter } from "../engine/tacticalEncounter";
import { WAVE16_EVENTS } from "./wave16Events";
import { WAVE18_EVENTS } from "./wave18Events";
import { WAVE19_EVENTS } from "./wave19Events";

describe("eventsCatalog", () => {
  it("every catalog entry validates against RuntimeEventSchema", () => {
    for (const ev of Object.values(EVENT_CATALOG)) {
      RuntimeEventSchema.parse(ev);
    }
    expect(Object.keys(EVENT_CATALOG).length).toBeGreaterThanOrEqual(145);
    expect(GENERIC_POOL.length).toBeGreaterThanOrEqual(125);
    expect(GENERIC_POOL_TIER2.length).toBeGreaterThanOrEqual(55);
    expect(GENERIC_POOL.length + GENERIC_POOL_TIER2.length).toBeGreaterThanOrEqual(180);
    expect(ANCHOR_IDS.length).toBeGreaterThanOrEqual(20);
    expect(SOCIAL_BEAT_POOL.length).toBeGreaterThanOrEqual(20);
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
    expect(anchors).toBeGreaterThanOrEqual(20);
    expect(elites).toBeGreaterThanOrEqual(5);
  });

  it("discovery stubs resolve to catalog prose", () => {
    expect(getDiscoveryText("tiger_wallendorf").title).toBe("Wallendorf");
  });

  it("legendary npc event is in catalog and pool", () => {
    expect(EVENT_CATALOG.legendary_sergeant_york_moment?.id).toBe("legendary_sergeant_york_moment");
  });

  it("dice combat events expose choiceRisk and choiceHint on choices", () => {
    const combat = EVENT_CATALOG.gen_combat_tiger_lite!;
    expect(combat.stakes).toBe("critical");
    expect(combat.tierFlavor?.[1]).toBeTruthy();
    for (const ch of combat.choices) {
      expect(ch.choiceRisk).toBeTruthy();
    }
  });

  it("every GENERIC_POOL event has atmosphere after immersion patch", () => {
    for (const id of GENERIC_POOL) {
      const ev = EVENT_CATALOG[id];
      expect(ev, id).toBeTruthy();
      expect((ev?.atmosphere ?? "").length, id).toBeGreaterThanOrEqual(20);
    }
  });

  it("every foot beat is critical with at least three choices", () => {
    for (const id of FOOT_BEAT_IDS) {
      const ev = EVENT_CATALOG[id]!;
      expect(ev.stakes, id).toBe("critical");
      expect(ev.choices.length, id).toBeGreaterThanOrEqual(3);
    }
  });

  it("every Wave 16 catalog entry validates", () => {
    for (const ev of Object.values(WAVE16_EVENTS)) {
      RuntimeEventSchema.parse(ev);
    }
    expect(Object.keys(WAVE16_EVENTS).length).toBeGreaterThanOrEqual(45);
  });

  it("every Wave 18 catalog entry validates", () => {
    for (const ev of Object.values(WAVE18_EVENTS)) {
      RuntimeEventSchema.parse(ev);
    }
    expect(Object.keys(WAVE18_EVENTS).length).toBeGreaterThanOrEqual(25);
  });

  it("every Wave 19 catalog entry validates", () => {
    for (const ev of Object.values(WAVE19_EVENTS)) {
      RuntimeEventSchema.parse(ev);
    }
    expect(Object.keys(WAVE19_EVENTS).length).toBeGreaterThanOrEqual(20);
  });

  it("depth-required pool fillers have encounter depth or tactical loop after patch", () => {
    const poolIds = [...GENERIC_POOL, ...GENERIC_POOL_TIER2];
    let checked = 0;
    for (const id of poolIds) {
      const ev = EVENT_CATALOG[id];
      if (!ev || !DEPTH_REQUIRED_KINDS.includes(ev.kind)) continue;
      checked++;
      const ok = hasEncounterDepth(ev) || usesTacticalEncounter(ev);
      expect(ok, `missing depth: ${id}`).toBe(true);
    }
    expect(checked).toBeGreaterThanOrEqual(100);
  });

  it("tactical events with authored follow-ups do not defer to legacy follow-up path", () => {
    const ev = EVENT_CATALOG.gen_travel_fuel_cache!;
    expect(usesTacticalEncounter(ev)).toBe(true);
    const primary = ev.choices[0];
    expect(primary?.followUpChoices?.length).toBeGreaterThan(0);
    expect(shouldDeferForFollowUp(primary!, ev)).toBe(false);
  });

  it("Wave 19 anchor and elite events have immersion stakes after patch", () => {
    expect(EVENT_CATALOG.anchor_munster_rubble?.stakes).toBe("critical");
    expect(EVENT_CATALOG.elite_stug_hunt?.stakesNote?.length).toBeGreaterThan(10);
    expect(EVENT_CATALOG.gen_travel_fuel_cache?.stakesNote?.length).toBeGreaterThan(10);
  });

  it("pool combat events patched with choiceRisk on all choices", () => {
    for (const id of [
      "gen_combat_panther",
      "gen_combat_pak",
      "gen_combat_heat_round",
      "gen_combat_mortar",
    ] as const) {
      const ev = EVENT_CATALOG[id]!;
      for (const ch of ev.choices) {
        expect(ch.choiceRisk, `${id}/${ch.id}`).toBeTruthy();
      }
    }
  });
});
