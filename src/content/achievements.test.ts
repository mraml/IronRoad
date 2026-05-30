import { describe, expect, it } from "vitest";
import { evaluateAchievements, countDiscoveries } from "./achievements";
import type { CrossCampaignJournal } from "../store/journalStore";
import { createNewCampaign } from "../engine/generator";
import type { GameState } from "../engine/types";

const EMPTY_JOURNAL: CrossCampaignJournal = {
  version: 2,
  crew: [],
  tanks: [],
  moments: [],
  unlockedAchievements: [],
  discoveredCharmIds: [],
};

function endWin(game: GameState): GameState {
  return { ...game, meta: { t: "end", won: true } };
}

describe("achievements", () => {
  it("counts discoveries from current run field journal", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "ach-disc" });
    const withDisc = {
      ...game,
      fieldJournal: [
        ...game.fieldJournal,
        { id: "d1", at: 1, text: "x", kind: "discovery" as const },
      ],
    };
    expect(countDiscoveries(EMPTY_JOURNAL, withDisc)).toBeGreaterThanOrEqual(
      game.fieldJournal.filter((e) => e.kind === "discovery").length + 1,
    );
  });

  it("unlocks ten_discoveries mid-campaign when threshold met", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "ach-10" });
    const fieldJournal = Array.from({ length: 10 }, (_, i) => ({
      id: `disc_${i}`,
      at: i,
      text: `Discovery ${i}`,
      kind: "discovery" as const,
    }));
    const state = { ...game, fieldJournal };
    const newly = evaluateAchievements(state, EMPTY_JOURNAL, []);
    expect(newly).toContain("ten_discoveries");
  });

  it("unlocks veteran_complete on veteran win", () => {
    const game = endWin(createNewCampaign({ difficulty: "veteran", seed: "ach-vet" }));
    const newly = evaluateAchievements(game, EMPTY_JOURNAL, []);
    expect(newly).toContain("veteran_complete");
  });

  it("unlocks no_breaking_trauma when flag clear at win", () => {
    const game = endWin({
      ...createNewCampaign({ difficulty: "green", seed: "ach-break" }),
      everBreakingTrauma: false,
    });
    expect(evaluateAchievements(game, EMPTY_JOURNAL, [])).toContain("no_breaking_trauma");
  });

  it("does not unlock no_breaking_trauma after breaking trauma", () => {
    const game = endWin({
      ...createNewCampaign({ difficulty: "green", seed: "ach-break2" }),
      everBreakingTrauma: true,
    });
    expect(evaluateAchievements(game, EMPTY_JOURNAL, [])).not.toContain("no_breaking_trauma");
  });

  it("unlocks objective_met_mission from field journal", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "ach-obj" });
    const state = {
      ...game,
      fieldJournal: [
        ...game.fieldJournal,
        {
          id: "obj1",
          at: 1,
          text: "Objective met — keep your crew alive.",
          kind: "moment" as const,
        },
      ],
    };
    expect(evaluateAchievements(state, EMPTY_JOURNAL, [])).toContain("objective_met_mission");
  });

  it("unlocks munster_survivor when munster flag set at win", () => {
    const game = endWin({
      ...createNewCampaign({ difficulty: "green", seed: "ach-mun" }),
      seededFlags: ["munster_anchor_seen"],
    });
    expect(evaluateAchievements(game, EMPTY_JOURNAL, [])).toContain("munster_survivor");
  });
});
