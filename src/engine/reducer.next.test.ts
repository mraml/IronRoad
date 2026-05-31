import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import { formatEventStrings, narrativeVars } from "./template";
import type { EnvironmentId, GameState, RuntimeEvent } from "./types";

function installEvents(s: GameState, evIds: string[]): GameState {
  const m0 = s.missions[0]!;
  const vars = narrativeVars(s.crew, s.tank.name, m0.objective);
  const events = evIds.map((id) => formatEventStrings(structuredClone(EVENT_CATALOG[id]!), vars));
  const slimMission = {
    ...m0,
    days: [{ ...m0.days[0]!, environment: "clear" as EnvironmentId, events }],
  };
  return {
    ...s,
    missions: [slimMission, ...s.missions.slice(1)],
    meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
  };
}

function installLethalEvent(s: GameState): GameState {
  const m0 = s.missions[0]!;
  const ev: RuntimeEvent = {
    id: "test_lethal",
    kind: "infantry_combat",
    useDice: false,
    narrative: "Contact.",
    choices: [
      {
        id: "kill_gunner",
        label: "Take the hit",
        outcomeText: "Gunner goes down.",
        effects: [{ op: "mod_hp", role: "gunner", delta: -100 }],
      },
    ],
  };
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

describe("next steps mechanics", () => {
  it("driver terrain read sets preview once per mission", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "next-driver" });
    s = installEvents(s, ["gen_travel_fork", "gen_human_letters"]);
    s = reduceGame(s, { type: "USE_ROLE_ABILITY", role: "driver" });
    expect(s.terrainPreviewHint).toMatch(/Terrain Read:/);
    expect(s.crew.find((c) => c.role === "driver")?.roleAbilityUsed).toBe(true);
    const hint = s.terrainPreviewHint;
    s = reduceGame(s, { type: "USE_ROLE_ABILITY", role: "driver" });
    expect(s.terrainPreviewHint).toBe(hint);
  });

  it("asst driver suppressing fire pins AT for infantry beat", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "next-asst" });
    s = installEvents(s, ["gen_infantry_treeline"]);
    s = reduceGame(s, { type: "USE_ROLE_ABILITY", role: "asst_driver" });
    expect(s.atSuppressed).toBe(true);
    expect(s.crew.find((c) => c.role === "asst_driver")?.roleAbilityUsed).toBe(true);
  });

  it("role ability flags reset between missions", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "next-reset" });
    s = installEvents(s, ["gen_travel_fork", "gen_human_letters"]);
    s = reduceGame(s, { type: "USE_ROLE_ABILITY", role: "driver" });
    s = {
      ...s,
      meta: { t: "play", sub: { t: "between_missions" } },
    };
    s = reduceGame(s, { type: "BETWEEN_MISSIONS_CONTINUE" });
    expect(s.crew.every((c) => !c.roleAbilityUsed)).toBe(true);
  });

  it("rare charm moment fires when crew dies on the beat", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "next-charm-death" });
    s = installLethalEvent(s);
    s = {
      ...s,
      crew: s.crew.map((c) => (c.role === "commander" ? { ...c, charmId: "ace_of_spades" } : c)),
    };
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "kill_gunner" });
    s = reduceGame(s, { type: "OUTCOME_CONTINUE" });
    expect(s.narrativeLog.some((l) => l.includes("turns the") && l.includes("Nobody has to"))).toBe(
      true,
    );
  });

  it("elite charm writes a mission-complete journal entry", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "next-charm-mission" });
    s = {
      ...s,
      crew: s.crew.map((c) => (c.role === "commander" ? { ...c, charmId: "fury_pennant" } : c)),
      meta: { t: "play", sub: { t: "debrief", picksRemaining: 1 } },
    };
    const before = s.fieldJournal.length;
    s = reduceGame(s, { type: "DEBRIEF_ACTION", action: "resupply" });
    expect(s.fieldJournal.length).toBeGreaterThan(before);
    expect(s.fieldJournal.some((j) => j.id.startsWith("fj_charm_mission_"))).toBe(true);
  });
});
