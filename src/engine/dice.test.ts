import { describe, expect, it } from "vitest";
import { tierFromTotal, resolveD10Check } from "./dice";

describe("dice", () => {
  it("tier bands match spec §7.1", () => {
    expect(tierFromTotal(10)).toBe(4);
    expect(tierFromTotal(9)).toBe(4);
    expect(tierFromTotal(8)).toBe(3);
    expect(tierFromTotal(6)).toBe(3);
    expect(tierFromTotal(5)).toBe(2);
    expect(tierFromTotal(3)).toBe(2);
    expect(tierFromTotal(2)).toBe(1);
    expect(tierFromTotal(1)).toBe(1);
  });

  it("resolveD10Check is deterministic for seed+counter", () => {
    const a = resolveD10Check({
      seed: "abc",
      counter: 7,
      modifiers: [{ label: "x", value: 1 }],
    });
    const b = resolveD10Check({
      seed: "abc",
      counter: 7,
      modifiers: [{ label: "x", value: 1 }],
    });
    expect(a.breakdown.roll).toBe(b.breakdown.roll);
    expect(a.breakdown.total).toBe(b.breakdown.total);
    expect(a.nextCounter).toBe(b.nextCounter);
  });
});
