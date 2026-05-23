import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { deriveRiskTags, isNumericChoiceHint, riskTagsToHint } from "./riskTelegraph";
import type { EventChoice, RuntimeEvent } from "./types";

describe("riskTelegraph", () => {
  it("derives hull and crew tags from negative effects", () => {
    const ev: RuntimeEvent = {
      id: "t",
      kind: "tank_combat",
      narrative: "n",
      useDice: true,
      choices: [],
    };
    const ch: EventChoice = {
      id: "a",
      label: "Fight",
      role: "gunner",
      outcomeText: "ok",
      effects: [
        { op: "mod_tank_health", delta: -10 },
        { op: "mod_hp", role: "gunner", delta: -20 },
      ],
    };
    const tags = deriveRiskTags(ch, ev);
    expect(tags.some((t) => t.domain === "hull")).toBe(true);
    expect(tags.some((t) => t.domain === "crew")).toBe(true);
    expect(riskTagsToHint(tags)).not.toMatch(/\d+%/);
  });

  it("isNumericChoiceHint detects legacy strings", () => {
    expect(isNumericChoiceHint("Hull -8% · Nerve -10")).toBe(true);
    expect(isNumericChoiceHint("Possible brutal encounter")).toBe(false);
  });

  it("enriched catalog combat choices avoid numeric choiceHint", () => {
    const ids = ["gen_combat_tiger_lite", "gen_combat_panther", "gen_combat_pak"];
    for (const id of ids) {
      const ev = EVENT_CATALOG[id]!;
      for (const ch of ev.choices) {
        if (ch.choiceHint) {
          expect(isNumericChoiceHint(ch.choiceHint), `${id}/${ch.id}`).toBe(false);
        }
      }
    }
  });
});
