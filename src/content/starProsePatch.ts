import type { EventKind, RuntimeEvent } from "../engine/types";
import { countWords } from "./starProseLint";

const MIN_ATMOSPHERE_CHARS = 40;

const STAR_PROSE_KINDS: readonly EventKind[] = [
  "travel",
  "supply",
  "tank_combat",
  "infantry_combat",
  "defensive_stand",
  "offensive_assault",
  "elite_encounter",
  "historical_anchor",
];

const EXEMPT_KINDS = new Set<EventKind>(["rest", "briefing", "debrief"]);

const ATMOSPHERE_BY_KIND: Record<EventKind, readonly string[]> = {
  travel: [
    "Diesel hangs above the column — a smell you remember longer than town names.",
    "Tracks and distant engines grind — armor that cannot hurry and cannot stop.",
    "Mud pulls at every tread with a wet sucking sound.",
    "Heat shimmers off metal until the horizon wobbles.",
  ],
  supply: [
    "Paper and grease share the air — ledgers, crates, hands counting faster than they hope.",
    "The salvage pile smells of burnt wire and old blood.",
    "Cold metal rattles in the truck — parts that might fit, might not.",
    "Flour dust and diesel mix at the back of the throat.",
  ],
  tank_combat: [
    "The intercom crackles with voices trying not to shake.",
    "Smoke stains the viewport until the world is grey-on-grey.",
    "The hull vibrates with each near miss.",
    "Cordite and hot oil share the fighting compartment.",
  ],
  infantry_combat: [
    "Brass clicks under boots — the rhythm of a firefight half spent.",
    "The treeline holds still until it does not.",
    "Wet earth and powder smoke cling to web gear.",
    "Recoil travels through the hull into your shoulders.",
  ],
  defensive_stand: [
    "Distant artillery rolls like weather you cannot outrun.",
    "Flares hang pale over the line, turning night into a washed photograph.",
    "Frozen mud bites through glove leather.",
    "The radio net murmurs coordinates and pleas compressed into static.",
  ],
  offensive_assault: [
    "WP smoke tastes chalky even through the mask you should have worn.",
    "Engines scream at full throttle — commitment before the first round lands.",
    "Dust boils behind the column until the men behind you disappear.",
    "The air shudders with outgoing fire.",
  ],
  elite_encounter: [
    "Something heavier groans in the distance — metal on metal.",
    "The enemy hull catches light wrong, angling like bad math.",
    "Oil smoke drifts across the lane in a thin veil.",
    "Your loader's breath fogs the ready rack.",
  ],
  historical_anchor: [
    "The place has a weight you feel before you can name it.",
    "Voices on the net go quiet when the grid square comes up.",
    "Ash and brick dust hang where a town used to be.",
    "Cold rain finds every seam in the hatch.",
  ],
  human_moment: [],
  npc_conversation: [],
  rest: [],
  briefing: [],
  debrief: [],
};

const TASK_BEAT_BY_KIND: Record<EventKind, readonly string[]> = {
  travel: [
    "Objective: {objective}. The route will not stay open on courtesy — every halt is a gift to whoever owns the high ground.",
    "Miles to make before dark and {objective} will not wait. Move now or explain later to someone who does not care.",
    "Grid, clock, and fuel point at {objective}. Hesitation buys a longer walk tomorrow.",
  ],
  supply: [
    "Objective: {objective} still burns fuel and chews rounds whether you resupply cleanly or not.",
    "Every crate trades against time. {objective} does not pause while you haggle.",
    "Salvage and ammunition feed one ledger. {objective} is the line item that makes shortages personal.",
  ],
  tank_combat: [
    "Objective: {objective}. Win here or arrive late with less hull than the mission allows.",
    "Spend rounds, spend nerve, keep moving toward {objective}. A brew-up on this lane writes its own report.",
    "Command wants {objective} on schedule. The enemy wants your crew in the ditch.",
  ],
  infantry_combat: [
    "Objective: {objective}. Fausts and rifles do not respect your armor — clear this ground or carry the delay.",
    "Infantry in cover taxes every minute. {objective} waits past this treeline if enough of you still fit inside.",
    "Suppress, break contact, or spend HE — pick a posture before {objective} becomes someone else's mission.",
  ],
  defensive_stand: [
    "Objective: {objective} depends on this line holding longer than the enemy's patience.",
    "They will come again with more tube. {objective} is downstream — you are the valve.",
    "Hold until the clock says move, not until comfort says stop.",
  ],
  offensive_assault: [
    "Objective: {objective}. Push costs fuel, nerve, and bodies — commit before the smoke lifts.",
    "The assault lane closes the moment you hesitate. {objective} is why you are exposed out here.",
    "Speed is armor and silence is death. {objective} waits on the far side of whatever fires back.",
  ],
  elite_encounter: [
    "Objective: {objective}. Named metal on the road means named consequences.",
    "Division watches the clock; the enemy watches your flank. {objective} still needs you intact.",
    "Elite guns rewrite the odds. {objective} does not downgrade because the briefing was optimistic.",
  ],
  historical_anchor: [
    "Objective: {objective}. What you do in the next minutes joins a record that outlasts the crew.",
    "This grid square will be in someone's memoir. {objective} is the task; the cost is whatever the place demands.",
    "The map says {objective}. The ground says prove it.",
  ],
  human_moment: [],
  npc_conversation: [],
  rest: [],
  briefing: [],
  debrief: [],
};

