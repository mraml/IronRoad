import type { EventKind, RuntimeEvent } from "../engine/types";
import { countWords } from "./starProseLint";
import { ensureGroundingInSituation } from "./groundingProse";

const MIN_ATMOSPHERE_CHARS = 40;

const PEOPLE_KINDS: readonly EventKind[] = ["human_moment", "npc_conversation"];

const PEOPLE_TASK_PRESSURE =
  /\{objective\}|objective|crew|trust|nerve|speak|answer|decide|column|memory|home|letter|word|silence|before|must|hold|leave|stay|morale|friend|wrong|tank|cmd|kid|share|listen|choose|move|foot|hatch|wait/i;

const MIN_SITUATION_WORDS = 12;
const MIN_TASK_WORDS = 8;

interface PeopleProseOverride {
  atmosphere?: string;
  narrative?: string;
  preChoiceNpc?: { speaker: string; line: string };
}

/** Hand-tuned STAR prose for pool people beats (Wave 23). */
const CURATED_PEOPLE_PROSE: Record<string, PeopleProseOverride> = {
  gen_human_watch: {
    atmosphere: "Someone on first watch has not slept — eyes open, body already gone.",
    narrative:
      "The loader sits on the fender with a blanket and bad coffee. He is watching the tree line like it owes him money.\n\nFirst watch is trust with a rifle nearby. Speak or let him keep the silence — the crew reads both.",
  },
  gen_injury_scar: {
    atmosphere: "Fresh bandage bulk under a jacket sleeve — new geometry on an old arm.",
    narrative:
      "The asst driver flexes his hand and winces without meaning to. Everyone pretends not to notice. Everyone notices.\n\nScars become stories or secrets. How you handle this one sets the tone in the hull.",
  },
  npc_local_kids: {
    atmosphere: "Small hands wave from a doorway — too eager to be afraid yet.",
    narrative:
      "Two kids peek around a shattered gate. One waves. The other holds bread like a treasure.\n\nCivilians on the trace are never neutral. What the crew does here follows you to the next grid.",
  },
  npc_officer_orders: {
    atmosphere: "Staff tabs on a collar that has not seen the front this week.",
    narrative:
      "A lieutenant with a map case flags you down. His boots are cleaner than the road deserves.\n\nOrders from a clean uniform still bind. Answer sharp or push back — the crew is listening.",
  },
  npc_replacement_depot: {
    atmosphere: "New faces in old helmets — men who smell like train stations.",
    narrative:
      "The depot is mud, paperwork, and boys trying to look older than their last meal.\n\nReplacements watch how veterans talk. One word from {cmd} tells them what kind of crew they joined.",
  },
  npc_other_crew: {
    atmosphere: "Another Sherman idling — paint scraped to bare metal on the cheek.",
    narrative:
      "The other tank commander does not get out. He speaks through the hatch like distance is armor.\n\nCrews trade rumors, ammo, and silence. What you share here stays between treads.",
  },
  npc_medic_check: {
    atmosphere: "Antiseptic on a man who has run out of clean.",
    narrative:
      "Medic Pvt. Torres has his kit open on your fender. He is not asking permission — just waiting for someone to lie about how they feel.\n\nHealth checks are morale checks with bandages. Let him work or wave him off.",
  },
  npc_war_correspondent: {
    atmosphere: "Press patch sewn crooked — notebook out before the engine cools.",
    narrative:
      "Mr. Klein wants a quote and a photo. He smiles like your answer is already written.\n\nReporters turn minutes into myth. Choose what the crew can live with in print.",
  },
  npc_prisoner_moment: {
    atmosphere: "Empty hands held high — breath fogging in short white bursts.",
    narrative:
      "The German soldier is barely older than your loader. His helmet is gone and his eyes track every hatch noise.\n\nPrisoners are policy and conscience at once. The crew waits on {cmd}'s voice.",
  },
  npc_padre_field: {
    atmosphere: "Collar dark with road dust — boots laced even anyway.",
    narrative:
      "Padre Walsh sits on an ammo crate like it is a pew. He has tea that tastes like mercy and ration sugar.\n\nChaplains hear what soldiers won't say to each other. Accept the cup or keep moving.",
  },
  npc_old_farmer: {
    atmosphere: "A dog that has not stopped growling since you idled.",
    narrative:
      "The farmer stays on his porch. His coat hangs on him like a sack. He knows which uniform takes chickens and which takes excuses.\n\nLocals remember kindness and theft the same way. Choose what story travels ahead of you.",
  },
  foot_lines: {
    narrative:
      "A jeep passes at unsafe speed. Someone throws a canteen without stopping — charity at velocity.\n\nWater is scarce and directions scarcer. Share the swallow or chase the dust while you still can.",
  },
  foot_gate: {
    narrative:
      "A farm gate blocks the trace. Wire new since yesterday. Someone wanted this lane to hurt.\n\nOn foot, every obstacle is personal. Climb, cut, or find another way before the light goes.",
  },
  foot_farm: {
    narrative:
      "A barn still standing — rare luck. Hay smell and the chance of eggs, if the owner is gone or generous.\n\nHungry crews make bad decisions. Forage quick or keep moving before someone shoots at thieves.",
  },
  foot_checkpoint: {
    narrative:
      "MPs with clipboards and tired eyes. They want names, unit, destination — paper proof you belong on this road.\n\nCheckpoints eat time and nerve. Answer straight or risk a hold that outlasts the war.",
  },
  foot_dog: {
    narrative:
      "A dog follows at distance — ribs showing, tail uncertain. It thinks you might be food or family.\n\nSmall mercies cost nothing and sometimes cost everything. Shoo it or share what you cannot spare.",
  },
  social_drunk: {
    atmosphere: "Cheap liquor and cheaper laughter — courage in a canteen cup.",
    narrative:
      "Someone in the column got into the rum ration early. Jokes land too hard. Eyes shine wrong.\n\nDrunk nights become morning regrets. Cut it off, join one toast, or let it burn out on its own.",
  },
  social_found_item: {
    atmosphere: "Metal glint in mud — not a mine, something smaller and older.",
    narrative:
      "The loader holds up a pocket watch that stopped at 3:17. Nobody claims it. Everybody knows what that means.\n\nFound things become charms or ghosts. Decide before superstition decides for the crew.",
  },
  social_new_arrival: {
    atmosphere: "A replacement who still says sir like he means it.",
    narrative:
      "Fresh bars of soap in his kit and questions he is too smart to ask out loud.\n\nNew men watch veterans for cues. One evening sets whether he becomes crew or cargo.",
  },
  social_dog_returns: {
    atmosphere: "Paws on steel — a whine the intercom cannot drown.",
    narrative:
      "The dog from yesterday is back, muddy and sure you owe it dinner.\n\nAnimals break rules about war and attachment. Keep it, chase it, or pretend you never noticed.",
  },
  social_letters_censor: {
    atmosphere: "Ink smudged where censor blacked out a name.",
    narrative:
      "Mail call with holes in every paragraph. The loader reads what is left and fills silence badly.\n\nCensored words still land. Help him write around the blanks or let him stew alone.",
  },
  tank_replace_fork: {
    atmosphere: "New hull smell under old habits — same names, different steel.",
    narrative:
      "Division handed you a replacement tank. The crew walks around it like a stranger at the table.\n\n{tank} is new but the crew is not. Someone has to claim this metal before the next fight.",
  },
  followup_huertgen_shell: {
    narrative:
      "A shell casing lodged in the mantlet seam. Nobody remembers which exchange it came from.\n\nKeep it as proof or throw it away — either way the Hürtgen follows you inside the hull.",
  },
  followup_bulge_survivor: {
    narrative:
      "Someone at a depot recognizes {tank} from the Bulge. He stares too long. He asks if {cmd} is still with you.\n\nTruth or mercy — pick before his silence becomes everybody's question.",
  },
  w19_t2_human_piano: {
    atmosphere: "One upright key still sounds — wrong note in all this ruin.",
    narrative:
      "A piano in a collapsed parlor. One key still works when the loader presses it.\n\nMusic out here is either healing or madness. Play, stop him, or listen until the column moves.",
  },
  w19_t2_npc_dentist: {
    atmosphere: "Drill hand on a canteen cup — civilian trade pressed into uniform.",
    narrative:
      "A captured dentist turned aid station clerk offers to look at teeth and nerves alike.\n\nPain makes cowards of good soldiers. Sit in the chair or keep your jaw clenched.",
    preChoiceNpc: {
      speaker: "Dr. Weiss",
      line: "Open wide. I fix what I can. The rest we both pretend is fine.",
    },
  },
};

