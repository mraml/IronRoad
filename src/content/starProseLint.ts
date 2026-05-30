import type { RuntimeEvent, SensoryFocus } from "../engine/types";

const SENSORY_PATTERNS: Record<SensoryFocus, readonly RegExp[]> = {
  sight: [
    /\b(see|sees|seen|look|looks|gaze|watch|watches|horizon|grey|gray|dark|light|shadow|silhouette|glint|flash|viewport|dust cloud|smoke plume|flicker|dim|bright|pale|color|colour)\b/i,
  ],
  sound: [
    /\b(hear|heard|crack|cracks|rumble|static|whistle|bang|clank|engine|shell|scream|silence|hatch|intercom|radio|voice|voices|thunder|pop|snap|drone|hum|squeal|ring|ringing)\b/i,
  ],
  smell: [
    /\b(smell|smells|stench|diesel|smoke|cordite|rot|mud|gas|bread|coffee|burning|sour|acrid|sweet|reek|odor|odour|piss|oil|grease)\b/i,
  ],
  touch: [
    /\b(cold|heat|hot|wet|dry|mud|grit|vibrat|shock|bruise|ache|numb|rough|smooth|tight|loose|heavy|weight|pressure|chill|warm|freeze|frozen|sweat|damp|sticky|coarse)\b/i,
  ],
  taste: [
    /\b(taste|tastes|bitter|salt|salty|metal|metallic|blood|copper|chalk|dry mouth|dust|grit|sweet|sour)\b/i,
  ],
};

const TASK_PRESSURE =
  /\{objective\}|\{cmd\}|\{tank\}|objective|deadline|must|before|pressure|clock|window|hold|reach|short|time|fuel|rounds|miles|axis|grid|commit|lose|fail|urgent|minutes|hours|0800|0900|crew|trust|speak|answer|decide|memory|letter|morale|friend|silence|listen|share|watch|move|foot|wait|choose/i;

/** Word count for prose lint bands (STAR §6.1). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/** Heuristic sensory buckets present in a beat. */
export function detectSensoryModalities(text: string): SensoryFocus[] {
  const found: SensoryFocus[] = [];
  for (const sense of Object.keys(SENSORY_PATTERNS) as SensoryFocus[]) {
    if (SENSORY_PATTERNS[sense].some((re) => re.test(text))) {
      found.push(sense);
    }
  }
  return found;
}

/** STAR Situation + Task structure checks on event narrative. */
export function validateStarStructure(ev: RuntimeEvent): string[] {
  if (ev.proseExempt === "star") return [];

  const skipKinds = new Set<RuntimeEvent["kind"]>(["rest", "briefing", "debrief"]);
  if (skipKinds.has(ev.kind) && ev.proseExempt) return [];

  const violations: string[] = [];
  const narrative = ev.narrative.trim();

  if (!narrative.includes("\n\n")) {
    violations.push("narrative missing Task paragraph (\\n\\n break)");
    return violations;
  }

  const [situation, task, ...extra] = narrative.split("\n\n");
  if (extra.some((p) => p.trim().length > 0)) {
    violations.push("narrative has more than two STAR paragraphs");
  }

  if (countWords(situation ?? "") < 12) {
    violations.push(`Situation paragraph too short (${countWords(situation ?? "")} words)`);
  }

  const taskText = task?.trim() ?? "";
  if (countWords(taskText) < 8) {
    violations.push(`Task paragraph too short (${countWords(taskText)} words)`);
  } else if (!TASK_PRESSURE.test(taskText) && !(ev.stakesNote?.trim().length ?? 0)) {
    violations.push("Task paragraph lacks objective/stakes pressure");
  }

  return violations;
}

/** One-primary-sense rule for a descriptive beat. */
export function validateSensoryBeat(text: string, exempt?: boolean): string[] {
  if (exempt) return [];

  const trimmed = text.trim();
  if (trimmed.length < 40) return [];

  const modalities = detectSensoryModalities(trimmed);
  if (modalities.length >= 2) {
    return [`multiple sensory modalities (${modalities.join(", ")})`];
  }
  if (modalities.length === 0) {
    return ["no clear primary sensory modality"];
  }
  return [];
}

/** Wave 27 — ban metadata-style labels in NPC bookend prose. */
const NPC_BOOKEND_BANNED: readonly RegExp[] = [
  /Objective:/i,
  /Mission \d+ of/i,
  /\{dateLabel\}\s*·\s*grid/i,
  /\{weekday\},\s*\{dateLabel\}\s*·/,
];

export function validateNpcBookendProse(...texts: (string | undefined)[]): string[] {
  const blob = texts.filter(Boolean).join("\n");
  const violations: string[] = [];
  for (const re of NPC_BOOKEND_BANNED) {
    if (re.test(blob)) violations.push(`banned metadata pattern: ${re.source}`);
  }
  return violations;
}
