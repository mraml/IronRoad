import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import {
  advanceCampaignOpener,
  advanceMissionBriefToBriefing,
  advanceThroughBriefing,
} from "./testHelpers";

describe("STAR narrative flow", () => {
  it("crew_reveal → campaign_opener → mission_brief → briefing → area_entry → day_intro → event", () => {
    let s = createNewCampaign({ difficulty: "green", seed: "star-flow" });
    s = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
    expect(s.meta.t).toBe("play");
    if (s.meta.t !== "play") return;
    expect(s.meta.sub.t).toBe("campaign_opener");

    s = advanceCampaignOpener(s);
    if (s.meta.t !== "play") return;
    expect(s.meta.sub.t).toBe("mission_brief");

    s = advanceMissionBriefToBriefing(s);
    if (s.meta.t !== "play") return;
    expect(s.meta.sub).toMatchObject({ t: "briefing", step: "narrative" });

    s = advanceThroughBriefing(s);
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
