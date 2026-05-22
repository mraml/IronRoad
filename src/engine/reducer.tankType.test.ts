import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { TANK_TYPE_PROFILES } from "./config";
import { applyEffects } from "./effects";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import { formatEventStrings, narrativeVars } from "./template";
import type { EnvironmentId, GameState, TankType } from "./types";

function installEvent(s: GameState, evId: string): GameState {
  const m0 = s.missions[0]!;
  const vars = narrativeVars(s.crew, s.tank.name, m0.objective);
  const ev = formatEventStrings(structuredClone(EVENT_CATALOG[evId]!), vars);
  const slimMission = {
    ...m0,
    days: [{ environment: "clear" as EnvironmentId, events: [ev] }],
  };
  return {
    ...s,
    missions: [slimMission, ...s.missions.slice(1)],
    meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
  };
}

function campaignWithTank(tankType: TankType, seed: string): GameState {
  let s = createNewCampaign({ difficulty: "veteran", seed });
  s = { ...s, meta: { t: "pick_tank" } };
  return reduceGame(s, { type: "PICK_TANK", tankType });
}

describe("wave 10 tank type and posture", () => {
  it("PICK_TANK applies spec hull percentages", () => {
    const churchill = campaignWithTank("churchill", "t10-hull");
    expect(churchill.tank.healthPct).toBe(TANK_TYPE_PROFILES.churchill.startHealthPct);
    const t34 = campaignWithTank("t34", "t10-hull2");
    expect(t34.tank.healthPct).toBe(65);
  });

  it("Churchill mitigates random component hits; Sherman does not", () => {
    const countAbsorbed = (s: GameState, trials: number) => {
      let absorbed = 0;
      let state = s;
      let rng = state.rngCounter;
      for (let i = 0; i < trials; i++) {
        const r = applyEffects(state, rng, [{ op: "damage_random_component" }]);
        state = r.state;
        rng = r.rngCounter;
        if (r.logLines.some((l) => l.includes("Hit absorbed"))) absorbed++;
      }
      return absorbed;
    };
    expect(countAbsorbed(campaignWithTank("sherman", "t10-comp-s"), 40)).toBe(0);
    let churchillAbsorbed = 0;
    for (let i = 0; i < 20 && churchillAbsorbed === 0; i++) {
      churchillAbsorbed = countAbsorbed(campaignWithTank("churchill", `t10-comp-c-${i}`), 40);
    }
    expect(churchillAbsorbed).toBeGreaterThan(0);
  });

  it("Churchill driver gets Slow hull mod on travel dice events", () => {
    let s = campaignWithTank("churchill", "t10-travel");
    s = installEvent(s, "gen_travel_mine");
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "probe" });
    const mods = s.pendingOutcome?.dice?.modifiers ?? [];
    expect(mods.some((m) => m.label === "Slow hull" && m.value === -1)).toBe(true);
  });

  it("T-34 gunner gets Low silhouette mod on tank combat", () => {
    let s = campaignWithTank("t34", "t10-tank");
    s = installEvent(s, "gen_combat_panther");
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "flank_ap" });
    const mods = s.pendingOutcome?.dice?.modifiers ?? [];
    expect(mods.some((m) => m.label === "Low silhouette" && m.value === 1)).toBe(true);
  });

  it("defensive stand adds sustained-stress constitution drain and log line", () => {
    let s = createNewCampaign({ difficulty: "veteran", seed: "t10-def" });
    s = installEvent(s, "gen_defensive_wave");
    const conBefore = s.crew[0]!.constitution;
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "hold_fire" });
    expect(s.narrativeLog.some((l) => l.includes("grinds the crew down"))).toBe(true);
    const conAfter = s.crew[0]!.constitution;
    expect(conAfter).toBeLessThan(conBefore);
  });

  it("offensive assault grants bonus salvage on strong dice tier", () => {
    let found = false;
    for (let i = 0; i < 60; i++) {
      let s = createNewCampaign({ difficulty: "green", seed: `t10-off-${i}` });
      s = installEvent(s, "gen_offensive_push");
      const salvBefore = s.salvagePoints;
      s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "support_by_fire" });
      const tier = s.pendingOutcome?.dice?.tier;
      if (tier !== undefined && tier >= 3) {
        expect(s.salvagePoints).toBeGreaterThan(salvBefore);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});
