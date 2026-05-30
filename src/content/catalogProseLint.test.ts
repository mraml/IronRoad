import { describe, expect, it } from "vitest";
import { ENVIRONMENT_SEASONS } from "../engine/campaignCalendar";
import { DEPTH_REQUIRED_KINDS } from "../engine/encounterFlow";
import type { SeasonPhase } from "../engine/types";
import { EVENT_CATALOG } from "./eventsCatalog";
import { GENERIC_POOL, GENERIC_POOL_TIER2, getPoolKindBuckets } from "./poolKinds";
import { validateStarStructure } from "./starProseLint";

const WINTER_WORDS = /\b(blizzard|snow|frost|ice|freezing|frozen ground)\b/i;
const SUMMER_WORDS = /\b(scorching|heat|dust|dehydrat)\b/i;

function proseFields(ev: { narrative: string; atmosphere?: string; choices: { outcomeText: string; reactionBeat?: string }[] }): string {
  const parts = [ev.narrative, ev.atmosphere ?? ""];
  for (const ch of ev.choices) {
    parts.push(ch.outcomeText, ch.reactionBeat ?? "");
  }
  return parts.join("\n");
}

describe("catalogProseLint", () => {
  it("summer-only environments are not described with winter keywords in catalog prose", () => {
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      const prose = proseFields(ev);
      if (!WINTER_WORDS.test(prose)) continue;
      const envHint = ev.id.includes("blizzard") || ev.id.includes("snow") || ev.id.includes("freeze");
      if (envHint) continue;
      if (ev.kind === "historical_anchor" || ev.kind === "elite_encounter") continue;
      const onlySummer =
        prose.includes("scorching") ||
        (ev.atmosphere?.includes("heat") && !prose.includes("winter"));
      if (onlySummer && !ev.id.includes("winter")) {
        violations.push(`${ev.id}: summer-flavored event mentions winter lexicon`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("events with winter ids do not use scorching-heat summer lexicon in atmosphere", () => {
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      if (!ev.id.includes("winter") && !ev.id.includes("blizzard") && !ev.id.includes("snow")) continue;
      if (SUMMER_WORDS.test(ev.atmosphere ?? "")) {
        violations.push(`${ev.id}: winter-tagged event has summer atmosphere`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("every season phase lists at least one environment", () => {
    const phases: SeasonPhase[] = ["summer", "autumn", "winter", "spring"];
    for (const phase of phases) {
      const envCount = Object.values(ENVIRONMENT_SEASONS).filter((seasons) =>
        seasons.includes(phase),
      ).length;
      expect(envCount).toBeGreaterThan(0);
    }
  });

  it("interactive events have atmosphere at least 20 chars", () => {
    const skip = new Set(["rest", "briefing", "debrief"]);
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      if (skip.has(ev.kind)) continue;
      const len = ev.atmosphere?.trim().length ?? 0;
      if (len < 20) violations.push(`${ev.id}: atmosphere too short (${len})`);
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("every choice has outcomeText at least 12 chars", () => {
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      for (const ch of ev.choices) {
        const len = ch.outcomeText.trim().length;
        if (len < 12) violations.push(`${ev.id}/${ch.id}: outcomeText too short (${len})`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("depth-required pool fillers have 3–4 primary choices", () => {
    const poolIds = new Set([...GENERIC_POOL, ...GENERIC_POOL_TIER2]);
    const violations: string[] = [];
    for (const id of poolIds) {
      const ev = EVENT_CATALOG[id];
      if (!ev || !DEPTH_REQUIRED_KINDS.includes(ev.kind)) continue;
      const n = ev.choices.length;
      if (n < 3 || n > 4) violations.push(`${id}: ${n} choices`);
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("catalog prose has no TODO or FIXME placeholders", () => {
    const bad = /\{TODO\}|FIXME/i;
    const violations: string[] = [];
    for (const ev of Object.values(EVENT_CATALOG)) {
      const prose = proseFields(ev);
      if (bad.test(prose)) violations.push(`${ev.id}: placeholder token in prose`);
    }
    expect(violations).toEqual([]);
  });

  it("patched pool travel events mostly pass STAR structure", () => {
    let checked = 0;
    let ok = 0;
    const failures: string[] = [];
    for (const id of [...GENERIC_POOL, ...GENERIC_POOL_TIER2]) {
      const ev = EVENT_CATALOG[id];
      if (!ev || ev.kind !== "travel") continue;
      checked++;
      const issues = validateStarStructure(ev);
      if (issues.length === 0) ok++;
      else failures.push(`${id}: ${issues.join("; ")}`);
    }
    expect(checked).toBeGreaterThan(10);
    expect(failures, failures.join("\n")).toEqual([]);
    expect(ok / checked).toBeGreaterThan(0.85);
  });

  it("patched pool supply events mostly pass STAR structure", () => {
    let checked = 0;
    let ok = 0;
    const failures: string[] = [];
    for (const id of [...GENERIC_POOL, ...GENERIC_POOL_TIER2]) {
      const ev = EVENT_CATALOG[id];
      if (!ev || ev.kind !== "supply") continue;
      checked++;
      const issues = validateStarStructure(ev);
      if (issues.length === 0) ok++;
      else failures.push(`${id}: ${issues.join("; ")}`);
    }
    expect(checked).toBeGreaterThan(5);
    expect(failures, failures.join("\n")).toEqual([]);
    expect(ok / checked).toBeGreaterThan(0.85);
  });

  it("patched pool human and npc events mostly pass STAR structure", () => {
    const buckets = getPoolKindBuckets();
    const ids = [...buckets.human, ...buckets.npc];
    let checked = 0;
    let ok = 0;
    const failures: string[] = [];
    for (const id of ids) {
      const ev = EVENT_CATALOG[id];
      if (!ev) continue;
      checked++;
      const issues = validateStarStructure(ev);
      if (issues.length === 0) ok++;
      else failures.push(`${id}: ${issues.join("; ")}`);
    }
    expect(checked).toBeGreaterThan(10);
    expect(failures, failures.join("\n")).toEqual([]);
    expect(ok / checked).toBeGreaterThan(0.85);
  });
});
