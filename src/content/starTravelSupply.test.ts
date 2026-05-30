import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import { GENERIC_POOL, GENERIC_POOL_TIER2 } from "./poolKinds";
import { CURATED_TRAVEL_SUPPLY_PROSE } from "./starTravelSupplyProsePatch";

describe("starTravelSupplyProsePatch", () => {
  it("curated map covers most tier-1 and tier-2 travel/supply pool ids", () => {
    const pool = [...GENERIC_POOL, ...GENERIC_POOL_TIER2].filter((id) => {
      const kind = EVENT_CATALOG[id]?.kind;
      return kind === "travel" || kind === "supply";
    });
    const curated = new Set(Object.keys(CURATED_TRAVEL_SUPPLY_PROSE));
    const covered = pool.filter((id) => curated.has(id));
    expect(pool.length).toBeGreaterThanOrEqual(40);
    expect(covered.length / pool.length).toBeGreaterThan(0.85);
  });
});
