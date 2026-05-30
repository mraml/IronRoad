import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import {
  countWords,
  detectSensoryModalities,
  validateSensoryBeat,
  validateStarStructure,
} from "./starProseLint";

describe("starProseLint", () => {
  it("countWords and detectSensoryModalities work on sample prose", () => {
    expect(countWords("Fog rolls low across the trace.")).toBe(6);
    expect(detectSensoryModalities("Grey smoke blinds the viewport")).toContain("sight");
  });

  it("patched travel events have STAR structure after catalog load", () => {
    const ev = EVENT_CATALOG.gen_travel_fork!;
    const issues = validateStarStructure(ev);
    expect(issues, issues.join("; ")).toEqual([]);
  });

  it("patched npc events have STAR structure after people prose patch", () => {
    const ev = EVENT_CATALOG.npc_local_woman!;
    const issues = validateStarStructure(ev);
    expect(issues, issues.join("; ")).toEqual([]);
  });

  it("patched human pool events have STAR structure", () => {
    const ev = EVENT_CATALOG.gen_human_watch!;
    const issues = validateStarStructure(ev);
    expect(issues, issues.join("; ")).toEqual([]);
  });

  it("social beats have STAR structure after people prose patch", () => {
    const ev = EVENT_CATALOG.social_drunk!;
    const issues = validateStarStructure(ev);
    expect(issues, issues.join("; ")).toEqual([]);
  });

  it("npc events have presenceNote after people patch", () => {
    const ev = EVENT_CATALOG.npc_field_kitchen!;
    expect(ev.presenceNote?.length ?? 0).toBeGreaterThanOrEqual(20);
  });

  it("atmosphere beats pass single-sense lint for sample combat event", () => {
    const ev = EVENT_CATALOG.gen_combat_panther!;
    if (!ev.atmosphere) return;
    const exemptSensory = ev.proseExempt === "sensory";
    if (exemptSensory) return;
    const issues = validateSensoryBeat(ev.atmosphere, exemptSensory);
    expect(issues).toEqual([]);
  });
});
