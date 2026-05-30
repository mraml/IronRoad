import type { EventChoice, RuntimeEvent } from "../engine/types";
import type { PoolKindBuckets } from "./poolKinds";
import { registerPoolKindsAndRebuildPool, registerTier2PoolKinds } from "./poolKinds";

/** Wave 19 — solo release content tranche (§2.9 toward 180+ combined). */

function depthId(primaryId: string, suffix: string): string {
  return `${primaryId}__${suffix}`;
}

function travelFollowUps(primary: EventChoice, theme: "fuel" | "mine" | "wire"): EventChoice[] {
  const role = primary.role;
  const themes = {
    fuel: {
      push: { label: "Siphon every can — commit.", outcome: "Tanks drink deep. The ditch runs dry behind you." },
      wait: { label: "Mark it and roll — patience.", outcome: "Coords radioed. You leave before the argument arrives." },
      alt: { label: "Find another route.", outcome: "You back off the cans. Another mile on fumes." },
    },
    mine: {
      push: { label: "Follow the treads — commit.", outcome: "Tracks hold. Your treads hold. Nobody speaks." },
      wait: { label: "Probe on foot — patience.", outcome: "Boots find the gap. The tank follows slow." },
      alt: { label: "Wide detour instead.", outcome: "You circle back to the map. Safer on paper." },
    },
    wire: {
      push: { label: "Cut through — commit.", outcome: "Wire parts. The gap might still bite." },
      wait: { label: "Probe the gap — patience.", outcome: "Hands find firm ground. Motion resumes." },
      alt: { label: "Try another crossing.", outcome: "You pull back to rethink the trace." },
    },
  }[theme];
  return [
    {
      id: depthId(primary.id, "push"),
      label: themes.push.label,
      role: role ?? "driver",
      choiceRisk: "aggressive",
      outcomeText: themes.push.outcome,
      effects: [{ op: "mod_tank_health", delta: -4 }],
    },
    {
      id: depthId(primary.id, "wait"),
      label: themes.wait.label,
      role: role ?? "commander",
      choiceRisk: "cautious",
      outcomeText: themes.wait.outcome,
      effects: [{ op: "mod_all_constitution", delta: 4 }],
    },
    {
      id: depthId(primary.id, "alt"),
      label: themes.alt.label,
      role: role ?? "driver",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: themes.alt.outcome,
      effects: [],
      flavorOnly: true,
    },
  ];
}

function combatFollowUps(
  primary: EventChoice,
  theme: "rocket" | "sniper" | "mg42" | "halftrack" | "munster",
): EventChoice[] {
  const mod = primary.modifierBonus ?? 0;
  const role = primary.role;
  const themes = {
    rocket: {
      commit: { label: "Stay on the guns — another salvo.", outcome: "Metal answers metal. The crew lives with the bill." },
      ease: { label: "Break contact — ease off.", outcome: "You slip the bracket. Pride stings less than a brew-up." },
      retry: { label: "Try another approach.", outcome: "You pull back to rethink. The rockets wait." },
    },
    sniper: {
      commit: { label: "Pour fire on the lane — commit.", outcome: "Tracers stitch the window. The crack stops." },
      ease: { label: "Smoke and slide — ease off.", outcome: "Grey curtain. The lane goes blind." },
      retry: { label: "Try another approach.", outcome: "You angle for a different shot line." },
    },
    mg42: {
      commit: { label: "Keep the coax talking — commit.", outcome: "The hedge chews belt. Silence after feels earned." },
      ease: { label: "Back off the belt — ease off.", outcome: "Angle lost. Crew breathing." },
      retry: { label: "Try another approach.", outcome: "You hunt a flank instead of the face." },
    },
    halftrack: {
      commit: { label: "Finish it — commit.", outcome: "Second shot isn't needed. First was enough." },
      ease: { label: "Withdraw — live to spend ammo.", outcome: "Road empty. Threat gone for now." },
      retry: { label: "Try another approach.", outcome: "You circle for a thinner angle." },
    },
    munster: {
      commit: { label: "Push the block — room by room.", outcome: "Brick dust and rifle pop. The street opens." },
      ease: { label: "Hold the square — let infantry work.", outcome: "You own the intersection. Movement dies in the open." },
      retry: { label: "Try another approach.", outcome: "You pull back to the rubble map." },
    },
  }[theme];
  return [
    {
      id: depthId(primary.id, "commit"),
      label: themes.commit.label,
      role: role ?? "gunner",
      modifierBonus: mod,
      choiceRisk: "aggressive",
      outcomeText: themes.commit.outcome,
      effects: [{ op: "mod_all_constitution", delta: -3 }],
    },
    {
      id: depthId(primary.id, "ease"),
      label: themes.ease.label,
      role: role ?? "commander",
      modifierBonus: Math.max(mod - 1, -2),
      choiceRisk: "cautious",
      outcomeText: themes.ease.outcome,
      effects: [{ op: "mod_all_constitution", delta: 4 }],
    },
    {
      id: depthId(primary.id, "retry"),
      label: themes.retry.label,
      role: role ?? "driver",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: themes.retry.outcome,
      effects: [],
      flavorOnly: true,
    },
  ];
}

