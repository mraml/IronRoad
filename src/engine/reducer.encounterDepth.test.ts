import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { choicesForEncounterStep } from "./encounterFlow";
import { usesTacticalEncounter } from "./tacticalEncounter";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import type { GameState } from "./types";
import { advanceToChoose, reachFirstEventNarrative } from "./testHelpers";

describe("encounter depth flow", () => {
  it("patched catalog travel event uses tactical loop instead of generic follow-ups", () => {
    const ev = EVENT_CATALOG.gen_travel_fork!;
    expect(usesTacticalEncounter(ev)).toBe(true);
    expect(ev.choices[0]?.reactionBeat?.length).toBeGreaterThan(10);
  });

  it("tactical: narrative → stance → choose → react → outcome on travel fork", () => {
    const fork = EVENT_CATALOG.gen_travel_fork!;

    let s = createNewCampaign({ difficulty: "green", seed: "depth-flow-travel" });
    s = reachFirstEventNarrative(s);
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("narrative");

    const eventIndex = s.meta.sub.eventIndex;
    s = {
      ...s,
      missions: s.missions.map((m, mi) =>
        mi === 0
          ? {
              ...m,
              days: m.days.map((d, di) =>
                di === 0
                  ? { ...d, events: d.events.map((e, ei) => (ei === eventIndex ? fork : e)) }
                  : d,
              ),
            }
          : m,
      ),
    };

    s = reduceGame(s, { type: "EVENT_CONTINUE" });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("stance");

    s = reduceGame(s, { type: "CHOOSE_STANCE", stance: "hold" });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("choose");
    expect(s.pendingEncounter?.stance).toBe("hold");

    s = advanceToChoose(s);
    const tactical = choicesForEncounterStep(s, fork)[0];
    expect(tactical?.id).toMatch(/^stance_/);

    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: tactical!.id });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    if (s.meta.sub.step === "react") {
      s = reduceGame(s, { type: "EVENT_CONTINUE" });
    }
    if (s.meta.t === "play" && s.meta.sub.t === "event" && s.meta.sub.step === "choose") {
      const again = choicesForEncounterStep(s, fork)[0]!;
      s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: again.id });
    }
    if (s.meta.t === "play" && s.meta.sub.t === "event" && s.meta.sub.step === "outcome") {
      expect(s.pendingOutcome?.displayText.length).toBeGreaterThan(20);
    }
  });

  it("LOAD_STATE migrates legacy react step to choose", () => {
    const a = createNewCampaign({ difficulty: "green", seed: "migrate-depth" });
    const legacy = {
      ...structuredClone(a),
      version: 1 as const,
      pendingEncounter: { primaryChoiceId: "x" },
      meta: {
        t: "play" as const,
        sub: { t: "event" as const, day: 0, eventIndex: 0, step: "react" as const },
      },
    };
    const b = reduceGame(a, { type: "LOAD_STATE", state: legacy as unknown as GameState });
    expect(b.version).toBe(7);
    expect(b.pendingEncounter).toBeUndefined();
    if (b.meta.t === "play" && b.meta.sub.t === "event") {
      expect(b.meta.sub.step).toBe("choose");
    }
  });

  it("Wave 19 travel fuel cache keeps authored follow-up depth", () => {
    const ev = EVENT_CATALOG.gen_travel_fuel_cache!;
    expect(ev.choices[0]?.followUpChoices?.length).toBeGreaterThanOrEqual(2);
    expect(ev.choices[0]?.reactionBeat).toContain("Jerry");
  });

  it("authored Wave 19 rocket barrage uses tactical stance flow", () => {
    const ev = EVENT_CATALOG.gen_combat_rocket_barrage!;

    let s = createNewCampaign({ difficulty: "green", seed: "depth-w19-rocket" });
    s = {
      ...s,
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "stance" } },
      missions: s.missions.map((m, mi) =>
        mi === 0
          ? {
              ...m,
              days: m.days.map((d, di) => (di === 0 ? { ...d, events: [ev] } : d)),
            }
          : m,
      ),
    };

    s = reduceGame(s, { type: "CHOOSE_STANCE", stance: "clever" });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("choose");
    expect(s.pendingEncounter?.stance).toBe("clever");
  });
});
