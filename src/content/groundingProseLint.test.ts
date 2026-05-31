import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import {
  BANNED_PROSE_FRAGMENTS,
  validateEventGroundingProse,
} from "./groundingProse";

describe("groundingProseLint", () => {
  it("catalog has no banned filler fragments", () => {
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      const prose = [ev.narrative, ev.atmosphere ?? "", ev.stakesNote ?? ""].join("\n");
      for (const frag of BANNED_PROSE_FRAGMENTS) {
        if (prose.includes(frag)) violations.push(`${ev.id}: "${frag}"`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("catalog choice reaction beats have no banned filler fragments", () => {
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      for (const ch of ev.choices) {
        const prose = [ch.reactionBeat ?? "", ch.outcomeText].join("\n");
        for (const frag of BANNED_PROSE_FRAGMENTS) {
          if (prose.includes(frag)) violations.push(`${ev.id}/${ch.id}: "${frag}"`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("pool events include grounding tokens in Situation paragraph", () => {
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      violations.push(...validateEventGroundingProse(ev));
    }
    const groundingOnly = violations.filter((v) => v.includes("grounding token"));
    expect(groundingOnly.length, groundingOnly.slice(0, 20).join("\n")).toBe(0);
  });
});
