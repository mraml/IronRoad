import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import type { GameState } from "./types";

function advanceMissionBriefToBriefing(s: GameState): GameState {
  if (s.meta.t !== "play" || s.meta.sub.t !== "mission_brief") return s;
  const pages = s.missions[s.missionIndex]!.missionBriefPages.length;
  let state = s;
  for (let i = 0; i < pages; i++) {
    if (state.meta.t !== "play" || state.meta.sub.t !== "mission_brief") break;
    state = reduceGame(state, { type: "MISSION_BRIEF_CONTINUE" });
  }
  return state;
}

describe("STAR narrative flow", () => {
  it("mission_brief → briefing → area_entry → day_intro → event", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "star-flow" });
    s = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play") return;
    expect(s.meta.sub.t).toBe("mission_brief");

    s = advanceMissionBriefToBriefing(s);
    if (s.meta.t !== "play") return;
    expect(s.meta.sub).toMatchObject({ t: "briefing", step: "narrative" });

    s = reduceGame(s, { type: "EVENT_CONTINUE" });
    const ack = s.missions[0]!.briefingEvent.choices[0]!.id;
    s = reduceGame(s, { type: "CHOOSE_OPTION", choiceId: ack });
    s = reduceGame(s, { type: "OUTCOME_CONTINUE" });
    if (s.meta.t !== "play") return;
    expect(s.meta.sub).toEqual({ t: "area_entry", day: 0 });

    s = reduceGame(s, { type: "AREA_ENTRY_CONTINUE" });
    if (s.meta.t !== "play") return;
    expect(s.meta.sub).toEqual({ t: "day_intro", day: 0 });

    s = reduceGame(s, { type: "DAY_INTRO_CONTINUE" });
    if (s.meta.t !== "play") return;
    expect(s.meta.sub).toMatchObject({ t: "event", day: 0, eventIndex: 0, step: "narrative" });
  });
});