function stableIndex(key: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return mod > 0 ? h % mod : 0;
}

function isProsePatchTarget(ev: RuntimeEvent): boolean {
  if (ev.proseExempt) return false;
  if (EXEMPT_KINDS.has(ev.kind)) return false;
  return STAR_PROSE_KINDS.includes(ev.kind);
}

function defaultAtmosphere(kind: EventKind, catalogId: string): string {
  const options = ATMOSPHERE_BY_KIND[kind];
  if (options.length === 0) {
    return "The air carries the war the way it always does — diesel, distance, and the feeling that something is about to demand an answer.";
  }
  return options[stableIndex(catalogId, options.length)]!;
}

function defaultTaskBeat(kind: EventKind, catalogId: string): string {
  const options = TASK_BEAT_BY_KIND[kind];
  if (options.length === 0) {
    return "Objective: {objective}. The clock on this beat does not stop for hesitation — decide before the ground decides for you.";
  }
  return options[stableIndex(catalogId, options.length)]!;
}

const TASK_PRESSURE =
  /\{objective\}|objective|deadline|must|before|pressure|clock|window|hold|reach|short|time|fuel|rounds|miles|axis|grid|commit|lose|fail|urgent|minutes|hours|0800|0900/i;

const MIN_SITUATION_WORDS = 12;
const MIN_TASK_WORDS = 8;

function padSituationParagraph(situation: string, atmosphere: string): string {
  const trimmed = situation.trim();
  if (countWords(trimmed) >= MIN_SITUATION_WORDS) return trimmed;

  const withAtmosphere = `${atmosphere.trim()} ${trimmed}`.trim();
  if (countWords(withAtmosphere) >= MIN_SITUATION_WORDS) return withAtmosphere;

  return `${withAtmosphere} The column holds while the road decides.`.trim();
}

function finalizeStarNarrative(
  ev: RuntimeEvent,
  catalogId: string,
  atmosphere: string,
  narrative: string,
): string {
  const parts = narrative
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const situation = padSituationParagraph(parts[0] ?? "", atmosphere);
  let task = parts[1] ?? "";

  if (
    countWords(task) < MIN_TASK_WORDS ||
    (!TASK_PRESSURE.test(task) && !(ev.stakesNote?.trim().length ?? 0))
  ) {
    task = defaultTaskBeat(ev.kind, catalogId);
  }

  return `${situation}\n\n${task}`;
}

function patchEventStarProse(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  if (!isProsePatchTarget(ev)) return ev;

  let atmosphere = ev.atmosphere;
  if (!atmosphere || atmosphere.trim().length < MIN_ATMOSPHERE_CHARS) {
    atmosphere = defaultAtmosphere(ev.kind, catalogId);
  }

  let narrative = ev.narrative.trim();
  if (!narrative.includes("\n\n")) {
    narrative = `${narrative}\n\n${defaultTaskBeat(ev.kind, catalogId)}`;
  } else {
    const [situation, task, ...rest] = narrative.split("\n\n");
    if (
      rest.length === 0 &&
      situation &&
      task &&
      !TASK_PRESSURE.test(task) &&
      !(ev.stakesNote?.trim().length ?? 0)
    ) {
      narrative = `${situation.trim()}\n\n${defaultTaskBeat(ev.kind, catalogId)}`;
    }
  }

  narrative = finalizeStarNarrative(ev, catalogId, atmosphere, narrative);

  return { ...ev, atmosphere, narrative };
}

/** STAR Situation/Task prose for combat, travel, and supply pool events. */
export function patchStarProse(catalog: Record<string, RuntimeEvent>): void {
  for (const id of Object.keys(catalog)) {
    const ev = catalog[id];
    if (ev) catalog[id] = patchEventStarProse(ev, id);
  }
}

export { STAR_PROSE_KINDS, MIN_ATMOSPHERE_CHARS };
