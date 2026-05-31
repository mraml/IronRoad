import type { EventKind, RuntimeEvent } from "../engine/types";

const MIN_PRESENCE_CHARS = 40;

const SPEAKER_PRESENCE: Record<string, string> = {
  "Company Commander":
    "The company commander stands over the map with his sleeves rolled and grease on his knuckles — a man who has not slept in a bed since the crossing.",
  "Capt. Hayes":
    "Capt. Hayes keeps one boot on the running board and reads the grid like a bill he intends to pay on time, jaw set against bad news.",
  "Capt. Hess":
    "Capt. Hess has field dressings tucked in his belt and hands that do not shake — the particular calm of someone who has already decided what he can save.",
  "Capt. Brennan":
    "Capt. Brennan's map case is lashed shut with wire. His eyes keep returning to the road as if the asphalt might change its mind.",
  "Lt. Morales":
    "Lt. Morales is young enough to still believe schedules matter. The mud on his leggings says otherwise, but he has not stopped checking his watch.",
  "Lt. Carver":
    "Lt. Carver speaks with the flat precision of a man reading coordinates off a burning piece of paper.",
  "Maj. Connelly":
    "Maj. Connelly wears a scarf someone gave him in a town that no longer exists. He looks like he has been awake since the war started.",
  "Maj. Stafford":
    "Maj. Stafford's voice carries the weight of a revised order — the kind that rewrites who lives on which flank.",
  "Maj. Ellis":
    "Maj. Ellis has a staff collar and tired eyes — someone who has seen the column from above and does not like the picture.",
  "Lt. Graves":
    "Lt. Graves taps a damp map with a pencil nub. He looks like a man who trusts grids more than people and is usually right.",
  "Maj. Holt":
    "Maj. Holt reads withdrawal timings off his watch like scripture. His scarf is road-stained; his voice is not.",
  "Col. Whitfield":
    "Col. Whitfield arrives without escort, which either means confidence or desperation. His boots are still polished, which means both.",
  "Col. Something":
    "The colonel has division tabs and a clipboard that looks heavier than his sidearm. He studies your hull the way quartermasters study ledgers.",
  "Corporal Haas":
    "Corporal Haas keeps glancing at the treeline as if the paperwork might sprout rifles. His uniform is cleaner than the situation deserves.",
  "Cpl. Hess":
    "Cpl. Hess has chalk on his gloves and the satisfied posture of a man who believes mines respect honest labor.",
  "S/Sgt. Kowalski":
    "S/Sgt. Kowalski sits on a crate of forms with a pencil behind his ear and the expression of a man who has denied requisitions since before you enlisted.",
  "Sgt. Unknown":
    "The sergeant has no unit patch you recognize and a duffel that has been opened too many times. He looks like every supply line at once.",
  "Sgt. York (passing through)":
    "The Tennessean walks like a farmer who forgot to leave the war outside the field — quiet boots, steady eyes, a rifle slung as if it grew there.",
  "QM Sgt. Pike":
    "QM Sgt. Pike spreads his manifest across a hood dented by something large and German. His smile does not reach his eyes.",
  "Bandmaster Ellis":
    "Bandmaster Ellis holds a dented horn case against his chest. His uniform is parade-clean in a way that feels like defiance.",
  Cook: "The cook wipes his hands on a flour sack that was white once. Steam rises from a pot that smells like the last decent decision anyone made today.",
  "Cook Cpl. Diaz":
    "Cook Cpl. Diaz has a ladle in one hand and the philosophical patience of a man who feeds armies and hears every confession.",
  Chaplain:
    "The chaplain's collar is dark with road dust, but his boots are laced evenly. He carries no weapon and somehow still looks armed.",
  "Padre Walsh":
    "Padre Walsh has tea stains on his cuff and the unhurried posture of a man who believes minutes spent sitting are never wasted.",
  "Fr. O'Malley":
    "Fr. O'Malley has mud to his knees and a rosary wrapped around one wrist like a field dressing for the soul.",
  "Sister Marie":
    "Sister Marie's habit is pinned up for work, sleeves rolled, hands red from cold water that never stays clean long enough to matter.",
  "Medic Pvt. Torres":
    "Medic Pvt. Torres has a kit open on the fender and the quick eyes of someone cataloguing injuries before anyone admits to them.",
  "Prisoner (Klaus)":
    "The prisoner keeps his hands where you can see them. His uniform is torn at the shoulder and his eyes track every hatch noise.",
  "German soldier":
    "The German soldier is barely older than your loader. His helmet is gone and his breath comes in white bursts he cannot hide.",
  "German NCO (English)":
    "The NCO's English is textbook and his hands are empty. He stands as if surrender were a formation he has drilled.",
  "The woman":
    "The woman moves like someone who has learned which footsteps belong to the war. Her shawl is mended twice and her eyes never stop counting.",
  "The older one":
    "The older child has chocolate on his mind and hunger in the set of his shoulders — the particular thinness of a winter that outlasted the harvest.",
  "The waving one":
    "The smaller one waves with both arms, too eager to be afraid yet. Mud stripes the knees of trousers that were hand-me-downs before the war.",
  "The farmer":
    "The farmer does not come down from the porch. His coat hangs on him like a sack and his dog has not stopped growling since you idled.",
  "Madame Laurent":
    "Madame Laurent balances a basket against her hip with the practiced strength of a woman who has been feeding ghosts since 1940.",
  "Father (French)":
    "The priest's cassock is road-stained at the hem. He smells of incense and cold cellar air, and he will not meet your eyes directly.",
  "MP, Taller One":
    "The taller MP keeps one hand on his holster and the other on a clipboard. His helmet strap has left a red line across his jaw.",
  "MP Corporal":
    "The MP corporal has road dust in the creases of his gloves and the bored alertness of a man who expects lies for breakfast.",
  "2nd Lt. Harmon":
    "2nd Lt. Harmon is all angles and new bars, standing on a crate to see over your hull. His map is already wrong in two places.",
  Correspondent:
    "The correspondent has a notebook and no helmet. He looks like he has been chasing violence long enough to forget it can turn around.",
  "Mr. Klein (Stars & Stripes)":
    "Mr. Klein's press patch is sewn crooked and his camera case is scarred. He smiles the way men smile when they need you to keep talking.",
  "Other crew commander":
    "The other tank commander has paint scraped to bare metal and a crew that will not meet yours. He looks like a mirror you do not want.",
  "Engineer Sgt.":
    "The engineer sergeant has demolitions tape on his wrists and a grin that suggests he enjoys problems other people call impossible.",
  "Sig. Corporal Hale":
    "Sig. Corporal Hale's headset leaves a dent in his hair. He taps the mic cable like a man listening for a heartbeat in static.",
  "Unknown station":
    "The voice on the net is thin and desperate — someone else's war bleeding through the squelch, asking for help that may already be too late.",
  "Pvt. Mailer":
    "Pvt. Mailer sits on a mailbag stack with ink on his fingers and the guilty energy of a man who knows who got bad news today.",
  "Dr. Weiss":
    "Dr. Weiss holds a dented mirror and a drill like trade tools — civilian hands in a uniform that never quite fit.",
};

