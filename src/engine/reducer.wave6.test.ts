import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { createNewCampaign, injectSeededFollowUps } from "./generator";
import { reduceGame } from "./reducer";
import { resolveChoiceToOutcome } from "./testHelpers";
import { formatEventStrings, narrativeVars } from "./template";
import type { EnvironmentId, GameState } from "./types";

/** Single-day mission with one catalog event, at combat choose step. */
function installEvent(s: GameState, evId: string): GameState {
  const m0 = s.missions[0]!;
  const vars = narrativeVars(s.crew, s.tank.name, m0.objective);
  const ev = formatEventStrings(structuredClone(EVENT_CATALOG[evId]!), vars);
  const slimMission = {
    ...m0,
    days: [{ ...m0.days[0]!, environment: "clear" as EnvironmentId, events: [ev] }],
  };
  return {
    ...s,
    missions: [slimMission, ...s.missions.slice(1)],
    meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
  };
}

describe("wave 6 mechanics", () => {
  it("trauma and scar penalties appear on combat dice modifiers", () => {
    let s = createNewCampaign({ difficulty: "veteran", seed: "w6-trauma" });
    s = installEvent(s, "gen_combat_panther");
    const crew = s.crew.map((c) =>
      c.role === "gunner"
        ? {
            ...c,
            traumaStates: [...c.traumaStates, "shellshocked" as import("./types").TraumaStateId],
            scars: [{ text: "test wound", rolePenalty: 2 }],
          }
        : c,
    );
    s = { ...s, crew };
    s = resolveChoiceToOutcome(s, "flank_ap");
    const mods = s.pendingOutcome?.dice?.modifiers ?? [];
    expect(mods.some((m) => m.label === "Shellshocked")).toBe(true);
    expect(mods.some((m) => m.label === "Old wounds")).toBe(true);
  });

  it("loader doctrine adds +1 when recommended before an ideal-ammo shot", () => {
    let s = createNewCampaign({ difficulty: "veteran", seed: "w6-doctrine" });
    s = installEvent(s, "gen_combat_panther");
    s = reduceGame(s, { type: "SET_LOADER_AMMO_DOCTRINE", useRecommended: true });
    expect(s.loaderAmmoDoctrineBonus).toBe(1);
    s = resolveChoiceToOutcome(s, "flank_ap");
    const mods = s.pendingOutcome?.dice?.modifiers ?? [];
    expect(mods.some((m) => m.label === "Loader doctrine")).toBe(true);
  });

  it("attrition drains crew when food is out after an event resolves", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "w6-attr" });
    s = installEvent(s, "gen_human_letters");
    s = { ...s, resources: { ...s.resources, foodDays: 0, waterCanteens: 6 } };
    const hpBefore = s.crew.map((c) => c.hp);
    s = resolveChoiceToOutcome(s, "pocket");
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") throw new Error("expected event");
    expect(s.meta.sub.step).toBe("outcome");
    s = reduceGame(s, { type: "OUTCOME_CONTINUE" });
    expect(s.narrativeLog.some((l) => l.includes("ration"))).toBe(true);
    const hpAfter = s.crew.map((c) => c.hp);
    expect(hpAfter.some((hp, i) => hp < hpBefore[i]!)).toBe(true);
  });

  it("injectSeededFollowUps appends follow-up for a known flag", () => {
    const s = createNewCampaign({ difficulty: "green", seed: "w6-seed" });
    const m0 = s.missions[0]!;
    const patched = injectSeededFollowUps(
      m0,
      ["rhine_crossing_logistics"],
      s.crew,
      s.tank.name,
      s.runSeed,
      0,
      s.seasonPhase,
    );
    expect(patched.days[0]!.events.some((e) => e.id === "followup_rhine_logistics")).toBe(true);
  });

  it("medkit heal in debrief consumes a medkit and raises HP", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "w6-med" });
    const crew = s.crew.map((c) => (c.role === "gunner" ? { ...c, hp: 40 } : c));
    s = {
      ...s,
      crew,
      resources: { ...s.resources, medkits: 2 },
      meta: { t: "play", sub: { t: "debrief", picksRemaining: 3 } },
    };
    s = reduceGame(s, { type: "USE_MEDKIT", target: "gunner" });
    expect(s.resources.medkits).toBe(1);
    const gunner = s.crew.find((c) => c.role === "gunner")!;
    expect(gunner.hp).toBeGreaterThan(40);
  });

  it("field journal entries survive LOAD_STATE", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "w6-journal" });
    const beforeLen = s.fieldJournal.length;
    s = installEvent(s, "gen_combat_panther");
    s = resolveChoiceToOutcome(s, "flank_ap");
    expect(s.fieldJournal.length).toBeGreaterThan(beforeLen);
    const snapshot = structuredClone(s);
    const round = reduceGame(s, { type: "LOAD_STATE", state: snapshot });
    expect(round.fieldJournal).toEqual(snapshot.fieldJournal);
  });
});
