import type { EventChoice, EventKind, RuntimeEvent } from "../engine/types";
import { DEPTH_REQUIRED_KINDS, hasEncounterDepth } from "../engine/encounterFlow";
import { usesTacticalEncounter } from "../engine/tacticalEncounter";
import { WAVE16_EVENTS } from "./wave16Events";

const RETROFIT_DEPTH_IDS: readonly string[] = [
  "gen_travel_fork",
  "gen_travel_mine",
  "gen_travel_bridge_down",
  "gen_cmd_crossing",
  "gen_travel_fuel_shortage",
  "gen_travel_night_halt",
  "gen_travel_bogged_soft",
  "gen_supply_risk",
  "gen_supply_black_market",
  "gen_human_letters",
  "gen_human_watch",
  "npc_local_woman",
  "npc_officer_orders",
  "npc_medic_check",
  "npc_old_farmer",
  "gen_combat_tiger_lite",
  "gen_combat_panther",
  "gen_combat_mortar",
  "gen_combat_heat_round",
  "gen_combat_mg_nest",
  "gen_infantry_treeline",
  "gen_infantry_cellar",
  "gen_defensive_wave",
  "gen_offensive_push",
  "gen_offensive_smoke_screen",
];

const PATCH_IDS = new Set<string>([...Object.keys(WAVE16_EVENTS), ...RETROFIT_DEPTH_IDS]);

function followUpId(primaryId: string, suffix: string): string {
  return `${primaryId}__${suffix}`;
}

