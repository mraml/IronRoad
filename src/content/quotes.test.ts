import { describe, expect, it } from "vitest";
import { QUOTE_ARCHETYPES, QUOTE_MOMENTS, QUOTE_TABLE } from "./quotes";

describe("archetype quotes", () => {
  for (const archetype of QUOTE_ARCHETYPES) {
    for (const moment of QUOTE_MOMENTS) {
      it(`${archetype} · ${moment} has at least 8 lines`, () => {
        expect(QUOTE_TABLE[archetype][moment].length).toBeGreaterThanOrEqual(8);
      });
    }
  }
});