const ATMOSPHERE_BY_KIND: Record<EventKind, readonly string[]> = {
  human_moment: [
    "Engine off — the kind of quiet where the rest of your life tries to talk.",
    "Coffee gone cold. Somebody laughing too loud, then stopping when eyes meet.",
    "Wet wool and gun oil — the crew close enough to smell each other's fear.",
  ],
  npc_conversation: [
    "Footsteps on gravel that stop one pace too far away — stranger math.",
    "A voice from the treeline — civilian, soldier, you won't know until they speak.",
    "Paper rustle and diesel — someone with questions and time you don't have.",
  ],
  travel: [],
  tank_combat: [],
  infantry_combat: [],
  defensive_stand: [],
  offensive_assault: [],
  supply: [],
  historical_anchor: [],
  elite_encounter: [],
  rest: [
    "Lantern light and card decks — rest that never quite feels safe.",
    "Between missions, the column exhales. Stories get taller. Truth gets optional.",
  ],
  briefing: [],
  debrief: [],
};

const TASK_BEAT: Record<"human" | "npc" | "social", readonly string[]> = {
  human: [
    "The crew is watching how {cmd} handles this — words stick longer than orders.",
    "Small moments decide trust. Speak, listen, or look away — pick one before the road calls you back.",
    "Nobody else will fix this beat for you. What you do here rides in the hull tomorrow.",
  ],
  npc: [
    "They are waiting on an answer. Wrong words cost trust; silence costs more.",
    "Strangers on the trace always want something — directions, mercy, or a story to sell.",
    "The crew reads {cmd}'s face before the NPC reads your reply. Choose accordingly.",
  ],
  social: [
    "Between missions, time is loose — but the crew remembers what you shared here.",
    "Rest is when masks slip. Handle it clean or handle it later in tighter quarters.",
    "The column pretends this is nothing. It is never nothing.",
  ],
};

