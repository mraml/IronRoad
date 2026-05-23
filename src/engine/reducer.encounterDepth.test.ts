import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { hasEncounterDepth } from "./encounterFlow";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import type { GameState } from "./types";

function reachFirstEventChoose(g: GameState): GameState {
  let s = reduceGame(g, { type: "CONTINUE_AFTER_CREW" });
  s = reduceGame(s, { type: "EVENT_CONTINUE" });
  const briefAck = s.missions[0]!.briefingEvent.choices[0]!.id;
  s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: briefAck });
  if (s.meta.t === "play" && s.meta.sub.t === "briefing" && s.meta.sub.step === "react") {
    s = reduceGame(s, { type: "EVENT_CONTINUE" });
    const fu = s.missions[0]!.briefingEvent.choices[0]!.followUpChoices?.find(
      (c) => !c.returnToPrimary,
    );
    if (fu) s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: fu.id });
  }
  s = reduceGame(s, { type: "OUTCOME_CONTINUE" });
  s = reduceGame(s, { type: "DAY_INTRO_CONTINUE" });
  s = reduceGame(s, { type: "EVENT_CONTINUE" });
  return s;
}

describe("encounter depth flow", () => {
  it("patched catalog travel event has follow-up choices", () => {
    const ev = EVENT_CATALOG.gen_travel_fork!;
    expect(hasEncounterDepth(ev)).toBe(true);
  });

  it("choose → react → followup → outcome on first mission event", () => {
    const g = createNewCampaign({ difficulty: "green", seed: "depth-flow-travel" });
    let s = reachFirstEventChoose(g);
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;

    const ev = s.missions[0]!.days[0]!.events[s.meta.sub.eventIndex]!;
    const primary = ev.choices.find((c) => (c.followUpChoices?.length ?? 0) >= 2);
    expect(primary).toBeTruthy();
    if (!primary) return;

    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: primary.id });
    expect(s.pendingEncounter?.primaryChoiceId).toBe(primary.id);
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("react");

    s = reduceGame(s, { type: "EVENT_CONTINUE" });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("followup_choose");

    const follow = primary.followUpChoices!.find((c) => !c.returnToPrimary)!;
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: follow.id });
    if (s.meta.t !== "play" || s.meta.sub.t !== "event") return;
    expect(s.meta.sub.step).toBe("outcome");
    expect(s.pendingEncounter).toBeUndefined();
    expect(s.pendingOutcome?.displayText.length).toBeGreaterThan(20);
  });

  it("returnToPrimary follow-up restores choose step", () => {
    const fork = EVENT_CATALOG.gen_travel_fork!;
    const primary = fork.choices[0]!;
    const retry = primary.followUpChoices?.find((c) => c.returnToPrimary);
    expect(retry).toBeTruthy();

    let s = createNewCampaign({ difficulty: "green", seed: "depth-retry" });
    s = {
      ...s,
      meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step: "followup_choose" } },
      missions: s.missions.map((m, mi) =>
        mi === 0
          ? {
              ...m,
              days: m.days.map((d, di) =>
                di === 0
                  ? { ...d, events: d.events.map((e, ei) => (ei === 0 ? fork : e)) }
                  : d,
              ),
            }
          : m,
      ),
      pendingEncounter: { primaryChoiceId: primary.id },
    };

    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: retry!.id });
    expect(s.meta.t).toBe("play");
    if (s.meta.t === "play" && s.meta.sub.t === "event") {
      expect(s.meta.sub.step).toBe("choose");
      expect(s.pendingEncounter).toBeUndefined();
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
    expect(b.version).toBe(2);
    expect(b.pendingEncounter).toBeUndefined();
    if (b.meta.t === "play" && b.meta.sub.t === "event") {
      expect(b.meta.sub.step).toBe("choose");
    }
  });
});