function humanFollowUps(primary: EventChoice): EventChoice[] {
  const role = primary.role;
  return [
    {
      id: depthId(primary.id, "sit"),
      label: "Sit with it a moment.",
      role: role ?? "commander",
      choiceRisk: "cautious",
      outcomeText: "Quiet costs time. Quiet buys nerve.",
      effects: [{ op: "mod_all_constitution", delta: 5 }],
    },
    {
      id: depthId(primary.id, "move"),
      label: "Move on — war waits.",
      role: role ?? "driver",
      choiceRisk: "tactical",
      outcomeText: "You close the hatch. Feeling stays in the chest.",
      effects: [{ op: "mod_all_constitution", delta: 1 }],
    },
    {
      id: depthId(primary.id, "again"),
      label: "Rethink the call.",
      role: role ?? "gunner",
      returnToPrimary: true,
      choiceRisk: "tactical",
      outcomeText: "Another angle. Same civilians. Different words.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

function npcFollowUps(primary: EventChoice): EventChoice[] {
  const role = primary.role;
  return [
    {
      id: depthId(primary.id, "press"),
      label: "Press for another bowl.",
      role: role ?? "loader",
      choiceRisk: "cautious",
      outcomeText: "Seconds helping. The stew runs out anyway.",
      effects: [{ op: "mod_all_constitution", delta: 2 }],
    },
    {
      id: depthId(primary.id, "back"),
      label: "Thank him and go.",
      role: role ?? "commander",
      choiceRisk: "cautious",
      outcomeText: "Full enough to pretend tomorrow is normal.",
      effects: [{ op: "mod_all_constitution", delta: 3 }],
    },
    {
      id: depthId(primary.id, "end"),
      label: "End the conversation.",
      role: role ?? "driver",
      choiceRisk: "tactical",
      outcomeText: "You mount up. Hunger returns with the engine.",
      effects: [],
      flavorOnly: true,
    },
  ];
}

type CuratedDepthSpec = {
  theme?: "fuel" | "mine" | "wire" | "rocket" | "sniper" | "mg42" | "halftrack" | "munster";
  followKind?: "travel" | "combat" | "human" | "npc";
  reactions: Record<string, string>;
};

function applyCuratedDepth(ev: RuntimeEvent, spec: CuratedDepthSpec): RuntimeEvent {
  const followKind = spec.followKind ?? (spec.theme === "fuel" || spec.theme === "mine" || spec.theme === "wire"
    ? "travel"
    : spec.theme
      ? "combat"
      : "human");
  return {
    ...ev,
    choices: ev.choices.map((c) => {
      const reaction =
        spec.reactions[c.id] ??
        "The moment hangs — then demands a second call.";
      let followUpChoices: EventChoice[];
      if (followKind === "travel" && spec.theme) {
        followUpChoices = travelFollowUps(c, spec.theme as "fuel" | "mine" | "wire");
      } else if (followKind === "combat" && spec.theme) {
        followUpChoices = combatFollowUps(
          c,
          spec.theme as "rocket" | "sniper" | "mg42" | "halftrack" | "munster",
        );
      } else if (followKind === "npc") {
        followUpChoices = npcFollowUps(c);
      } else {
        followUpChoices = humanFollowUps(c);
      }
      return { ...c, reactionBeat: reaction, followUpChoices };
    }),
  };
}

function travelEvent(
  id: string,
  atmosphere: string,
  narrative: string,
): RuntimeEvent {
  return {
    id,
    kind: "travel",
    atmosphere,
    narrative,
    useDice: true,
    choices: [
      {
        id: "slow",
        label: "Take the slow line — driver.",
        role: "driver",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Mud wins inches, not miles. You arrive late but intact.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 2 }],
      },
      {
        id: "push",
        label: "Push through — commander.",
        role: "commander",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "The column stretches. Someone up front pays for your hurry.",
        effects: [
          { op: "mod_tank_health", delta: -6 },
          { op: "add_salvage", amount: 1 },
        ],
      },
      {
        id: "scout",
        label: "Scout on foot — asst. driver.",
        role: "asst_driver",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Boots find the firm ground. The tank follows where you point.",
        effects: [{ op: "mod_all_constitution", delta: 1 }],
      },
    ],
  };
}

export const WAVE19_EVENTS: Record<string, RuntimeEvent> = {
  gen_travel_fuel_cache: travelEvent(
    "gen_travel_fuel_cache",
    "Jerry cans in a ditch. Someone else's logistics, someone else's mistake.",
    "A fuel cache sits unguarded off the road — {objective} still miles ahead.\n\nTake it, mark it, or leave it for MPs to argue over.",
  ),
  gen_travel_pontoon_delay: travelEvent(
    "gen_travel_pontoon_delay",
    "Engineers swear the bridge will hold. The river disagrees quietly.",
    "Pontoon delay stacks vehicles nose to tail.\n\nWait your turn or find another crossing.",
  ),
  gen_travel_mine_marker: travelEvent(
    "gen_travel_mine_marker",
    "Tape and skull posts. The safe path is whatever the last tank took.",
    "Mine markers lean in the wind. The driver counts tread marks that made it through.",
  ),
  gen_supply_parts_crate: {
    id: "gen_supply_parts_crate",
    kind: "supply",
    atmosphere: "Spare track pins rattle in a crate that smells like machine oil and hope.",
    narrative: "A knocked-out column left parts behind — usable if you dare stop.\n\nLoot, share, or roll past.",
    useDice: true,
    choices: [
      {
        id: "loot",
        label: "Strip the crate — loader.",
        role: "loader",
        modifierBonus: 0,
        choiceRisk: "aggressive",
        outcomeText: "Pins, grease, a good wrench. The tank eats it up.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: 2 }],
      },
      {
        id: "share",
        label: "Radio the location — commander.",
        role: "commander",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Quartermaster sends thanks. Your crew gets first pick later.",
        effects: [{ op: "add_salvage", amount: 1 }],
      },
      {
        id: "pass",
        label: "Keep rolling — driver.",
        role: "driver",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Stopping is a target. You choose motion.",
        effects: [],
      },
    ],
  },
  gen_human_refugee_cart: {
    id: "gen_human_refugee_cart",
    kind: "human_moment",
    moralWeight: true,
    atmosphere: "A cart blocks the verge. Eyes that have already seen too much.",
    narrative: "Civilians on the road shoulder — {objective} waits behind them.\n\nHelp, hurry, or pretend you don't see.",
    choices: [
      {
        id: "help",
        label: "Clear the cart — loader.",
        role: "loader",
        choiceRisk: "cautious",
        outcomeText: "Hands take food. No speeches. The road opens.",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "horn",
        label: "Blast them aside — driver.",
        role: "driver",
        choiceRisk: "aggressive",
        outcomeText: "They scatter. The crew doesn't look at each other's faces.",
        effects: [{ op: "mod_all_constitution", delta: -4 }],
      },
      {
        id: "detour",
        label: "Detour through the field — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "Soft ground costs time. It costs less than memory.",
        effects: [{ op: "mod_tank_health", delta: -4 }],
      },
    ],
  },
  gen_human_church_bell: {
    id: "gen_human_church_bell",
    kind: "human_moment",
    atmosphere: "A church bell still works. That's either faith or defiance.",
    narrative: "The bell rings once in a ruined town.\n\nInvestigate, silence it, or leave the ghosts alone.",
    choices: [
      {
        id: "look",
        label: "Send asst. driver to look — asst. driver.",
        role: "asst_driver",
        choiceRisk: "cautious",
        outcomeText: "Empty nave. Fresh candle. Someone was here minutes ago.",
        effects: [
          { op: "journal", text: "Church bell — empty nave.", kind: "moment" },
          { op: "discovery_stub", id: "church_bell_ruins" },
        ],
      },
      {
        id: "silence",
        label: "Break the rope — gunner.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "The bell stops. The town feels smaller after.",
        effects: [{ op: "mod_constitution", role: "gunner", delta: -2 }],
      },
      {
        id: "leave",
        label: "Leave it — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "Sound fades behind you. The war doesn't need another souvenir.",
        effects: [],
      },
    ],
  },
  npc_field_kitchen: {
    id: "npc_field_kitchen",
    kind: "npc_conversation",
    atmosphere: "Hot food behind the lines — rare as honesty.",
    narrative: "A cook truck offers stew if you have time and stories.\n\nSit, trade rumors, or decline.",
    preChoiceNpc: { speaker: "Cook", line: "You look like men who eat standing up. Sit if you want." },
    choices: [
      {
        id: "sit",
        label: "Eat and listen — loader.",
        role: "loader",
        choiceRisk: "cautious",
        outcomeText: "Stew, rumors, a laugh that isn't forced. Small mercy.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "mod_all_constitution", delta: 4 },
        ],
        npcReply: "Come back when the road's done with you.",
      },
      {
        id: "rumor",
        label: "Trade intel — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "He knows which road the last column lost tanks on.",
        effects: [{ op: "seed_flag", flag: "cook_intel_route" }],
        npcReply: "Third left past the mill. Don't quote me.",
      },
      {
        id: "go",
        label: "Decline — driver.",
        role: "driver",
        choiceRisk: "cautious",
        outcomeText: "You roll on hungry. Familiar.",
        effects: [],
        npcReply: "Your funeral, boys.",
      },
    ],
  },
  gen_combat_sniper_lane: {
    id: "gen_combat_sniper_lane",
    kind: "infantry_combat",
    atmosphere: "One shot cracks. Then silence that listens.",
    narrative: "Sniper lane over the road — {tank} is the tallest thing moving.",
    useDice: true,
    choices: [
      {
        id: "smoke",
        label: "Lay smoke — loader.",
        role: "loader",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "WP curtain. The next shot goes somewhere else.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
      {
        id: "rush",
        label: "Rush the building — asst. driver.",
        role: "asst_driver",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "Hull MG and boots. The shooter stops.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: -2 }],
      },
      {
        id: "bypass",
        label: "Bypass wide — driver.",
        role: "driver",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Distance and mud. The rifle finds another column.",
        effects: [{ op: "mod_tank_health", delta: -5 }],
      },
    ],
  },
  gen_combat_rocket_barrage: {
    id: "gen_combat_rocket_barrage",
    kind: "tank_combat",
    atmosphere: "Screaming rockets. The sky delivers mail no one wants.",
    narrative: "Nebelwerfer barrage walks toward the column.\n\nBrace, move, or shoot the smoke.",
    useDice: true,
    enemy: { label: "rocket battery", combatMod: -1, idealAmmo: "HE" },
    choices: [
      {
        id: "brace",
        label: "Brace in place — commander.",
        role: "commander",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Shrapnel tattoos the hull. You're still breathing.",
        effects: [{ op: "mod_tank_health", delta: -10 }],
      },
      {
        id: "move",
        label: "Move between salvos — driver.",
        role: "driver",
        modifierBonus: 1,
        choiceRisk: "aggressive",
        outcomeText: "You dance in mud. One salvo walks into empty ground.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -3 }],
      },
      {
        id: "counter",
        label: "HE into the treeline — gunner.",
        role: "gunner",
        modifierBonus: 0,
        choiceRisk: "aggressive",
        outcomeText: "Explosions answer explosions. Silence after feels earned.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }],
      },
    ],
  },
  gen_defensive_roadblock_hold: {
    id: "gen_defensive_roadblock_hold",
    kind: "defensive_stand",
    atmosphere: "Roadblock, wire, and the feeling the war might come back.",
    narrative: "Hold the roadblock until engineers finish — probes expected.",
    useDice: true,
    choices: [
      {
        id: "hold",
        label: "Hold fire discipline — commander.",
        role: "commander",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Probes fade. The engineers finish.",
        effects: [{ op: "mod_all_constitution", delta: -2 }],
      },
      {
        id: "flare",
        label: "Flare early — gunner.",
        role: "gunner",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Night turns day. Shooters scatter.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: -1 }],
      },
      {
        id: "sortie",
        label: "Sortie forward — asst. driver.",
        role: "asst_driver",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "Aggressive push breaks the probe. Costly.",
        effects: [{ op: "mod_tank_health", delta: -8 }],
      },
    ],
  },
  gen_offensive_hill_grab: {
    id: "gen_offensive_hill_grab",
    kind: "offensive_assault",
    atmosphere: "High ground is geometry and arrogance.",
    narrative: "Take the hill before dark — {objective} depends on the view.",
    useDice: true,
    choices: [
      {
        id: "assault",
        label: "Direct assault — commander.",
        role: "commander",
        modifierBonus: 0,
        choiceRisk: "aggressive",
        outcomeText: "Slope, tracers, breath. The crest is yours.",
        effects: [{ op: "add_salvage", amount: 2 }],
      },
      {
        id: "flank",
        label: "Flank through the draw — driver.",
        role: "driver",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Slow arc. Surprise on the far shoulder.",
        effects: [{ op: "mod_tank_health", delta: -5 }],
      },
      {
        id: "suppress",
        label: "Suppress then move — gunner.",
        role: "gunner",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "HE walks the ridge. Infantry follows the silence.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }],
      },
    ],
  },
  anchor_munster_rubble: {
    id: "anchor_munster_rubble",
    kind: "historical_anchor",
    atmosphere: "Münster in rubble. Victory looks like dust and cellars.",
    narrative: "Urban fight through Münster — {objective} in the cathedral quarter.\n\nEvery floor might shoot.",
    stakes: "critical",
    stakesNote: "Urban anchor — clearance house by house.",
    useDice: true,
    choices: [
      {
        id: "pair",
        label: "Pair with infantry — commander.",
        role: "commander",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Room by room. Slow. Survivable.",
        effects: [
          { op: "journal", text: "Münster — paired clearance.", kind: "moment" },
          { op: "discovery_stub", id: "munster_rubble" },
          { op: "seed_flag", flag: "munster_anchor_seen" },
        ],
      },
      {
        id: "ram",
        label: "Ram the barricade — driver.",
        role: "driver",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "Brick dust and momentum. The street opens.",
        effects: [
          { op: "mod_tank_health", delta: -14 },
          { op: "seed_flag", flag: "munster_anchor_seen" },
        ],
      },
      {
        id: "overwatch",
        label: "Overwatch the square — gunner.",
        role: "gunner",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "You own the intersection. Movement dies in the open.",
        effects: [
          { op: "add_salvage", amount: 2 },
          { op: "seed_flag", flag: "munster_anchor_seen" },
        ],
      },
    ],
  },
  elite_stug_hunt: {
    id: "elite_stug_hunt",
    kind: "elite_encounter",
    atmosphere: "Low silhouette in the orchard. StuG waits like patience with a gun.",
    narrative: "StuG III in ambush — short range, bad angles.",
    stakes: "critical",
    stakesNote: "Elite ambush — first shot wins.",
    useDice: true,
    enemy: { label: "StuG III", combatMod: -2, idealAmmo: "AP" },
    choices: [
      {
        id: "flank",
        label: "Flank — driver.",
        role: "driver",
        modifierBonus: 1,
        choiceRisk: "aggressive",
        outcomeText: "Side armor. One shot. Gone.",
        effects: [{ op: "spend_ammo", ammo: "AP", amount: 2 }],
      },
      {
        id: "bait",
        label: "Bait with hull — commander.",
        role: "commander",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "They shoot. You survive. Gunner doesn't miss.",
        effects: [{ op: "mod_tank_health", delta: -12 }],
      },
      {
        id: "smoke_break",
        label: "Smoke and reposition — loader.",
        role: "loader",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "WP, move, AP from the blind side.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
    ],
  },
  social_letters_censor: {
    id: "social_letters_censor",
    kind: "human_moment",
    atmosphere: "Mail call with blacked-out lines.",
    narrative: "Between missions — letters arrive censored and late.",
    choices: [
      {
        id: "read",
        label: "Read yours aloud — loader.",
        role: "loader",
        choiceRisk: "cautious",
        outcomeText: "Home in a voice. The crew listens like it's church.",
        effects: [{ op: "mod_all_constitution", delta: 5 }],
      },
      {
        id: "burn",
        label: "Burn unopened — gunner.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "Ash in a helmet. Some things you don't carry forward.",
        effects: [{ op: "mod_constitution", role: "gunner", delta: 3 }],
      },
      {
        id: "write",
        label: "Write one honest line — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "Three words that aren't lies. It has to be enough.",
        effects: [
          { op: "journal", text: "Wrote one honest line home.", kind: "moment" },
          { op: "discovery_stub", id: "censor_honest_line" },
        ],
      },
    ],
  },
  briefing_final_push: {
    id: "briefing_final_push",
    kind: "briefing",
    atmosphere: "Map arrows everywhere. The end is a direction, not a date.",
    narrative:
      "Final push — {objective} on the grease pencil, reserves thin on the board.\n\nThe CO skips poetry. One more line on the map, then someone goes home.",
    quote: '{cmd}: "One more mission. Then we argue about who goes home first."',
    preChoiceNpc: {
      speaker: "Col. Whitfield",
      line: "This is the corridor. You hold speed, you hold intervals, and you do not stop for souvenirs. Clear?",
    },
    choices: [
      {
        id: "ask",
        label: "Ask about reserves — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "Thin. Honest. You plan accordingly.",
        effects: [],
      },
      {
        id: "ammo",
        label: "Confirm ammo — loader.",
        role: "loader",
        choiceRisk: "cautious",
        outcomeText: "Tallies checked twice. The tray is full.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: 1 }],
      },
      {
        id: "route",
        label: "Study the route — driver.",
        role: "driver",
        choiceRisk: "cautious",
        outcomeText: "You know the bad bridges by name now.",
        effects: [],
      },
    ],
  },
};

