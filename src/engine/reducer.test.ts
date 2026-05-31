import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import type { GameState } from "./types";

describe("save roundtrip", () => {
  it("LOAD_STATE restores identical snapshot", () => {
    const a = createNewCampaign({ difficulty: "green", seed: "snap-1" });
    const snap = structuredClone(a);
    const b = reduceGame(a, { type: "LOAD_STATE", state: snap });
    expect(b).toEqual(reduceGame(a, { type: "LOAD_STATE", state: structuredClone(a) }));
    expect(b.version).toBe(5);
  });

  it("briefing flow reaches first event through opener, mission brief and area entry", () => {
    let s: GameState = createNewCampaign({ difficulty: "green", seed: "flow-1" });
    s = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play") return;
    expect(s.meta.sub.t).toBe("campaign_opener");
    while (s.meta.t === "play" && s.meta.sub.t === "campaign_opener") {
      s = reduceGame(s, { type: "CAMPAIGN_OPENER_CONTINUE" });
    }
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play") return;
    expect(s.meta.sub.t).toBe("mission_brief");
    const pages = s.missions[0]!.missionBriefPages.length;
    for (let i = 0; i < pages; i++) {
      s = reduceGame(s, { type: "MISSION_BRIEF_CONTINUE" });
    }
    expect(s.meta).toEqual({ t: "play", sub: { t: "briefing", step: "narrative" } });
    s = reduceGame(s, { type: "EVENT_CONTINUE" });
    expect(s.meta).toEqual({ t: "play", sub: { t: "briefing", step: "choose" } });
    const ack = s.missions[0]!.briefingEvent.choices[0]!.id;
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: ack });
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play") throw new Error("expected play");
    expect(s.meta.sub).toMatchObject({ t: "briefing", step: "outcome" });
    s = reduceGame(s, { type: "OUTCOME_CONTINUE" });
    expect(s.meta).toEqual({ t: "play", sub: { t: "area_entry", day: 0 } });
    s = reduceGame(s, { type: "AREA_ENTRY_CONTINUE" });
    expect(s.meta).toEqual({ t: "play", sub: { t: "day_intro", day: 0 } });
    s = reduceGame(s, { type: "DAY_INTRO_CONTINUE" });
    expect(s.meta).toEqual({
      t: "play",
      sub: { t: "event", day: 0, eventIndex: 0, step: "narrative" },
    });
  });
});
