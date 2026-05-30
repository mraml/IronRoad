import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import type { GameState } from "./types";

function installEvent(s: GameState, id: string): GameState {
  const m = s.missions[s.missionIndex]!;
  const ev = structuredClone(m.days[0]!.events[0]!);
  ev.id = id;
  const days = [{ ...m.days[0]!, events: [ev] }];
  const missions = s.missions.map((mi, i) =>
    i === s.missionIndex ? { ...mi, days } : mi,
  );
  return {
    ...s,
    missions,
    meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
  };
}

describe("trauma v2", () => {
  it("checked_out blocks crew support", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "trauma-support" });
    s = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
    s = { ...s, meta: { t: "play", sub: { t: "day_intro", day: 0 } } };
    s = {
      ...s,
      crew: s.crew.map((c) =>
        c.role === "loader"
          ? { ...c, traumaStates: [...c.traumaStates, "checked_out"] }
          : c,
      ),
    };
    const before = s.narrativeLog.length;
    s = reduceGame(s, { type: "CREW_SUPPORT", supporter: "loader", target: "gunner" });
    expect(s.narrativeLog.length).toBe(before);
  });

  it("numb blocks positive constitution from rest debrief", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "trauma-numb" });
    s = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
    s = {
      ...s,
      crew: s.crew.map((c) => ({
        ...c,
        traumaStates: [...c.traumaStates, "numb"],
        constitution: 40,
      })),
      meta: { t: "play", sub: { t: "debrief", picksRemaining: 2 } },
    };
    s = reduceGame(s, { type: "DEBRIEF_ACTION", action: "rest" });
    expect(s.crew[0]!.constitution).toBe(40);
  });

  it("jumpy forces erratic choice on next event", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "trauma-jumpy" });
    s = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
    s = { ...s, meta: { t: "play", sub: { t: "day_intro", day: 0 } } };
    s = installEvent(s, "gen_supply_parts_crate");
    const ev = s.missions[s.missionIndex]!.days[0]!.events[0]!;
    const driverChoice = ev.choices.find((c) => c.role === "driver")!;
    s = {
      ...s,
      jumpyPendingRole: "driver",
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
    };
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: driverChoice.id });
    expect(s.pendingOutcome?.displayText).toMatch(/flinches|muscle memory/i);
    expect(s.jumpyPendingRole).toBeUndefined();
  });
});
