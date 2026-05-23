import { describe, expect, it } from "vitest";
import { FOOT_BEAT_IDS, GENERIC_POOL, GENERIC_POOL_TIER2 } from "../content/eventsCatalog";
import { isTier2Filler } from "../content/poolKinds";
import { ANCHOR_IDS } from "../content/pools";
import {
  isHumanOrNpc,
  isTravelOrSupply,
} from "../content/poolKinds";
import {
  buildFootBeatIds,
  buildMissions,
  collectCampaignEventIds,
  countUniqueAnchorIds,
  createNewCampaign,
  measureFillerCoverage,
} from "./generator";

describe("generator", () => {
  it("green campaign has expected mission count", () => {
    const g = createNewCampaign({ difficulty: "green", seed: "golden-green" });
    expect(g.missions.length).toBe(4);
  });

  it("buildMissions is stable for fixed seed (golden)", () => {
    const crew = createNewCampaign({ difficulty: "veteran", seed: "golden-vet" }).crew;
    const tank = "Test Tank";
    const { missions, nextCounter } = buildMissions({
      seed: "golden-vet",
      difficulty: "veteran",
      crew,
      tankName: tank,
      startCounter: 0,
    });
    expect(missions.length).toBe(6);
    const totalEvents = missions.reduce(
      (n, m) => n + m.days.reduce((d, day) => d + day.events.length, 0),
      0,
    );
    // New per-day generation: veteran = 3–4 days × 3–4 events/day per mission.
    // Min: 6 missions × 3 days × 3 events = 54. Max: 6 × 4 × 4 = 96.
    expect(totalEvents).toBeGreaterThanOrEqual(6 * 3 * 3);
    expect(totalEvents).toBeLessThanOrEqual(6 * 4 * 4);
    expect(nextCounter).toBeGreaterThan(10);
  });

  it("GENERIC_POOL meets Wave 13 long-term size", () => {
    expect(GENERIC_POOL.length).toBeGreaterThanOrEqual(100);
    expect(ANCHOR_IDS.length).toBeGreaterThanOrEqual(18);
  });

  it("veteran campaign has no duplicate anchor ids", () => {
    const g = createNewCampaign({ difficulty: "veteran", seed: "dedupe-anchor-vet" });
    const { duplicateAnchors } = countUniqueAnchorIds(g.missions);
    expect(duplicateAnchors).toBe(0);
  });

  it("veteran campaign draws each procedural filler at most once per run", () => {
    const g = createNewCampaign({ difficulty: "veteran", seed: "dedupe-fill-vet" });
    const poolSet = new Set<string>(GENERIC_POOL);
    const fillerIds = collectCampaignEventIds(g.missions).filter((id) => poolSet.has(id));
    expect(new Set(fillerIds).size).toBe(fillerIds.length);
  });

  it("veteran campaign preloads social beat queue without replacement", () => {
    const g = createNewCampaign({ difficulty: "veteran", seed: "social-queue" });
    expect(g.socialBeatQueue.length).toBe(6);
    expect(new Set(g.socialBeatQueue).size).toBe(g.socialBeatQueue.length);
  });

  it("measureFillerCoverage reports strong veteran pool usage without duplicates", () => {
    const g = createNewCampaign({ difficulty: "veteran", seed: "coverage-vet-w13" });
    const cov = measureFillerCoverage(g.missions);
    expect(cov.poolSize).toBeGreaterThanOrEqual(145);
    expect(cov.duplicateCount).toBe(0);
    expect(cov.tier1Used).toBeGreaterThanOrEqual(45);
    expect(cov.tier2Used).toBe(0);
    const tier1Ratio = cov.tier1Used / GENERIC_POOL.length;
    expect(tier1Ratio).toBeGreaterThanOrEqual(0.45);
  });

  it("veteran missions include travel/supply and human/npc fillers when slots allow", () => {
    const g = createNewCampaign({ difficulty: "veteran", seed: "kind-mix-vet-w13" });
    const poolSet = new Set<string>(GENERIC_POOL);
    for (const m of g.missions) {
      const fillers = m.days
        .flatMap((d) => d.events.map((e) => e.id))
        .filter((id) => poolSet.has(id));
      if (fillers.length < 2) continue;
      expect(fillers.some(isTravelOrSupply), m.title).toBe(true);
      expect(fillers.some(isHumanOrNpc), m.title).toBe(true);
    }
  });

  it("buildFootBeatIds shuffles all foot beats deterministically", () => {
    const a = buildFootBeatIds("foot-shuffle-a", 0);
    const b = buildFootBeatIds("foot-shuffle-b", 0);
    expect(a.ids.length).toBe(FOOT_BEAT_IDS.length);
    expect(new Set(a.ids)).toEqual(new Set(FOOT_BEAT_IDS));
    expect(a.ids).toEqual(buildFootBeatIds("foot-shuffle-a", 0).ids);
    expect(a.ids).not.toEqual(b.ids);
  });

  it("fury may log tier-2 filler refill on long campaigns", () => {
    const seeds = ["fury-sp-w13-a", "fury-sp-w13-b", "fury-sp-w13-c", "fury-tier2-w16-a"];
    const secondPass = seeds.some((seed) => {
      const g = createNewCampaign({ difficulty: "fury", seed });
      return g.narrativeLog.some((line) =>
        line.includes("country the first column never saw"),
      );
    });
    expect(secondPass).toBe(true);
  });

  it("GENERIC_POOL_TIER2 meets Wave 16 size and is disjoint from tier-1", () => {
    expect(GENERIC_POOL_TIER2.length).toBeGreaterThanOrEqual(45);
    const tier1 = new Set(GENERIC_POOL);
    for (const id of GENERIC_POOL_TIER2) {
      expect(tier1.has(id)).toBe(false);
    }
  });

  it("fury second pass draws at least one tier-2 filler when pool exhausts", () => {
    const seeds = ["fury-tier2-draw-a", "fury-tier2-draw-b", "fury-tier2-draw-c", "fury-sp-w13-a"];
    const usedTier2 = seeds.some((seed) => {
      const g = createNewCampaign({ difficulty: "fury", seed });
      const cov = measureFillerCoverage(g.missions);
      return cov.tier2Used >= 1;
    });
    expect(usedTier2).toBe(true);
  });

  it("veteran campaign uses no tier-2 fillers under normal slot counts", () => {
    const g = createNewCampaign({ difficulty: "veteran", seed: "vet-no-tier2-w16" });
    const poolSet = new Set(GENERIC_POOL);
    const fillerIds = collectCampaignEventIds(g.missions).filter((id) => poolSet.has(id));
    expect(fillerIds.some(isTier2Filler)).toBe(false);
    expect(measureFillerCoverage(g.missions).tier2Used).toBe(0);
  });

  it("measureFillerCoverage reports tier-1 and tier-2 usage", () => {
    const g = createNewCampaign({ difficulty: "fury", seed: "fury-cov-tier-w16" });
    const cov = measureFillerCoverage(g.missions);
    expect(cov.tier2PoolSize).toBeGreaterThanOrEqual(45);
    expect(cov.used).toBe(cov.tier1Used + cov.tier2Used);
  });
});