function combatFollowUps(primary: EventChoice): EventChoice[] {
  const mod = primary.modifierBonus ?? 0;
  const role = primary.role;
  return [
    {
      id: followUpId(primary.id, "pour"),
      label: "Pour it on — commit the hull.",
      role: role ?? "gunner",
      modifierBonus: mod,
      choiceRisk: "aggressive",
      outcomeText: "You press the fight. Brass answers. The crew lives with the bill.",
      effects: [{ op: "mod_all_constitution", delta: -3 }],
    },
    {
      id: followUpId(primary.id, "break"),
      label: "Break contact — smoke and go.",
      role: role ?? "commander",
      modifierBonus: Math.max(mod - 1, -2),
      choiceRisk: "cautious",
      outcomeText: "You disengage clean. Pride stings less than a brew-up.",
      effects: [{ op: "mod_all_constitution", delta: 4 }],
    },
    {
      id: followUpId(primary.id, "retry"),
      label: "Try another approach.",
      role: role ?? "driver",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: "You pull back to rethink. The fight waits.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

function travelFollowUps(primary: EventChoice): EventChoice[] {
  const role = primary.role;
  return [
    {
      id: followUpId(primary.id, "push"),
      label: "Push through — the column moves.",
      role: role ?? "driver",
      choiceRisk: "aggressive",
      outcomeText: "No half measures. Treads bite and the road gives.",
      effects: [{ op: "mod_tank_health", delta: -4 }],
    },
    {
      id: followUpId(primary.id, "wait"),
      label: "Wait it out — patience.",
      role: role ?? "commander",
      choiceRisk: "cautious",
      outcomeText: "Time spent. Lives kept. The road still there when you move.",
      effects: [{ op: "mod_all_constitution", delta: 5 }],
    },
    {
      id: followUpId(primary.id, "alt"),
      label: "Mark another route on the map.",
      role: role ?? "driver",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: "You circle back to the grease pencil. Another way might exist.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

function npcFollowUps(primary: EventChoice): EventChoice[] {
  const role = primary.role;
  return [
    {
      id: followUpId(primary.id, "press"),
      label: "Press the question — now.",
      role: role ?? "commander",
      choiceRisk: "aggressive",
      outcomeText: "Words sharpen. Truth or trouble follows.",
      effects: [{ op: "mod_all_constitution", delta: -2 }],
    },
    {
      id: followUpId(primary.id, "back"),
      label: "Back off — let it go.",
      role: role ?? "gunner",
      choiceRisk: "cautious",
      outcomeText: "Silence held. Nobody owes anybody.",
      effects: [{ op: "mod_all_constitution", delta: 3 }],
    },
    {
      id: followUpId(primary.id, "end"),
      label: "Mount up — the war resumes.",
      role: role ?? "loader",
      choiceRisk: "tactical",
      outcomeText: "You close the hatch. Feeling stays in the chest.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

function humanFollowUps(primary: EventChoice): EventChoice[] {
  const role = primary.role;
  return [
    {
      id: followUpId(primary.id, "sit"),
      label: "Sit with it a moment.",
      role: role ?? "commander",
      choiceRisk: "cautious",
      outcomeText: "Quiet costs time. Quiet buys nerve.",
      effects: [{ op: "mod_all_constitution", delta: 6 }],
    },
    {
      id: followUpId(primary.id, "move"),
      label: "Move on — war waits.",
      role: role ?? "driver",
      choiceRisk: "tactical",
      outcomeText: "You close the hatch. The feeling doesn't leave — it just stops talking.",
      effects: [{ op: "mod_all_constitution", delta: 1 }],
    },
    {
      id: followUpId(primary.id, "again"),
      label: "Rethink the call.",
      role: role ?? "gunner",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: "Another angle. Same men. Different words.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

function supplyFollowUps(primary: EventChoice): EventChoice[] {
  const role = primary.role;
  return [
    {
      id: followUpId(primary.id, "take"),
      label: "Take what we need.",
      role: role ?? "loader",
      choiceRisk: "aggressive",
      outcomeText: "Hands full. Conscience light.",
      effects: [{ op: "mod_resource", key: "foodDays", delta: 1 }],
    },
    {
      id: followUpId(primary.id, "share"),
      label: "Share fairly.",
      role: role ?? "commander",
      choiceRisk: "cautious",
      outcomeText: "Measured split. Trust intact.",
      effects: [{ op: "mod_all_constitution", delta: 4 }],
    },
    {
      id: followUpId(primary.id, "skip"),
      label: "Leave it — drive on.",
      role: role ?? "driver",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: "You mount up hungry or not.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

function followUpsForKind(kind: EventKind, primary: EventChoice): EventChoice[] {
  if (kind === "npc_conversation") return npcFollowUps(primary);
  if (kind === "human_moment") return humanFollowUps(primary);
  if (kind === "supply") return supplyFollowUps(primary);
  if (kind === "travel") return travelFollowUps(primary);
  if (
    kind === "tank_combat" ||
    kind === "infantry_combat" ||
    kind === "defensive_stand" ||
    kind === "offensive_assault" ||
    kind === "elite_encounter"
  ) {
    return combatFollowUps(primary);
  }
  return travelFollowUps(primary);
}

function defaultReactionBeat(primary: EventChoice, kind: EventKind): string {
  if (primary.reactionBeat?.trim()) return primary.reactionBeat.trim();
  if (primary.dialogueLine?.trim()) {
    return `${primary.dialogueLine.trim()}\n\nThe words hang in the hatch air — then the road asks for the real commitment.`;
  }
  if (kind === "npc_conversation") {
    return "His face waits on your answer. The crew watches your mouth more than his.";
  }
  if (kind === "human_moment") {
    return "The moment does not leave when you want it to. Someone still has to speak.";
  }
  if (kind === "travel" || kind === "supply") {
    return "Tread noise settles. The column holds on your second call.";
  }
  if (
    kind === "tank_combat" ||
    kind === "infantry_combat" ||
    kind === "defensive_stand" ||
    kind === "offensive_assault" ||
    kind === "elite_encounter"
  ) {
    return "Brass still rings in the turret. The fight is not finished with one choice.";
  }
  return "First move made. The day still wants an answer.";
}

export function patchEventEncounterDepth(ev: RuntimeEvent): RuntimeEvent {
  if (!DEPTH_REQUIRED_KINDS.includes(ev.kind)) return ev;
  if (hasEncounterDepth(ev)) return ev;
  /** Wave 31: tactical turn loop replaces generic follow-up menus on dice events. */
  if (usesTacticalEncounter(ev)) {
    const choices: EventChoice[] = ev.choices.map((c) => ({
      ...c,
      reactionBeat: defaultReactionBeat(c, ev.kind),
    }));
    return { ...ev, choices };
  }

  const choices: EventChoice[] = ev.choices.map((c) => ({
    ...c,
    reactionBeat: defaultReactionBeat(c, ev.kind),
    followUpChoices: followUpsForKind(ev.kind, c),
  }));

  return { ...ev, choices };
}

export function patchCatalogEncounterDepth(catalog: Record<string, RuntimeEvent>): void {
  for (const id of PATCH_IDS) {
    const ev = catalog[id];
    if (ev) catalog[id] = patchEventEncounterDepth(ev);
  }
}

/** Apply depth patches to every procedural filler in the combined pools. */
export function patchAllPoolEncounterDepth(
  catalog: Record<string, RuntimeEvent>,
  poolIds: readonly string[],
): void {
  for (const id of poolIds) {
    const ev = catalog[id];
    if (!ev || !DEPTH_REQUIRED_KINDS.includes(ev.kind)) continue;
    if (hasEncounterDepth(ev)) continue;
    catalog[id] = patchEventEncounterDepth(ev);
  }
}
