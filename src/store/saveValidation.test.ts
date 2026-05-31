import { describe, expect, it } from "vitest";
import { isValidPersistedGame } from "./saveValidation";
import { createNewCampaign } from "../engine/generator";
import { initialTitleState } from "../engine/generator";

describe("saveValidation", () => {
  it("accepts a generated campaign snapshot", () => {
    const game = createNewCampaign({ difficulty: "green", seed: "save-valid" });
    expect(isValidPersistedGame(game)).toBe(true);
  });

  it("rejects malformed persisted payloads", () => {
    expect(isValidPersistedGame(null)).toBe(false);
    expect(isValidPersistedGame({ version: 5 })).toBe(false);
    expect(isValidPersistedGame({ ...initialTitleState(), missions: "nope" })).toBe(false);
  });
});
