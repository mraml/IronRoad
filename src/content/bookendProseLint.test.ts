import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import { CAMPAIGN_OPENER_POOLS } from "./campaignOpeners";
import { FINAL_POOLS, MID_POOLS } from "./milestoneBookends";
import { MISSION_BRIEF_SLIDES } from "./missionBriefs";
import { framingSlideForMission } from "./missionBriefFraming";
import { findDuplicateSentences, type BookendProseSource } from "./bookendProseLint";

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

function slideTexts(slide: { atmosphere?: string; narrative: string; quote?: string }): string[] {
  return [slide.atmosphere, slide.narrative, slide.quote].filter(Boolean) as string[];
}

function collectBookendSources(): BookendProseSource[] {
  const sources: BookendProseSource[] = [];

  for (let v = 0; v < CAMPAIGN_OPENER_POOLS.length; v++) {
    sources.push({
      id: `opener_${v}`,
      texts: CAMPAIGN_OPENER_POOLS[v]!.flatMap(slideTexts),
    });
  }

  for (let v = 0; v < MID_POOLS.length; v++) {
    sources.push({
      id: `milestone_mid_${v}`,
      texts: MID_POOLS[v]!.flatMap(slideTexts),
    });
  }

  for (let v = 0; v < FINAL_POOLS.length; v++) {
    sources.push({
      id: `milestone_final_${v}`,
      texts: FINAL_POOLS[v]!.flatMap(slideTexts),
    });
  }

  sources.push({
    id: "framing",
    texts: slideTexts(framingSlideForMission(0, 4, "summer")),
  });

  for (const [archetype, slides] of Object.entries(MISSION_BRIEF_SLIDES)) {
    sources.push({
      id: `brief_${archetype}`,
      texts: slides.flatMap(slideTexts),
    });
  }

  for (const id of BRIEFING_IDS) {
    const ev = EVENT_CATALOG[id]!;
    sources.push({
      id: `event_${id}`,
      texts: [ev.narrative, ev.atmosphere, ev.quote, ev.preChoiceNpc?.line].filter(
        Boolean,
      ) as string[],
    });
  }

  return sources;
}

describe("bookendProseLint", () => {
  it("no duplicate sentences across bookend pools", () => {
    const dupes = findDuplicateSentences(collectBookendSources());
    expect(dupes, dupes.join("\n")).toEqual([]);
  });
});
