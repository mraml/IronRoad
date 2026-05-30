import { describe, expect, it } from "vitest";
import { CAMPAIGN_OPENER_POOLS, pickOpenerVariant, resolveCampaignOpenerPages } from "./campaignOpeners";
import {
  campaignEpilogueSub,
  epilogueWon,
  resolveEpilogueOutcome,
  resolveEpiloguePages,
} from "./campaignEpilogues";
import { milestoneForMission, resolveMilestonePages } from "./milestoneBookends";
import { framingSlideForMission } from "./missionBriefFraming";
import { createNewCampaign } from "../engine/generator";
import { bookendVars } from "../engine/bookendVars";
import { narrativeVars } from "../engine/template";

const SAMPLE_CREW = [
  {
    id: "1",
    role: "commander" as const,
    firstName: "A",
    lastName: "B",
    nickname: "Ace",
    archetypeId: "steady_hand",
    rank: "captain" as const,
    hp: 100,
    constitution: 80,
    traumaStates: [],
    scars: [],
    charmId: undefined,
    coveringRole: undefined,
    charmUsedThisMission: false,
    roleAbilityUsed: false,
  },
];

describe("campaign bookends content", () => {
  it("opener variant pick is deterministic", () => {
    const a = pickOpenerVariant("seed-a", 0);
    const b = pickOpenerVariant("seed-a", 0);
    expect(a.variant).toBe(b.variant);
    expect(a.variant).toBeGreaterThanOrEqual(0);
    expect(a.variant).toBeLessThan(CAMPAIGN_OPENER_POOLS.length);
  });

  it("opener pages resolve all template tokens", () => {
    const vars = narrativeVars(SAMPLE_CREW, "Iron Maiden", "Hold the line", {
      dateLabel: "6 Jun",
      theater: "ETO 1944–45",
      missionNum: "1",
      missionsTotal: "4",
    });
    const pages = resolveCampaignOpenerPages(0, vars);
    expect(pages.length).toBe(2);
    for (const slide of pages) {
      const blob = [slide.atmosphere, slide.narrative, slide.quote].filter(Boolean).join(" ");
      expect(blob).not.toMatch(/\{\w+\}/);
      expect(slide.narrative.length).toBeGreaterThan(40);
    }
  });

  it("milestone triggers at mid and final mission indices", () => {
    expect(milestoneForMission(0, 4)).toBeNull();
    expect(milestoneForMission(2, 4)).toBe("mid");
    expect(milestoneForMission(3, 4)).toBe("final");
    expect(milestoneForMission(1, 2)).toBe("final");
  });

  it("milestone pages resolve without leftover tokens", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "milestone-vars" });
    const vars = bookendVars(game, 2);
    const pages = resolveMilestonePages("mid", game.runSeed, 2, vars);
    expect(pages.length).toBe(2);
    for (const slide of pages) {
      const blob = [slide.atmosphere, slide.narrative, slide.quote].filter(Boolean).join(" ");
      expect(blob).not.toMatch(/\{\w+\}/);
    }
  });

  it("framing slide introduces briefer at briefing place", () => {
    const slide = framingSlideForMission(0, 4, "summer");
    expect(slide.narrative).toContain("{briefer}");
    expect(slide.narrative).toContain("meets you at");
    expect(slide.narrative).toContain("{briefingPlace}");
  });

  it("epilogue outcome tiers match living crew count", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "epilogue-outcome" });
    const allAlive = { ...game, crew: game.crew.map((c) => ({ ...c, hp: 100 })) };
    expect(resolveEpilogueOutcome(allAlive)).toBe("win_full");
    expect(epilogueWon("win_full")).toBe(true);

    const oneAlive = {
      ...game,
      crew: game.crew.map((c, i) => ({ ...c, hp: i === 0 ? 100 : 0 })),
    };
    expect(resolveEpilogueOutcome(oneAlive)).toBe("win_lone");

    const allDead = { ...game, crew: game.crew.map((c) => ({ ...c, hp: 0 })) };
    expect(resolveEpilogueOutcome(allDead)).toBe("loss_kia");
    expect(campaignEpilogueSub(allDead).t).toBe("campaign_epilogue");
    expect(epilogueWon("loss_kia")).toBe(false);
  });

  it("epilogue pages resolve without leftover tokens", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "epilogue-pages" });
    const vars = bookendVars(game);
    const pages = resolveEpiloguePages("win_partial", vars);
    expect(pages.length).toBe(2);
    for (const slide of pages) {
      const blob = [slide.atmosphere, slide.narrative, slide.quote].filter(Boolean).join(" ");
      expect(blob).not.toMatch(/\{\w+\}/);
    }
  });
});
