import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import { CAMPAIGN_OPENER_POOLS } from "./campaignOpeners";
import { resolveEpiloguePages } from "./campaignEpilogues";
import { MISSION_BRIEF_SLIDES } from "./missionBriefs";
import { framingSlideForMission } from "./missionBriefFraming";
import { createNewCampaign } from "../engine/generator";
import { bookendVars } from "../engine/bookendVars";
import { validateBriefingOrdersProse, validateNpcBookendProse } from "./starProseLint";

const BRIEFING_IDS = [
  "briefing_generic",
  "briefing_attack",
  "briefing_defense",
  "briefing_pursuit",
  "briefing_patrol",
  "briefing_withdrawal",
  "briefing_night_move",
  "briefing_ammo_hold",
  "briefing_final_push",
] as const;

function slideBlob(slide: {
  atmosphere?: string;
  narrative: string;
  quote?: string;
}): string {
  return [slide.atmosphere, slide.narrative, slide.quote].filter(Boolean).join("\n");
}

describe("npc bookend prose", () => {
  it("briefing_withdrawal is orders-only after mission brief slides", () => {
    const ev = EVENT_CATALOG.briefing_withdrawal!;
    expect(ev.narrative).toContain("2200");
    expect(ev.narrative).not.toMatch(/Objective:/i);
    expect(validateBriefingOrdersProse(ev.narrative)).toEqual([]);
    expect(ev.preChoiceNpc?.speaker).toBe("{briefer}");
    expect(validateNpcBookendProse(ev.narrative, ev.atmosphere, ev.quote)).toEqual([]);
  });

  it("all interactive briefings pass NPC bookend lint", () => {
    for (const id of BRIEFING_IDS) {
      const ev = EVENT_CATALOG[id]!;
      const issues = validateNpcBookendProse(
        ev.narrative,
        ev.atmosphere,
        ev.quote,
        ev.preChoiceNpc?.line,
      );
      expect(issues, `${id}: ${issues.join("; ")}`).toEqual([]);
      expect(validateBriefingOrdersProse(ev.narrative), `${id} orders`).toEqual([]);
      expect(ev.preChoiceNpc?.speaker).toBe("{briefer}");
    }
  });

  it("mission brief slides introduce briefer once on framing only", () => {
    const framing = framingSlideForMission(0, 4, "summer");
    expect(framing.narrative).toContain("{briefer}");
    expect(framing.narrative).toContain("meets you at");
    expect(framing.narrative).not.toContain("{objective}");
    expect(validateNpcBookendProse(slideBlob(framing))).toEqual([]);

    for (const [archetype, slides] of Object.entries(MISSION_BRIEF_SLIDES)) {
      expect(slides[0]!.narrative).not.toContain("{briefer}");
      expect(slides[0]!.narrative).not.toContain("{briefingPlace}");
      for (const slide of slides) {
        const issues = validateNpcBookendProse(slideBlob(slide));
        expect(issues, `${archetype}: ${issues.join("; ")}`).toEqual([]);
      }
    }
  });

  it("campaign opener pools pass NPC bookend lint", () => {
    for (const pool of CAMPAIGN_OPENER_POOLS) {
      for (const slide of pool) {
        expect(validateNpcBookendProse(slideBlob(slide))).toEqual([]);
      }
    }
  });

  it("formatted briefing path does not repeat briefer or place in narrative", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "npc-withdrawal" });
    const vars = bookendVars(game, 0);
    const ev = game.missions[0]!.briefingEvent;
    expect(ev.preChoiceNpc?.speaker).not.toMatch(/\{/);
    expect(ev.narrative).not.toContain(vars.briefer);
    expect(ev.narrative).not.toContain(vars.briefingPlace);
    expect(validateBriefingOrdersProse(ev.narrative)).toEqual([]);
  });

  it("epilogue slides pass NPC bookend lint when templated", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "npc-epilogue" });
    const vars = bookendVars(game);
    const pages = resolveEpiloguePages("win_partial", vars);
    for (const slide of pages) {
      expect(validateNpcBookendProse(slideBlob(slide))).toEqual([]);
    }
  });
});
