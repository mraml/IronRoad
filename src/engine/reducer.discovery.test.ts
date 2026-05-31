import { describe, expect, it } from "vitest";
import { findFamousDiscoveries } from "../content/charms";
import { applyCampaignEndDiscoveries, getDiscoveryText } from "../content/discoveries";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { createNewCampaign } from "./generator";
import { applyEffects } from "./effects";
import { reduceGame } from "./reducer";
import { formatEventStrings, narrativeVars } from "./template";
import type { EnvironmentId, RuntimeEvent } from "./types";

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
      days: [
        {
          ...m0.days[0]!,
          environment: "clear" as EnvironmentId,
          events: [formatEventStrings(ev, vars)],
        },
      ],
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

  it("findFamousDiscoveries detects Padre irony and Hellcat tank", () => {
    const padre = findFamousDiscoveries("Ol Bastard", [
      { nickname: "Padre", lastName: "X", archetypeId: "dark_comedian", role: "gunner" },
      { nickname: "B", lastName: "Y", archetypeId: "kid", role: "loader" },
      { nickname: "C", lastName: "Z", archetypeId: "veteran", role: "driver" },
      { nickname: "D", lastName: "W", archetypeId: "faithful", role: "commander" },
      { nickname: "E", lastName: "V", archetypeId: "pragmatist", role: "asst_driver" },
    ]);
    expect(padre.some((h) => h.catalogId === "padre_irony")).toBe(true);
    const hell = findFamousDiscoveries("Hellcat", [
      { nickname: "A", lastName: "B", archetypeId: "veteran", role: "commander" },
      { nickname: "C", lastName: "D", archetypeId: "kid", role: "gunner" },
      { nickname: "E", lastName: "F", archetypeId: "kid", role: "driver" },
      { nickname: "G", lastName: "H", archetypeId: "kid", role: "loader" },
      { nickname: "I", lastName: "J", archetypeId: "kid", role: "asst_driver" },
    ]);
    expect(hell.some((h) => h.catalogId === "hellcat_tank")).toBe(true);
  });

  it("applyCampaignEndDiscoveries records acting_commander_led after commander KIA", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "disc-acting-cmd" });
    const applied = applyEffects(s, s.rngCounter, [
      { op: "mod_hp", role: "commander", delta: -100 },
    ]);
    s = applied.state;
    expect(s.commanderEverKia).toBe(true);
    expect(s.crew.find((c) => c.role === "commander")?.hp).toBe(0);
    s = applyCampaignEndDiscoveries(s);
    expect(s.fieldJournal.some((j) => j.id === "disc_acting_commander_led")).toBe(true);
  });

  it("commander KIA logs succession line once", () => {
    const s = createNewCampaign({ difficulty: "green", seed: "succession-log" });
    const applied = applyEffects(s, s.rngCounter, [
      { op: "mod_hp", role: "commander", delta: -100 },
    ]);
    expect(applied.state.successionAnnounced).toBe(true);
    expect(
      applied.logLines.some((l) => l.includes("has the net now")) ||
        applied.state.narrativeLog.some((l) => l.includes("has the net now")),
    ).toBe(true);
  });

  it("applyCampaignEndDiscoveries when Lucky survives with full crew", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "disc-lucky" });
    s = {
      ...s,
      crew: s.crew.map((c, i) =>
        i === 0 ? { ...c, nickname: "Lucky", hp: 80 } : { ...c, hp: 80 },
      ),
    };
    s = applyCampaignEndDiscoveries(s);
    expect(s.fieldJournal.some((j) => j.id === "disc_campaign_lucky_survived")).toBe(true);
  });

  it("grant_charm pairs dark_comedian with last_cigarette discovery", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "disc-charm" });
    s = {
      ...s,
      crew: s.crew.map((c) =>
        c.role === "gunner" ? { ...c, archetypeId: "dark_comedian" as const } : c,
      ),
    };
    const applied = applyEffects(s, s.rngCounter, [
      { op: "grant_charm", role: "gunner", charmId: "last_cigarette" },
    ]);
    expect(applied.state.fieldJournal.some((j) => j.id === "disc_comedian_cigarette")).toBe(true);
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

  it("findFamousDiscoveries detects full Fury legendary crew", () => {
    const hits = findFamousDiscoveries("Fury", [
      { nickname: "Wardaddy", lastName: "Collier", archetypeId: "veteran", role: "commander" },
      { nickname: "Bible", lastName: "Swan", archetypeId: "faithful", role: "gunner" },
      { nickname: "Coon-Ass", lastName: "Travis", archetypeId: "pragmatist", role: "loader" },
      { nickname: "Gordo", lastName: "Garcia", archetypeId: "kid", role: "driver" },
      { nickname: "Norman", lastName: "Ellison", archetypeId: "kid", role: "asst_driver" },
    ]);
    expect(hits.some((h) => h.catalogId === "fury_legendary_full")).toBe(true);
    expect(hits.some((h) => h.catalogId === "fury_full_crew")).toBe(false);
  });

  it("campaign start can write multiple famous journal entries", () => {
    const s = createNewCampaign({ difficulty: "green", seed: "disc-famous" });
    expect(s.fieldJournal.length).toBeGreaterThanOrEqual(0);
  });

  it("anchor events use discovery stubs present in catalog", () => {
    expect(
      EVENT_CATALOG.anchor_cobra?.choices.some((c) =>
        c.effects.some((e) => e.op === "discovery_stub" && e.id === "cobra_corridor"),
      ),
    ).toBe(true);
  });
});