export const WAVE19_TIER1_IDS = [
  "gen_travel_fuel_cache",
  "gen_travel_pontoon_delay",
  "gen_travel_mine_marker",
  "gen_supply_parts_crate",
  "gen_human_refugee_cart",
  "gen_human_church_bell",
  "npc_field_kitchen",
  "gen_combat_sniper_lane",
  "gen_combat_rocket_barrage",
  "gen_defensive_roadblock_hold",
  "gen_offensive_hill_grab",
] as const;

export const WAVE19_TIER2_IDS = [
  "w19_t2_travel_wire",
  "w19_t2_supply_oil",
  "w19_t2_human_piano",
  "w19_t2_npc_dentist",
  "w19_t2_combat_mg42",
  "w19_t2_combat_mortar",
  "w19_t2_defensive_hedgehog",
  "w19_t2_offensive_barn",
  "w19_t2_elite_halftrack",
  "w19_t2_rest_letter",
] as const;

const WAVE19_TIER2_EVENTS: Record<string, RuntimeEvent> = {
  w19_t2_travel_wire: travelEvent(
    "w19_t2_travel_wire",
    "Concertina catches moonlight. The gap might be mined.",
    "Wire across the trace — second-pass country nobody mapped right.",
  ),
  w19_t2_supply_oil: {
    id: "w19_t2_supply_oil",
    kind: "supply",
    atmosphere: "Oil drums in a barn. Logistics by theft.",
    narrative: "Abandoned motor pool — drums still sealed.",
    useDice: true,
    choices: [
      {
        id: "take",
        label: "Siphon — loader.",
        role: "loader",
        modifierBonus: 0,
        choiceRisk: "aggressive",
        outcomeText: "Fuel for the day. Guilt for later.",
        effects: [{ op: "mod_tank_health", delta: 5 }],
      },
      {
        id: "mark",
        label: "Mark for quartermaster — commander.",
        role: "commander",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Proper channels. Slower. Safer.",
        effects: [{ op: "add_salvage", amount: 1 }],
      },
      {
        id: "skip",
        label: "Skip it — driver.",
        role: "driver",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "You have enough. For now.",
        effects: [],
      },
    ],
  },
  w19_t2_human_piano: {
    id: "w19_t2_human_piano",
    kind: "human_moment",
    moralWeight: true,
    atmosphere: "A piano in a gutted parlor. Keys still work.",
    narrative: "Someone plays badly on purpose. Laughter hurts more than shelling.",
    choices: [
      {
        id: "listen",
        label: "Listen — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "Two minutes of not being at war.",
        effects: [{ op: "mod_all_constitution", delta: 6 }],
      },
      {
        id: "stop",
        label: "Stop it — gunner.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "Silence returns. So does everything else.",
        effects: [{ op: "mod_constitution", role: "gunner", delta: -2 }],
      },
      {
        id: "leave",
        label: "Leave — driver.",
        role: "driver",
        choiceRisk: "cautious",
        outcomeText: "The hatch seals out the song.",
        effects: [],
      },
    ],
  },
  w19_t2_npc_dentist: {
    id: "w19_t2_npc_dentist",
    kind: "npc_conversation",
    atmosphere: "A dentist in a cellar treats soldiers like teeth — pull or save.",
    narrative: "Field dentist offers to look at a crewman's jaw.",
    preChoiceNpc: { speaker: "Capt. Hess", line: "Open wide. I don't have morphine, but I have steady hands." },
    choices: [
      {
        id: "yes",
        label: "Send the gunner — gunner.",
        role: "gunner",
        choiceRisk: "cautious",
        outcomeText: "Pain, then relief. He chews carefully for a week.",
        effects: [{ op: "mod_constitution", role: "gunner", delta: 4 }],
        npcReply: "Keep it clean. No candy in Germany.",
      },
      {
        id: "no",
        label: "Decline — commander.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "The jaw stays sore. Familiar.",
        effects: [],
        npcReply: "Your funeral, Sergeant.",
      },
      {
        id: "trade",
        label: "Trade morphine — loader.",
        role: "loader",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Fair swap. Everyone pretends it's routine.",
        effects: [{ op: "mod_resource", key: "medkits", delta: 1 }],
        npcReply: "You're not wrong to carry it.",
      },
    ],
  },
  w19_t2_combat_mg42: {
    id: "w19_t2_combat_mg42",
    kind: "infantry_combat",
    atmosphere: "MG42 rips cloth sound. The tree line speaks German.",
    narrative: "Long belt from the hedgerow — infantry fight at close range.",
    useDice: true,
    choices: [
      {
        id: "coax",
        label: "Coax sweep — asst. driver.",
        role: "asst_driver",
        modifierBonus: 0,
        choiceRisk: "aggressive",
        outcomeText: "Green tracers stitch the hedge. It goes quiet.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: -3 }],
      },
      {
        id: "wp",
        label: "WP the belt — loader.",
        role: "loader",
        modifierBonus: 1,
        choiceRisk: "aggressive",
        outcomeText: "Smoke and fire. Brutal. Effective.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
      {
        id: "back",
        label: "Back the tank off — driver.",
        role: "driver",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Angle lost. Crew alive.",
        effects: [{ op: "mod_tank_health", delta: -6 }],
      },
    ],
  },
  w19_t2_combat_mortar: {
    id: "w19_t2_combat_mortar",
    kind: "infantry_combat",
    atmosphere: "Mortar plop. Count. Move or don't.",
    narrative: "Mortar bracket on the halt — second-pass harassment.",
    useDice: true,
    choices: [
      {
        id: "move",
        label: "Move now — driver.",
        role: "driver",
        modifierBonus: 1,
        choiceRisk: "aggressive",
        outcomeText: "Rounds walk behind you. Close.",
        effects: [{ op: "mod_tank_health", delta: -7 }],
      },
      {
        id: "smoke",
        label: "Smoke — loader.",
        role: "loader",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Blind the spotter. Break the bracket.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
      {
        id: "dig",
        label: "Hull down — commander.",
        role: "commander",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Shrapnel rings the turret. Nobody opens the hatch.",
        effects: [{ op: "mod_all_constitution", delta: -3 }],
      },
    ],
  },
  w19_t2_defensive_hedgehog: {
    id: "w19_t2_defensive_hedgehog",
    kind: "defensive_stand",
    atmosphere: "Dragon's teeth in the rain. Geometry designed to say no.",
    narrative: "Hold near the hedgehog line — probes at dusk.",
    useDice: true,
    choices: [
      {
        id: "hold",
        label: "Hold — commander.",
        role: "commander",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Night passes. The line holds.",
        effects: [],
      },
      {
        id: "flare",
        label: "Flare — gunner.",
        role: "gunner",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Brief daylight. Brief targets.",
        effects: [],
      },
      {
        id: "patrol",
        label: "Patrol — asst. driver.",
        role: "asst_driver",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "Contact. Withdrawal. Cost.",
        effects: [{ op: "mod_hp", role: "asst_driver", delta: -10 }],
      },
    ],
  },
  w19_t2_offensive_barn: {
    id: "w19_t2_offensive_barn",
    kind: "offensive_assault",
    atmosphere: "A barn hides something with tracks.",
    narrative: "Clear the farm — {objective} beyond the yard.",
    useDice: true,
    choices: [
      {
        id: "he",
        label: "HE the barn — gunner.",
        role: "gunner",
        modifierBonus: 0,
        choiceRisk: "aggressive",
        outcomeText: "Timber and fire. Threat gone.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }],
      },
      {
        id: "inf",
        label: "Let infantry clear — commander.",
        role: "commander",
        modifierBonus: 1,
        choiceRisk: "cautious",
        outcomeText: "Rifles pop. Tank waits. Professional.",
        effects: [],
      },
      {
        id: "ram",
        label: "Ram the door — driver.",
        role: "driver",
        modifierBonus: -1,
        choiceRisk: "aggressive",
        outcomeText: "Splinters. Surprise. Done.",
        effects: [{ op: "mod_tank_health", delta: -5 }],
      },
    ],
  },
  w19_t2_elite_halftrack: {
    id: "w19_t2_elite_halftrack",
    kind: "elite_encounter",
    atmosphere: "Half-track with a gun that shouldn't be that low.",
    narrative: "Sd.Kfz. with anti-tank gun — road ambush.",
    stakes: "critical",
    useDice: true,
    enemy: { label: "Sd.Kfz. AT", combatMod: -1, idealAmmo: "HE" },
    choices: [
      {
        id: "first",
        label: "Shoot first — gunner.",
        role: "gunner",
        modifierBonus: 1,
        choiceRisk: "aggressive",
        outcomeText: "First shot wins. Second isn't needed.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "discovery_stub", id: "halftrack_first_blood" },
        ],
      },
      {
        id: "flank",
        label: "Flank — driver.",
        role: "driver",
        modifierBonus: 0,
        choiceRisk: "cautious",
        outcomeText: "Angle found. Armor thin there.",
        effects: [{ op: "spend_ammo", ammo: "AP", amount: 1 }],
      },
      {
        id: "withdraw",
        label: "Withdraw — commander.",
        role: "commander",
        modifierBonus: -1,
        choiceRisk: "cautious",
        outcomeText: "Live to spend ammo later.",
        effects: [{ op: "mod_all_constitution", delta: -4 }],
      },
    ],
  },
  w19_t2_rest_letter: {
    id: "w19_t2_rest_letter",
    kind: "rest",
    atmosphere: "Quiet hour. Paper smells like home.",
    narrative: "Rest stop — someone writes letters by hatch light while the column sleeps.",
    choices: [
      {
        id: "write",
        label: "Write — loader.",
        role: "loader",
        choiceRisk: "cautious",
        outcomeText: "Words that won't embarrass you if you survive.",
        effects: [{ op: "mod_constitution", role: "loader", delta: 5 }],
      },
      {
        id: "sleep",
        label: "Sleep — driver.",
        role: "driver",
        choiceRisk: "cautious",
        outcomeText: "Dreamless. Rare.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 6 }],
      },
      {
        id: "watch",
        label: "Stand watch — asst. driver.",
        role: "asst_driver",
        choiceRisk: "cautious",
        outcomeText: "Nothing comes. That's the gift.",
        effects: [{ op: "mod_constitution", role: "asst_driver", delta: 4 }],
      },
    ],
  },
};

Object.assign(WAVE19_EVENTS, WAVE19_TIER2_EVENTS);

const WAVE19_CURATED_DEPTH: Record<string, CuratedDepthSpec> = {
  gen_travel_fuel_cache: {
    theme: "fuel",
    reactions: {
      slow: "Jerry cans slosh. Someone else's mistake becomes yours to judge.",
      push: "The column watches you siphon. MPs are a rumor until they aren't.",
      scout: "Boots check the ditch. Fuel or trap — the road doesn't say which.",
    },
  },
  gen_travel_mine_marker: {
    theme: "mine",
    reactions: {
      slow: "Skull posts lean. The safe path is faith in whoever went first.",
      push: "Tread marks end in a crater three vehicles back. You notice.",
      scout: "Tape flutters. The probe finds nothing — yet.",
    },
  },
  w19_t2_travel_wire: {
    theme: "wire",
    reactions: {
      slow: "Concertina catches moonlight. The gap might be mined.",
      push: "Wire parts under tread. The column holds its breath.",
      scout: "Hands find the gap. Second-pass country offers no guarantees.",
    },
  },
  gen_combat_rocket_barrage: {
    theme: "rocket",
    reactions: {
      brace: "Salvo walks closer. Shrapnel hammers like hail on steel.",
      move: "Mud and screaming rockets. You dance between impacts.",
      counter: "HE answers the treeline. Smoke and silence trade places.",
    },
  },
  gen_combat_sniper_lane: {
    theme: "sniper",
    reactions: {
      smoke: "WP blooms. The next crack goes somewhere else.",
      rush: "Hull MG and boots. The building exhales dust.",
      bypass: "Wide arc costs time. The rifle finds another target.",
    },
  },
  w19_t2_combat_mg42: {
    theme: "mg42",
    reactions: {
      coax: "Green tracers stitch the hedge. The belt runs hot.",
      wp: "Smoke and fire. Brutal geometry.",
      back: "Angle lost. The MG42 keeps talking to someone else.",
    },
  },
  w19_t2_elite_halftrack: {
    theme: "halftrack",
    reactions: {
      first: "First shot wins. The road clears.",
      flank: "Thin armor found. The ambush dies quiet.",
      withdraw: "Live ammo beats dead heroics. You pull back.",
    },
  },
  gen_human_refugee_cart: {
    followKind: "human",
    reactions: {
      help: "Hands take food. Eyes that have seen too much say thank you without words.",
      horn: "They scatter. The crew doesn't look at each other's faces.",
      detour: "Soft ground costs time. It costs less than memory.",
    },
  },
  npc_field_kitchen: {
    followKind: "npc",
    reactions: {
      sit: "Stew, rumors, a laugh that isn't forced. Small mercy.",
      rumor: "He knows which road the last column lost tanks on.",
      go: "You roll on hungry. Familiar.",
    },
  },
  anchor_munster_rubble: {
    theme: "munster",
    reactions: {
      pair: "Room by room. Rubble and rifle pop in the cathedral quarter.",
      ram: "Brick dust and momentum. The barricade remembers tanks.",
      overwatch: "You own the intersection. Movement dies in the open.",
    },
  },
};

for (const [id, spec] of Object.entries(WAVE19_CURATED_DEPTH)) {
  const ev = WAVE19_EVENTS[id];
  if (ev) WAVE19_EVENTS[id] = applyCuratedDepth(ev, spec);
}

export const WAVE19_ANCHOR_IDS = ["anchor_munster_rubble"] as const;
export const WAVE19_SOCIAL_IDS = ["social_letters_censor"] as const;
export const WAVE19_BRIEFING_IDS = ["briefing_final_push"] as const;

export const WAVE19_POOL_KIND_BUCKETS: Partial<PoolKindBuckets> = {
  travel: ["gen_travel_fuel_cache", "gen_travel_pontoon_delay", "gen_travel_mine_marker"],
  supply: ["gen_supply_parts_crate"],
  human: ["gen_human_refugee_cart", "gen_human_church_bell"],
  npc: ["npc_field_kitchen"],
  combat: ["gen_combat_rocket_barrage"],
  infantry: ["gen_combat_sniper_lane"],
  defensive: ["gen_defensive_roadblock_hold"],
  offensive: ["gen_offensive_hill_grab"],
  elite: ["elite_stug_hunt"],
};

export const WAVE19_TIER2_BUCKETS: Partial<PoolKindBuckets> = {
  travel: ["w19_t2_travel_wire"],
  supply: ["w19_t2_supply_oil"],
  human: ["w19_t2_human_piano"],
  npc: ["w19_t2_npc_dentist"],
  combat: ["w19_t2_combat_mortar"],
  infantry: ["w19_t2_combat_mg42"],
  defensive: ["w19_t2_defensive_hedgehog"],
  offensive: ["w19_t2_offensive_barn"],
  elite: ["w19_t2_elite_halftrack"],
  rest: ["w19_t2_rest_letter"],
};

export function applyWave19PoolRegistration(): string[] {
  const t1 = registerPoolKindsAndRebuildPool(WAVE19_POOL_KIND_BUCKETS);
  const t2 = registerTier2PoolKinds(WAVE19_TIER2_BUCKETS);
  return [...t1, ...t2];
}
