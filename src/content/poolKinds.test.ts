import { describe, expect, it } from "vitest";
import "./eventsCatalog";
import {
  GENERIC_POOL,
  GENERIC_POOL_TIER2,
  getPoolKindBuckets,
  getTier2PoolKindBuckets,
  getPoolKind,
  isTier2Filler,
  rebuildGenericPoolFromBuckets,
  rebuildTier2PoolFromBuckets,
} from "./poolKinds";

describe("poolKinds", () => {
  it("every GENERIC_POOL id appears in exactly one bucket", () => {
    const buckets = getPoolKindBuckets();
    const seen = new Map<string, string>();
    for (const [kind, ids] of Object.entries(buckets)) {
      for (const id of ids) {
        expect(seen.has(id), `duplicate bucket entry: ${id}`).toBe(false);
        seen.set(id, kind);
      }
    }
    for (const id of GENERIC_POOL) {
      expect(seen.has(id), `orphan pool id: ${id}`).toBe(true);
      expect(getPoolKind(id)).toBe(seen.get(id));
    }
  });

  it("bucket union equals GENERIC_POOL", () => {
    const union = rebuildGenericPoolFromBuckets();
    expect(union.length).toBe(GENERIC_POOL.length);
    expect(new Set(union)).toEqual(new Set(GENERIC_POOL));
  });

  it("every GENERIC_POOL_TIER2 id appears in exactly one tier-2 bucket", () => {
    const buckets = getTier2PoolKindBuckets();
    const seen = new Map<string, string>();
    for (const [kind, ids] of Object.entries(buckets)) {
      for (const id of ids) {
        expect(seen.has(id), `duplicate tier-2 entry: ${id}`).toBe(false);
        seen.set(id, kind);
      }
    }
    for (const id of GENERIC_POOL_TIER2) {
      expect(seen.has(id), `orphan tier-2 id: ${id}`).toBe(true);
      expect(getPoolKind(id)).toBe(seen.get(id));
      expect(isTier2Filler(id)).toBe(true);
    }
  });

  it("tier-2 pool is disjoint from tier-1 GENERIC_POOL", () => {
    const tier1 = new Set(GENERIC_POOL);
    for (const id of GENERIC_POOL_TIER2) {
      expect(tier1.has(id), `overlap: ${id}`).toBe(false);
    }
    expect(GENERIC_POOL_TIER2.length).toBeGreaterThanOrEqual(45);
    const union = rebuildTier2PoolFromBuckets();
    expect(new Set(union)).toEqual(new Set(GENERIC_POOL_TIER2));
  });
});
