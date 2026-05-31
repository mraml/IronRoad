import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "./eventsCatalog";
import {
  countWords,
  detectSensoryModalities,
  validateBriefingOrdersProse,
  validateNpcBookendProse,
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

  it("patched supply events have STAR structure after travel/supply prose patch", () => {
    const ev = EVENT_CATALOG.gen_supply_parts_crate!;
    const issues = validateStarStructure(ev);
    expect(issues, issues.join("; ")).toEqual([]);
  });

  it("curated travel supply prose tightens pontoon delay beat", () => {
    const ev = EVENT_CATALOG.gen_travel_pontoon_delay!;
    expect(ev.narrative).toContain("{objective}");
    expect(ev.narrative.split("\n\n").length).toBe(2);
  });

  it("patched combat pool events have STAR structure after combat patch", () => {
    const ev = EVENT_CATALOG.gen_combat_panther!;
    const issues = validateStarStructure(ev);
    expect(issues, issues.join("; ")).toEqual([]);
  });

  it("patched historical anchors have STAR structure after combat patch", () => {
    const ev = EVENT_CATALOG.anchor_bulge!;
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

  it("interactive briefings pass NPC bookend prose lint", () => {
    for (const id of [
      "briefing_generic",
      "briefing_attack",
      "briefing_defense",
      "briefing_pursuit",
      "briefing_withdrawal",
    ] as const) {
      const ev = EVENT_CATALOG[id]!;
      expect(validateBriefingOrdersProse(ev.narrative)).toEqual([]);
    }
  });
});
