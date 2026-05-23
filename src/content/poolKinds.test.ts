import { describe, expect, it } from "vitest";
import {
  GENERIC_POOL,
  getPoolKindBuckets,
  getPoolKind,
  rebuildGenericPoolFromBuckets,
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
});
