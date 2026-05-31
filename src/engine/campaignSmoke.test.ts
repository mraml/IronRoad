import { describe, expect, it } from "vitest";
import { createNewCampaign } from "./generator";
import { reduceGame } from "./reducer";
import {
  advanceMissionBookends,
  assertPlayInvariants,
  playUntil,
  reachFirstEventNarrative,
  visibleBeatStrings,
} from "./testHelpers";
import type { GameState } from "./types";

const SMOKE_SEEDS = ["golden-green", "golden-vet", "smoke-alpha", "smoke-bravo"] as const;

function assertNoUnresolvedTokens(text: string, context: string): void {
  expect(text, context).not.toMatch(/\{\w+\}/);
}

function atFirstEventBeat(state: GameState): boolean {
  if (state.meta.t !== "play") return false;
  const sub = state.meta.sub;
  return (
    sub.t === "event" &&
    sub.day === 0 &&
    sub.eventIndex === 0 &&
    (sub.step === "narrative" || sub.step === "stance" || sub.step === "choose")
  );
}

describe("campaign smoke", () => {
  for (const seed of SMOKE_SEEDS) {
    it(`seed ${seed}: bookends advance without error`, () => {
      const game = createNewCampaign({ difficulty: "green", seed });
      const afterBookends = advanceMissionBookends(game);
      assertPlayInvariants(afterBookends, seed);
      for (const text of visibleBeatStrings(afterBookends)) {
        assertNoUnresolvedTokens(text, seed);
      }
    });

    it(`seed ${seed}: reaches first event narrative`, () => {
      const game = createNewCampaign({ difficulty: "green", seed });
      const atEvent = reachFirstEventNarrative(game);
      assertPlayInvariants(atEvent, seed);
      expect(atEvent.meta.t).toBe("play");
      if (atEvent.meta.t !== "play") return;
      expect(atFirstEventBeat(atEvent)).toBe(true);
    });
  }

  it("green campaign: survives auto-play steps from first event without invalid state", () => {
    let state: GameState = createNewCampaign({ difficulty: "green", seed: "smoke-autoplay" });
    state = reduceGame(state, { type: "CONTINUE_AFTER_CREW" });
    state = reachFirstEventNarrative(state);
    expect(atFirstEventBeat(state)).toBe(true);

    for (let i = 0; i < 120; i++) {
      if (state.meta.t !== "play") break;
      assertPlayInvariants(state, `autoplay-${i}`);
      const snapshot = JSON.stringify(state.meta.sub);
      state = playUntil(state, () => false, 1);
      if (state.meta.t !== "play") break;
      if (JSON.stringify(state.meta.sub) === snapshot) break;
    }
    expect(state.meta.t).toBe("play");
  });
});