const KIND_PRESENCE: Record<EventKind, readonly string[]> = {
  human_moment: [
    "Someone in the crew has gone quiet in the way that means memory, not fatigue — shoulders slack, eyes on a middle distance the war owns.",
    "The men are close enough to smell each other's sweat and coffee. Nobody is performing bravery; they are just still alive together.",
    "A small human pause sits in the column like a stone in a boot — wrong, necessary, impossible to ignore once you notice it.",
  ],
  npc_conversation: [
    "A stranger steps into your orbit with the careful posture of someone who has learned which uniforms take prisoners and which take excuses.",
    "The figure approaching wears the road on every fold of cloth — field-worn, tired, still upright in the way people stay when there is no one left to impress.",
    "You see them before you hear them: one detail out of place in a landscape that has forgotten what normal looked like.",
  ],
  travel: [
    "The road offers faces the way it offers ruts — sometimes nothing for miles, then someone you were not ready to answer for.",
  ],
  tank_combat: [],
  infantry_combat: [],
  defensive_stand: [],
  offensive_assault: [],
  supply: [
    "The quartermaster's world smells of paper, diesel, and the arithmetic of who gets fed when the trucks stop coming.",
  ],
  historical_anchor: [],
  elite_encounter: [],
  rest: [
    "The crew sprawls in the specific exhaustion of men who have learned to sleep with one ear open and both eyes mostly shut.",
    "Lantern light catches faces you usually only see in profile over sights — younger than the voices on the intercom suggest.",
    "Rest is never empty out here; it is just the war holding its breath while someone deals cards or reads a letter twice.",
  ],
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

function isSocialBeat(catalogId: string, ev: RuntimeEvent): boolean {
  return catalogId.startsWith("social_") || ev.id.startsWith("social_");
}

function needsPresencePatch(ev: RuntimeEvent, catalogId: string): boolean {
  const existing = ev.presenceNote?.trim().length ?? 0;
  if (existing >= MIN_PRESENCE_CHARS) return false;
  if (ev.kind === "briefing" && ev.preChoiceNpc) return false;

  if (ev.preChoiceNpc) return true;
  if (ev.kind === "human_moment" || ev.kind === "npc_conversation") return true;
  if (isSocialBeat(catalogId, ev)) return true;
  return false;
}

function resolveSpeakerPresence(speaker: string): string | undefined {
  if (SPEAKER_PRESENCE[speaker]) return SPEAKER_PRESENCE[speaker];

  const lower = speaker.toLowerCase();
  for (const [key, prose] of Object.entries(SPEAKER_PRESENCE)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return prose;
    }
  }
  return undefined;
}

function defaultPresence(ev: RuntimeEvent, catalogId: string): string {
  const speaker = ev.preChoiceNpc?.speaker;
  if (speaker) {
    const keyed = resolveSpeakerPresence(speaker);
    if (keyed && keyed.length >= MIN_PRESENCE_CHARS) return keyed;
  }

  if (isSocialBeat(catalogId, ev)) {
    const options = KIND_PRESENCE.rest;
    return options[stableIndex(catalogId, options.length)]!;
  }

  const pool = KIND_PRESENCE[ev.kind];
  if (pool.length > 0) {
    return pool[stableIndex(catalogId, pool.length)]!;
  }

  return "Someone waits in the margin of the scene — road-worn, watchful, carrying the war in the set of their shoulders and the silence before they speak.";
}

function patchEventPresence(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  if (!needsPresencePatch(ev, catalogId)) return ev;
  return { ...ev, presenceNote: defaultPresence(ev, catalogId) };
}

/** Add `presenceNote` to human/NPC/social events missing a people description. */
export function patchPeoplePresence(catalog: Record<string, RuntimeEvent>): void {
  for (const id of Object.keys(catalog)) {
    const ev = catalog[id];
    if (ev) catalog[id] = patchEventPresence(ev, id);
  }
}
