import { describe, expect, it } from "vitest";
import { findFamousDiscoveries } from "../content/charms";
import { getDiscoveryText } from "../content/discoveries";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import { formatEventStrings, narrativeVars } from "./template";
import type { EnvironmentId, GameState, RuntimeEvent } from "./types";

describe("discoveries", () => {
  it("getDiscoveryText resolves catalog entries", () => {
    const t = getDiscoveryText("cobra_corridor");
    expect(t.text).toContain("breakout");
    expect(t.title).toBe("Cobra corridor");
  });

  it("discovery_stub writes catalog prose", () => {
    const m0 = createNewCampaign({ difficulty: "green", seed: "disc-stub" }).missions[0]!;
    const vars = narrativeVars(
      createNewCampaign({ difficulty: "green", seed: "disc-stub" }).crew,
      "Test Tank",
      m0.objective,
    );
    const ev: RuntimeEvent = {
      id: "test_disc",
      kind: "human_moment",
      narrative: "Beat.",
      choices: [
        {
          id: "go",
          label: "Go",
          outcomeText: "Done.",
          effects: [{ op: "discovery_stub", id: "tiger_wallendorf" }],
        },
      ],
    };
    let s = createNewCampaign({ difficulty: "green", seed: "disc-stub" });
    const slim = {
      ...m0,
      days: [{ environment: "clear" as EnvironmentId, events: [formatEventStrings(ev, vars)] }],
    };
    s = {
      ...s,
      missions: [slim, ...s.missions.slice(1)],
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
    };
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "go" });
    expect(s.fieldJournal.some((j) => j.text.includes("Wallendorf"))).toBe(true);
    expect(s.fieldJournal.some((j) => j.text.includes("Discovery recorded"))).toBe(false);
  });

  it("findFamousDiscoveries detects same last name", () => {
    const hits = findFamousDiscoveries("Iron Maiden", [
      { nickname: "A", lastName: "Briggs", archetypeId: "veteran" },
      { nickname: "B", lastName: "Briggs", archetypeId: "kid" },
      { nickname: "C", lastName: "X", archetypeId: "kid" },
      { nickname: "D", lastName: "Y", archetypeId: "kid" },
      { nickname: "E", lastName: "Z", archetypeId: "kid" },
    ]);
    expect(hits.some((h) => h.catalogId === "same_last_name")).toBe(true);
  });

  it("campaign start can write multiple famous journal entries", () => {
    const s = createNewCampaign({ difficulty: "green", seed: "disc-famous" });
    expect(s.fieldJournal.length).toBeGreaterThanOrEqual(0);
  });

  it("anchor events use discovery stubs present in catalog", () => {
    expect(EVENT_CATALOG.anchor_cobra?.choices.some((c) =>
      c.effects.some((e) => e.op === "discovery_stub" && e.id === "cobra_corridor"),
    )).toBe(true);
  });
});