function stableIndex(key: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return mod > 0 ? h % mod : 0;
}

function isPeopleProseTarget(id: string, ev: RuntimeEvent): boolean {
  if (ev.proseExempt === "star") return false;
  if (PEOPLE_KINDS.includes(ev.kind)) return true;
  if (id.startsWith("social_") && (ev.kind === "rest" || ev.kind === "human_moment")) return true;
  if (id.startsWith("foot_") && ev.kind === "human_moment") return true;
  return false;
}

function taskKind(id: string, ev: RuntimeEvent): keyof typeof TASK_BEAT {
  if (id.startsWith("social_") && ev.kind === "rest") return "social";
  if (ev.kind === "npc_conversation") return "npc";
  return "human";
}

function defaultAtmosphere(kind: EventKind, catalogId: string): string {
  const options = ATMOSPHERE_BY_KIND[kind];
  if (options.length === 0) {
    return "The air holds the pause before someone has to speak.";
  }
  return options[stableIndex(catalogId, options.length)]!;
}

function defaultTaskBeat(id: string, ev: RuntimeEvent): string {
  const pool = TASK_BEAT[taskKind(id, ev)];
  return pool[stableIndex(id, pool.length)]!;
}

function padSituationParagraph(situation: string, atmosphere: string): string {
  const trimmed = situation.trim();
  if (countWords(trimmed) >= MIN_SITUATION_WORDS) {
    return ensureGroundingInSituation(trimmed);
  }
  const withAtmosphere = `${atmosphere.trim()} ${trimmed}`.trim();
  if (countWords(withAtmosphere) >= MIN_SITUATION_WORDS) {
    return ensureGroundingInSituation(withAtmosphere);
  }
  return ensureGroundingInSituation(
    `${withAtmosphere} {approach} — {light} at {place}, {timeOfDay} settling on the crew.`,
  );
}

function finalizePeopleNarrative(
  ev: RuntimeEvent,
  id: string,
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
    (!PEOPLE_TASK_PRESSURE.test(task) && !(ev.stakesNote?.trim().length ?? 0))
  ) {
    task = defaultTaskBeat(id, ev);
  }

  return `${situation}\n\n${task}`;
}

function patchPeopleProseEvent(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  if (!isPeopleProseTarget(catalogId, ev)) return ev;

  const curated = CURATED_PEOPLE_PROSE[catalogId];
  let atmosphere = curated?.atmosphere ?? ev.atmosphere;
  if (!atmosphere || atmosphere.trim().length < MIN_ATMOSPHERE_CHARS) {
    atmosphere = defaultAtmosphere(ev.kind, catalogId);
  }

  let narrative = (curated?.narrative ?? ev.narrative).trim();
  if (!narrative.includes("\n\n")) {
    narrative = `${narrative}\n\n${defaultTaskBeat(catalogId, ev)}`;
  } else {
    const [situation, task, ...rest] = narrative.split("\n\n");
    if (
      rest.length === 0 &&
      situation &&
      task &&
      (countWords(task) < MIN_TASK_WORDS ||
        (!PEOPLE_TASK_PRESSURE.test(task) && !(ev.stakesNote?.trim().length ?? 0)))
    ) {
      narrative = `${situation.trim()}\n\n${defaultTaskBeat(catalogId, ev)}`;
    }
  }
  narrative = finalizePeopleNarrative(ev, catalogId, atmosphere, narrative);

  const preChoiceNpc = curated?.preChoiceNpc ?? ev.preChoiceNpc;

  return { ...ev, atmosphere, narrative, preChoiceNpc };
}

/** STAR Situation/Task prose for human, NPC, social, and foot people beats. */
export function patchPeopleProse(catalog: Record<string, RuntimeEvent>): void {
  for (const id of Object.keys(catalog)) {
    const ev = catalog[id];
    if (ev) catalog[id] = patchPeopleProseEvent(ev, id);
  }
}

export { CURATED_PEOPLE_PROSE, PEOPLE_KINDS };
