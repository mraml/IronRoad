import type { EventKind, RuntimeEvent } from "../engine/types";

/** Generic filler banned from catalog prose (Wave 32). */
export const BANNED_PROSE_FRAGMENTS: readonly string[] = [
  "The column holds while the road decides.",
  "The crew waits on what you do next.",
  "the road asks for the real commitment",
  "the road still wants another answer",
  "Objective: {objective}. The clock on this beat does not stop",
  "decide before the ground decides for you",
];

export const GROUNDING_TOKEN =
  /\{place\b|\{placeName\b|\{approach\b|\{weather\b|\{timeOfDay\b|\{light\b|\{crowd\b|\{temp\b/i;

const POOL_GROUNDING_KINDS: readonly EventKind[] = [
  "travel",
  "supply",
  "tank_combat",
  "infantry_combat",
  "defensive_stand",
  "offensive_assault",
  "elite_encounter",
  "historical_anchor",
  "human_moment",
  "npc_conversation",
];

const SKIP_GROUNDING_KINDS = new Set<EventKind>(["rest", "briefing", "debrief"]);

export function situationParagraph(narrative: string): string {
  return narrative.split("\n\n")[0]?.trim() ?? "";
}

export function hasGroundingToken(text: string): boolean {
  return GROUNDING_TOKEN.test(text);
}

export function ensureGroundingInSituation(situation: string): string {
  const trimmed = situation.trim();
  if (!trimmed) {
    return "{approach} {weather} — {light}, and {crowd} at {place}.";
  }
  if (hasGroundingToken(trimmed)) return trimmed;
  return `${trimmed} {weather} — {light} at {place}.`;
}

export function findBannedFragments(text: string): string[] {
  return BANNED_PROSE_FRAGMENTS.filter((frag) => text.includes(frag));
}

export function validateBannedFragments(text: string, id: string): string[] {
  return findBannedFragments(text).map((frag) => `${id}: banned fragment "${frag}"`);
}

export function validateGroundingSituation(ev: RuntimeEvent): string | null {
  if (ev.proseExempt) return null;
  if (SKIP_GROUNDING_KINDS.has(ev.kind)) return null;
  if (!POOL_GROUNDING_KINDS.includes(ev.kind)) {
    if (!ev.id.startsWith("social_") && !ev.id.startsWith("foot_")) return null;
  }
  const situation = situationParagraph(ev.narrative);
  if (hasGroundingToken(situation)) return null;
  return `${ev.id}: Situation lacks grounding token ({place}, {weather}, {timeOfDay}, etc.)`;
}

export function validateEventGroundingProse(ev: RuntimeEvent): string[] {
  const errors: string[] = [];
  const prose = [ev.narrative, ev.atmosphere ?? "", ev.stakesNote ?? ""].join("\n");
  errors.push(...validateBannedFragments(prose, ev.id));
  const groundingErr = validateGroundingSituation(ev);
  if (groundingErr) errors.push(groundingErr);
  return errors;
}

export function patchCatalogGrounding(catalog: Record<string, RuntimeEvent>): void {
  for (const id of Object.keys(catalog)) {
    const ev = catalog[id];
    if (!ev) continue;
    if (validateGroundingSituation(ev) === null) continue;

    const parts = ev.narrative.split("\n\n");
    parts[0] = ensureGroundingInSituation(parts[0] ?? "");
    catalog[id] = { ...ev, narrative: parts.filter(Boolean).join("\n\n") };
  }
}
