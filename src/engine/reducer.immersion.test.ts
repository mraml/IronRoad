import { describe, expect, it } from "vitest";
import { applyImmersion } from "../content/immersion";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import { formatEventStrings, narrativeVars } from "./template";
import type { EnvironmentId, GameState, RuntimeEvent } from "./types";

function installDiceEvent(s: GameState, ev: RuntimeEvent): GameState {
  const m0 = s.missions[0]!;
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

describe("narrative immersion", () => {
  it("catalog anchors and elites have stakes and stakesNote after patch", () => {
    for (const ev of Object.values(EVENT_CATALOG)) {
      if (ev.kind !== "historical_anchor" && ev.kind !== "elite_encounter") continue;
      expect(ev.stakes, ev.id).toBe("critical");
      expect(ev.stakesNote, ev.id).toBeTruthy();
      if (ev.useDice) expect(ev.tierFlavor?.[1], ev.id).toBeTruthy();
    }
  });

  it("choiceHint does not change mechanics", () => {
    const base = EVENT_CATALOG.gen_combat_tiger_lite!;
    expect(base.choices[0]?.choiceHint).toBeTruthy();
    let s = createNewCampaign({ difficulty: "green", seed: "immersion-hint" });
    const m0 = s.missions[0]!;
    const vars = narrativeVars(s.crew, s.tank.name, m0.objective);
    const ev = formatEventStrings(structuredClone(base), vars);
    s = installDiceEvent(s, ev);
    const hullBefore = s.tank.healthPct;
    const choiceId = ev.choices[0]!.id;
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId });
    expect(s.tank.healthPct).toBeLessThanOrEqual(hullBefore);
  });

  it("tierFlavor appends on dice outcome", () => {
    const raw = applyImmersion(
      {
        id: "test_tier",
        kind: "tank_combat",
        useDice: true,
        narrative: "Contact.",
        tierFlavor: { 1: "Disaster line.", 4: "Clean line." },
        choices: [
          {
            id: "a",
            label: "Fight",
            role: "gunner",
            modifierBonus: 10,
            outcomeText: "Base outcome.",
            effects: [],
          },
        ],
      },
      "test_tier",
    );
    let s = createNewCampaign({ difficulty: "green", seed: "immersion-tier" });
    s = installDiceEvent(s, raw);
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: "a" });
    expect(s.pendingOutcome?.displayText).toContain("Base outcome.");
    expect(s.pendingOutcome?.displayText).toMatch(/Disaster line\.|Clean line\./);
  });
});
