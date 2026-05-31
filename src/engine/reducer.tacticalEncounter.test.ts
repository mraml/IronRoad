import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { choicesForEncounterStep } from "./encounterFlow";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import {
  initialThreat,
  threatShiftForTier,
  usesTacticalEncounter,
} from "./tacticalEncounter";
import { advanceToChoose, singleDayMission } from "./testHelpers";

describe("tactical encounters", () => {
  it("useDice travel events enter stance step after narrative", () => {
    const ev = EVENT_CATALOG.gen_travel_fork!;
    expect(usesTacticalEncounter(ev)).toBe(true);

    let s = createNewCampaign({ difficulty: "green", seed: "tactical-stance" });
    const m0 = s.missions[0]!;
    s = {
      ...s,
      missions: [singleDayMission(m0, [ev]), ...s.missions.slice(1)],
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "narrative" } },
    };

    s = reduceGame(s, { type: "EVENT_CONTINUE" });
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("stance");
  });

  it("CHOOSE_STANCE initializes threat and turn options", () => {
    const ev = EVENT_CATALOG.gen_combat_panther!;
    let s = createNewCampaign({ difficulty: "green", seed: "tactical-init" });
    s = {
      ...s,
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "stance" } },
      missions: s.missions.map((m, i) =>
        i === 0 ? singleDayMission(m, [ev]) : m,
      ),
    };

    s = reduceGame(s, { type: "CHOOSE_STANCE", stance: "push" });
    expect(s.pendingEncounter?.stance).toBe("push");
    expect(s.pendingEncounter?.threat).toBe(initialThreat(ev, false));
    expect(s.pendingEncounter?.turn).toBe(1);

    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("choose");

    const options = choicesForEncounterStep(s, ev);
    expect(options.length).toBe(3);
    expect(options[0]!.id).toMatch(/^stance_push_/);
  });

  it("terminal withdraw resolves encounter to outcome", () => {
    const ev = EVENT_CATALOG.gen_combat_panther!;
    let s = createNewCampaign({ difficulty: "green", seed: "tactical-withdraw" });
    s = {
      ...s,
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "choose" } },
      missions: s.missions.map((m, i) =>
        i === 0 ? singleDayMission(m, [ev]) : m,
      ),
      pendingEncounter: {
        stance: "push",
        turn: 1,
        threat: 50,
        optionCounter: s.rngCounter,
      },
    };

    s = advanceToChoose(s);
    const withdraw = choicesForEncounterStep(s, ev).find((c) => c.id.includes("_break_"))!;
    expect(withdraw).toBeTruthy();

    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: withdraw.id });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("outcome");
    expect(s.pendingEncounter).toBeUndefined();
    expect(s.pendingOutcome?.displayText.length).toBeGreaterThan(20);
  });

  it("threat tier shifts are deterministic by seed", () => {
    expect(threatShiftForTier(4)).toBe(-20);
    expect(threatShiftForTier(1)).toBe(18);
  });
});
