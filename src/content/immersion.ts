import {
  deriveRiskTags,
  isNumericChoiceHint,
  riskTagsToHint,
} from "../engine/riskTelegraph";
import type { EventChoice, RuntimeEvent, StakesLevel, TierFlavorMap } from "../engine/types";

const COMBAT_TIER_FLAVOR: TierFlavorMap = {
  1: "The dice go cold. Metal finds you anyway — a hit you feel in your teeth.",
  2: "Messy work. You survive it, but the tank and the crew remember.",
  3: "Good enough. Nobody cheers. Everybody breathes.",
  4: "Rare clean execution. For a moment the war feels survivable.",
};

const CRITICAL_TIER_FLAVOR: TierFlavorMap = {
  1: "Near disaster. Someone should be dead. Someone might still be.",
  2: "You hold the line by inches. The cost shows up later.",
  3: "The moment breaks your way. Don't mistake luck for safety.",
  4: "History notices. The crew will talk about this one.",
};

const TRAVEL_TIER_FLAVOR: TierFlavorMap = {
  1: "Wrong ground. Tracks slip or the route closes behind you.",
  2: "Slow miles. Time and fuel bleed while the column waits.",
  3: "The road gives enough. You take it without complaint.",
  4: "Clean passage — rare enough to mention in the log.",
};

const SUPPLY_TIER_FLAVOR: TierFlavorMap = {
  1: "Scrounge fails. Empty hands and shorter rations.",
  2: "Partial haul. Enough to limp, not enough to relax.",
  3: "Fair trade. The tank eats and the crew notices.",
  4: "Jackpot — for today, anyway.",
};

function defaultStakes(
  kind: RuntimeEvent["kind"],
  useDice: boolean | undefined,
  catalogId: string,
): StakesLevel {
  if (catalogId.startsWith("foot_")) return "critical";
  if (kind === "historical_anchor" || kind === "elite_encounter") return "critical";
  if (
    useDice &&
    (kind === "tank_combat" ||
      kind === "infantry_combat" ||
      kind === "defensive_stand" ||
      kind === "offensive_assault")
  ) {
    return "elevated";
  }
  if (kind === "travel" && useDice) return "elevated";
  return "routine";
}

function defaultStakesNote(kind: RuntimeEvent["kind"], id: string): string | undefined {
  if (kind === "historical_anchor") {
    return "This beat writes into the campaign. Hull, nerve, and salvage all swing here — worth a table talk before anyone commits.";
  }
  if (kind === "elite_encounter") {
    return "Named engagement. A bad roll or the wrong ammo call can gut the hull or the crew.";
  }
  if (kind === "tank_combat") {
    return "Main-gun fight. Every round spent is gone; every hit on the hull stacks.";
  }
  if (kind === "infantry_combat" || kind === "defensive_stand") {
    return "Fausts and rifles don't respect armor. Suppress, break contact, or spend HE — disagree now, pay later.";
  }
  if (kind === "offensive_assault") {
    return "Push costs fuel, nerve, and bodies. Hold the column together or lose the objective.";
  }
  if (id.startsWith("foot_")) {
    return "On foot, one wrong move pins you or ends you. No hull to hide behind.";
  }
  if (id.startsWith("social_") || id === "tank_replace_fork") {
    return "The crew will remember what you decide here — morale and trust, not just salvage.";
  }
  return undefined;
}

function defaultAtmosphere(kind: RuntimeEvent["kind"], id: string): string | undefined {
  if (kind === "tank_combat") {
    return "Smoke hangs in the viewport glass. The intercom crackles with voices trying not to shake.";
  }
  if (kind === "infantry_combat" || kind === "defensive_stand") {
    return "Dirt and brass smell the same after a while. The treeline doesn't move — until it does.";
  }
  if (kind === "travel") {
    return "The road is what the war leaves behind when it passes through.";
  }
  if (kind === "supply") {
    return "Everything scarce has a price. Someone always pays it.";
  }
  if (kind === "rest") {
    return "Quiet is never empty out here — just waiting in a different shape.";
  }
  if (kind === "human_moment") {
    return "For a second the war forgets to shout.";
  }
  if (id.startsWith("foot_")) {
    return "No armor. No radio comfort. Just boots, breath, and whatever's ahead.";
  }
  return undefined;
}

function choiceRiskFromBonus(bonus: number | undefined): EventChoice["choiceRisk"] {
  if (bonus == null) return "tactical";
  if (bonus >= 2) return "cautious";
  if (bonus >= 1) return "tactical";
  if (bonus <= -1) return "aggressive";
  return "tactical";
}

function enrichChoice(ch: EventChoice, ev: RuntimeEvent): EventChoice {
  const out = { ...ch };
  if (!out.choiceRisk && !out.flavorOnly) {
    out.choiceRisk = choiceRiskFromBonus(out.modifierBonus);
  }
  if (!out.flavorOnly && out.effects.length > 0) {
    const authored = out.choiceHint && !isNumericChoiceHint(out.choiceHint);
    if (authored) {
      return out;
    }
    const tags = out.riskTags?.length ? out.riskTags : deriveRiskTags(out, ev);
    if (tags.length > 0) {
      out.riskTags = tags;
      out.choiceHint = riskTagsToHint(tags);
    }
  }
  return out;
}

/** Per-event immersion overrides (Batch A/B rich authoring). */
type ImmersionRich = Partial<Omit<RuntimeEvent, "choices">> & {
  choices?: Partial<EventChoice>[];
};

const IMMERSION_RICH: Record<string, ImmersionRich> = {
  anchor_cobra: {
    atmosphere:
      "The horizon is dust and fire. The column moves like a single animal afraid of its own tail.",
    stakesNote:
      "Cobra is speed or suicide. Commander wants the corridor; Driver wants open road; Loader sees salvage in the wreckage.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    choices: [
      {
        id: "push",
        dialogueLine: "We stay on the column. If we fall off, we're dead in the ditch alone.",
        choiceRisk: "tactical",
      },
      {
        id: "flank_column",
        dialogueLine: "There's a parallel track. Less crowd. More unknown.",
        choiceRisk: "aggressive",
      },
      {
        id: "scavenge_chaos",
        dialogueLine: "We're burning fuel standing still. Let me pull what we can from the wrecks.",
        choiceRisk: "cautious",
      },
    ],
  },
  anchor_bulge: {
    atmosphere: "Snow erases distance. Every muzzle flash looks closer than it is.",
    stakesNote:
      "The Bulge junction: hold and bleed, or trade ground for lives. Gunner wants HE now; Driver wants ridgeline.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  gen_combat_tiger_lite: {
    atmosphere:
      "A long hull shadow slides across the hedgerow gap. Sloped armor catches the light wrong.",
    stakesNote:
      "Tiger contact. AP and angle — or smoke and run. Gunner and Commander will not agree on which cowardice is worse.",
    tierFlavor: COMBAT_TIER_FLAVOR,
    choices: [
      {
        id: "flank_ap",
        dialogueLine: "Give me the flank. Load AP. I'm not dying in his kill zone.",
        choiceRisk: "aggressive",
      },
      {
        id: "smoke_wp",
        dialogueLine: "WP and break contact. Living tanks fight again.",
        choiceRisk: "cautious",
      },
      {
        id: "driver_flank",
        dialogueLine: "I'll take the angle. You shoot when I say when.",
        choiceRisk: "tactical",
      },
    ],
  },
  gen_infantry_treeline: {
    atmosphere: "Muzzle flashes stitch the treeline. Someone has a tube — maybe Faust, maybe fear.",
    stakesNote:
      "Infantry in the trees with AT threat. HE burns ammo; hull MG saves rounds; Driver's overrun gambles the tracks.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  foot_woods: {
    atmosphere: "The forest closes. Sound goes strange — too close, too far, all at once.",
    stakesNote: "Disoriented on foot. Push, go wide, or climb — each path has its own ambush.",
    stakes: "critical",
    choices: [
      { id: "slow", dialogueLine: "Slow. Ears before eyes.", choiceRisk: "cautious" },
      { id: "gunner_lead", dialogueLine: "I'll take point. Keep up.", choiceRisk: "aggressive" },
      { id: "loader_pathfind", dialogueLine: "Deer track — we go covered.", choiceRisk: "tactical" },
    ],
  },
  foot_bridge: {
    atmosphere: "The bridge groans. One crossing at a time. The water below doesn't care.",
    stakesNote: "Exposed crossing. Rush, crawl, or find another way — sniper math applies.",
    stakes: "critical",
  },
  elite_tiger_wallendorf: {
    atmosphere:
      "Village stone and a Tiger in the road. The hull fills the gap like a wall that learned to move.",
    stakesNote:
      "Wallendorf Tiger — village geometry favors him. This is the kind of fight crews tell stories about or don't tell at all.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  anchor_rhine: {
    atmosphere: "The river is a line someone else drew. Engineers wave flags that mean nothing until they mean everything.",
    stakesNote: "Rhine crossing — engineers, timing, and hull on open ground. Commander and Driver own the call.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  anchor_huertgen: {
    atmosphere: "The forest eats sound. Trees fall the wrong direction when the shells find them.",
    stakesNote: "Hürtgen — nerve and hull bleed in the green. There is no clean option, only expensive ones.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_paris_skirt: {
    atmosphere: "Liberation smells like diesel and flowers left too long in the heat.",
    stakesNote: "Paris outskirts — speed vs discipline. The crew wants a story; the war wants discipline.",
  },
  anchor_siegfried: {
    atmosphere: "Concrete and wire. The line was built to make courage feel like a mistake.",
    stakesNote: "Siegfried Line — bunkers don't flinch. AP and nerve spend fast here.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_push_germany: {
    atmosphere: "Every village looks the same after enough shelling — stone, smoke, and eyes in windows.",
    stakesNote: "Push into Germany — hold formation or chase wounded pride into an ambush.",
  },
  anchor_seine_crossing: {
    atmosphere: "Mud and diesel at the water's edge. The far bank might be friendly. Might not.",
    stakesNote: "Seine crossing — exposure is total. Debate who goes first and who covers.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_cologne: {
    atmosphere: "Rubble channels the streets. A Panther in rubble is a nightmare with geometry on its side.",
    stakesNote: "Cologne — urban tank duel. One wrong corner costs the hull or the crew.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_ve_day: {
    atmosphere: "Gunfire in the distance like a argument that won't end. The war is old. The crew is older.",
    stakesNote: "Final days — what you do here is what the Journal remembers. No take-backs.",
  },
  elite_night_ambush_stub: {
    atmosphere: "Darkness has weight. The treeline is a wall you can't read.",
    stakesNote: "Night ambush — visibility is a resource you don't have. HE or hold fire — decide together.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  elite_stug_nest: {
    atmosphere: "A low silhouette in the hedgerow — hard to see, easy to die from.",
    stakesNote: "StuG nest — HEAT or flank. Gunner and Driver need one plan, not two.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  elite_konkurs_column: {
    atmosphere: "King Tiger column. The road wasn't built for this much armor moving with intent.",
    stakesNote: "King Tiger column — AP discipline and nerve. This is salvage or burial.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  elite_remagen: {
    atmosphere: "Bridge steel and river wind. Every second on the approach is a second someone watches.",
    stakesNote: "Remagen approach — SS rear-guard. Spend hull or spend time; rarely both.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  tank_replace_fork: {
    stakesNote: "No hull — how you replace it defines the next mission. Depot, capture, or beg — choose as a crew.",
  },
  social_cards: {
    stakesNote: "Cards on a crate — money, pride, and boredom. Small stakes until someone makes them large.",
  },
  social_letters: {
    stakesNote: "Mail call — what you read aloud lands different than what you keep private.",
  },
  social_chaplain: {
    stakesNote: "The chaplain isn't here to judge. The crew still might.",
  },
  social_rumor: {
    stakesNote: "Rumors move faster than orders. What you repeat becomes true enough to hurt.",
  },
  foot_fields: {
    atmosphere: "Open ground swallows sound. The sky is too wide.",
    stakes: "critical",
    stakesNote: "On foot without the hull — exposure is total. Commander, Driver, and Gunner own the call.",
    choices: [
      { id: "sprint", dialogueLine: "Run the open. Pray.", choiceRisk: "aggressive" },
      { id: "time_it", dialogueLine: "Wait for cloud. Then cross.", choiceRisk: "tactical" },
      { id: "rear_cover", dialogueLine: "I'll cover rear. Go.", choiceRisk: "cautious" },
    ],
  },
  foot_lines: {
    atmosphere: "Diesel smoke and somebody else's hurry. Charity at unsafe speed.",
    stakes: "critical",
    stakesNote: "Water and directions are both scarce — share or chase.",
    choices: [
      { id: "drink", dialogueLine: "Pass the canteen. Everybody drinks.", choiceRisk: "tactical" },
      { id: "wave_down", dialogueLine: "Hold up — we need the route.", choiceRisk: "cautious" },
      { id: "follow_dust", dialogueLine: "Their dust is better than our guess.", choiceRisk: "aggressive" },
    ],
  },
  foot_sniper: {
    atmosphere: "A crack that doesn't echo right. Someone is measuring you.",
    stakes: "critical",
    stakesNote: "Sniper math — move, drop, or smoke. Wrong choice costs a name.",
    choices: [
      { id: "smoke", dialogueLine: "Smoke. Crawl. Don't stand up.", choiceRisk: "cautious" },
      { id: "scatter", dialogueLine: "Scatter. Five targets.", choiceRisk: "tactical" },
      { id: "return_fire", dialogueLine: "Suppress the treeline. Move on my fire.", choiceRisk: "aggressive" },
    ],
  },
  foot_ditch: {
    atmosphere: "A drainage ditch smells like fuel and old rain.",
    stakes: "critical",
    stakesNote: "Follow the ditch or climb out — mud and visibility trade places.",
    choices: [
      { id: "follow", dialogueLine: "Ditch is honest. We follow it.", choiceRisk: "cautious" },
      { id: "asst_scouts", dialogueLine: "I'll scout ahead. No surprises.", choiceRisk: "tactical" },
      { id: "loader_helps", dialogueLine: "Grab his arm. Nobody falls behind.", choiceRisk: "tactical" },
    ],
  },
  foot_gate: {
    atmosphere: "Friendly lines smell like hot food and diesel. Counting feels like cargo.",
    stakes: "critical",
    stakesNote: "Gate sergeant holds power over food and passage — talk, trade, or push through.",
    choices: [
      { id: "talk", dialogueLine: "Full report. Names, map, what we saw.", choiceRisk: "cautious" },
      { id: "scout_first", dialogueLine: "Circle first. Friendly isn't always friendly.", choiceRisk: "tactical" },
      { id: "loader_asks", dialogueLine: "Where's the chow line?", choiceRisk: "aggressive" },
    ],
  },
  social_drunk: {
    atmosphere: "Cellar air and bad decisions already made.",
    stakesNote: "Found liquor tests discipline — humor, anger, or silence will spread.",
    choices: [
      { id: "let_it_happen", dialogueLine: "Let him have the night. We all need one.", choiceRisk: "cautious" },
      { id: "join_in", dialogueLine: "Pour one for me too.", choiceRisk: "tactical" },
      { id: "sober_up", dialogueLine: "Water. Now. Bad idea to lose a man to a cellar.", choiceRisk: "aggressive" },
    ],
  },
  social_found_item: {
    atmosphere: "A child's toy in liberated dust. The war didn't ask permission to intrude.",
    stakesNote: "Keep it, bury it, or share it — the crew's conscience is on the table.",
    choices: [
      { id: "keep_it", dialogueLine: "It rides with me. Don't ask.", choiceRisk: "cautious" },
      { id: "leave_it", dialogueLine: "Put it back. Someone will come home.", choiceRisk: "tactical" },
      { id: "share_it", dialogueLine: "Everybody hold it once. Then decide.", choiceRisk: "aggressive" },
    ],
  },
  social_new_arrival: {
    atmosphere: "A replacement who hasn't learned the crew's silences yet.",
    stakesNote: "Trust is earned fast or never — integrate, test, or keep distance.",
    choices: [
      { id: "let_crew_name", dialogueLine: "Crew finds the name. That's how it works.", choiceRisk: "tactical" },
      { id: "ask_him", dialogueLine: "What do you want us to call you?", choiceRisk: "cautious" },
      { id: "give_name", dialogueLine: "That's your name. Don't argue.", choiceRisk: "aggressive" },
    ],
  },
  social_dog_returns: {
    atmosphere: "Mud on paws. No owner. The war pauses for a heartbeat.",
    stakesNote: "The dog came back — feed, chase, or adopt the distraction.",
    choices: [
      { id: "keep_him", dialogueLine: "He stays. Vote's unanimous.", choiceRisk: "tactical" },
      { id: "feed_send_off", dialogueLine: "Feed him. Say goodbye.", choiceRisk: "cautious" },
      { id: "wave_him_in", dialogueLine: "Come on, boy. Your call.", choiceRisk: "aggressive" },
    ],
  },
  gen_combat_panther: {
    choices: [
      {
        id: "flank_ap",
        dialogueLine: "Give me the flank. AP in the tube. I want his engine.",
        choiceRisk: "aggressive",
      },
      {
        id: "smoke_break",
        dialogueLine: "Smoke and break contact. Living tanks fight tomorrow.",
        choiceRisk: "cautious",
      },
      {
        id: "driver_angle",
        dialogueLine: "I'll put us on the high shoulder. You shoot when I say.",
        choiceRisk: "tactical",
      },
    ],
  },
  gen_combat_pak: {
    choices: [
      {
        id: "he_gun",
        dialogueLine: "HE the whole hedgerow. Collapse it before they reload.",
        choiceRisk: "aggressive",
      },
      {
        id: "smoke_evade",
        dialogueLine: "WP screen and back up. Trade ground for breathing room.",
        choiceRisk: "cautious",
      },
      {
        id: "driver_back_cover",
        dialogueLine: "I'll fold the hull into the ground. Gunner shoots the pause.",
        choiceRisk: "tactical",
      },
    ],
  },
  gen_combat_heat_round: {
    choices: [
      {
        id: "heat_shot",
        dialogueLine: "One HEAT tray. Make it count. I'm not missing.",
        choiceRisk: "aggressive",
      },
      {
        id: "smoke",
        dialogueLine: "Smoke and reposition. We don't owe them a duel.",
        choiceRisk: "cautious",
      },
    ],
  },
  gen_combat_mortar: {
    choices: [
      {
        id: "move",
        dialogueLine: "Move before the bracket tightens. Everybody hold on.",
        choiceRisk: "tactical",
      },
      {
        id: "dig",
        dialogueLine: "Dismount and dig. I want dirt between us and the sky.",
        choiceRisk: "cautious",
      },
    ],
  },
  gen_infantry_cellar: {
    choices: [
      {
        id: "he_room",
        dialogueLine: "HE through the window. Clear the room before we enter.",
        choiceRisk: "aggressive",
      },
      {
        id: "commander_entry",
        dialogueLine: "I'll go first with a grenade. Nobody else dies learning the layout.",
        choiceRisk: "tactical",
      },
    ],
  },
  gen_defensive_flare: {
    choices: [
      {
        id: "fire_now",
        dialogueLine: "Fire now while they're lit. Don't wait for perfect.",
        choiceRisk: "aggressive",
      },
      {
        id: "hold",
        dialogueLine: "Hold fire. Make them think we're not here.",
        choiceRisk: "cautious",
      },
    ],
  },
  gen_cmd_crossing: {
    choices: [
      {
        id: "hull_leads",
        dialogueLine: "Hull first. If it sinks, we learn fast.",
        choiceRisk: "aggressive",
      },
      {
        id: "infantry_screens",
        dialogueLine: "Infantry screens the ford. We cross on their backs.",
        choiceRisk: "tactical",
      },
    ],
  },
  gen_loader_shell_stuck: {
    choices: [
      {
        id: "force",
        dialogueLine: "I'll force it. Everybody clear the breech.",
        choiceRisk: "aggressive",
      },
      {
        id: "clear_safe",
        dialogueLine: "Clear it slow. One mistake and we're all deaf.",
        choiceRisk: "cautious",
      },
    ],
  },
  npc_officer_orders: {
    stakes: "elevated",
    stakesNote: "Staff officer blocks the road — compliance costs time; defiance costs paperwork or worse.",
  },
  npc_prisoner_moment: {
    stakes: "elevated",
    stakesNote: "Prisoner at the roadside — mercy, intel, or hard silence.",
  },
  npc_war_correspondent: {
    stakes: "routine",
    stakesNote: "Reporter wants a story — what you say becomes history's first draft.",
  },
  npc_replacement_depot: {
    stakes: "elevated",
    stakesNote: "Replacement depot — take what they offer or hold out for better steel.",
  },
  npc_padre_field: {
    stakes: "routine",
    stakesNote: "Padre on the road — confession without armor; crew nerve or cynicism.",
  },
  gen_combat_halftrack_belt: {
    stakesNote: "Half-track MG belt — suppress, flank, or hull-down. Spend HE or WP.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_combat_88_flash: {
    stakesNote: "Eighty-eight flash — AP duel, smoke break, or arty gamble.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_combat_hetzer_lite: {
    stakesNote: "Hetzer hull-down — AP snap, flank angle, or smoke for geometry.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_combat_panzerschreck: {
    stakesNote: "Panzerschreck in a cellar mouth — HE the room, MG suppress, or smoke past.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_infantry_pillbox: {
    stakesNote: "Concrete embrasures — HE the slit, coax suppress, or smoke bypass.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_defensive_arty_incoming: {
    stakesNote: "Bracketing tubes — hold the grid, break the bracket, or spot for counter-battery.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_combat_mg_nest: {
    stakesNote: "Farm-wall MG nest — suppress, HE the room, or smoke through.",
  },
  anchor_remagen_bridge: {
    stakes: "critical",
    stakesNote: "Rhine crossing — open treads, covering fire, or wait for engineers.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  anchor_metz_siege: {
    stakes: "critical",
    stakesNote: "Metz ring — indirect fire, night infiltration, or hold and ration.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  gen2_combat_nashorn: {
    stakesNote: "Nashorn at range — smoke close, AP snap, or hull-down patience.",
    tierFlavor: COMBAT_TIER_FLAVOR,
    choices: [
      {
        id: "smoke_close",
        dialogueLine: "WP now. We close or we die at their range.",
        choiceRisk: "tactical",
      },
      {
        id: "snap",
        dialogueLine: "Load AP. I see movement — I'm taking it.",
        choiceRisk: "aggressive",
      },
    ],
  },
  gen2_combat_king_tiger_far: {
    stakesNote: "King Tiger far — smoke, desperate AP, or withdraw to fight again.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  gen_defensive_wave: {
    stakes: "elevated",
    stakesNote: "Incoming wave — hold the line, flare, or counter-battery.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_offensive_push: {
    stakes: "elevated",
    stakesNote: "Assault lane — push, smoke, or hold for support.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen2_elite_night_tiger: {
    stakesNote: "Night Tiger — WP blind, flash trade, or hold fire and listen.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  gen2_elite_elefant: {
    stakesNote: "Elefant on the road — flank, blind optics, or report and survive.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  gen2_travel_sunken_road: {
    stakes: "elevated",
    stakesNote: "Sunken road — speed risks ambush; infantry ahead costs time; smoke costs WP.",
  },
  gen2_combat_pak_ambush_road: {
    stakesNote: "PAK culvert — smoke, AP duel, or ram past and pray.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  anchor_ruhr_pocket: {
    stakes: "critical",
    stakesNote: "Pocket collapse — channel prisoners, push through, or search for hidden fight.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  anchor_wesel_assault: {
    stakes: "critical",
    stakesNote: "Rhine assault — lead crossing, cover engineers, or wait the ferry.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  elite_jagdpanther_hollow: {
    stakesNote: "Jagdpanther hull-down — AP flank, smoke reposition, or driver buys angle.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  elite_farm_strongpoint: {
    stakesNote: "Fortified farm — HE the upper floor, MG clear, or bypass and leave a throat.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  gen_combat_pz4_ambush: {
    stakesNote: "Panzer IV ambush — AP duel, HE the barn, or smoke and reverse.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_combat_flak88_roadblock: {
    stakesNote: "Flak 88 roadblock — HE suppress, field flank, or WP screen.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_infantry_artillery_mist: {
    stakesNote: "Friendly arty short — cease fire, smoke the grid, or extract wounded.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_infantry_surrender_wave: {
    stakesNote: "Surrender wave — hold fire, search first, or cover the approach.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_defensive_ruhr_line: {
    stakesNote: "Last line — hold junction, spoiling HE, or fighting fallback.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_offensive_bypass_town: {
    stakesNote: "Bypass town — speed risks AT, smoke costs WP, hold cuts the road.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  // Wave 19 — solo release content
  gen_officer_roadblock: {
    stakes: "elevated",
    stakesNote: "Staff roadblock — paperwork, ditch, or turret stare; each costs something different.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_supply_black_market: {
    stakes: "elevated",
    stakesNote: "Black market — food, ammo, or intel; every deal leaves a paper trail somewhere.",
    tierFlavor: SUPPLY_TIER_FLAVOR,
  },
  gen_travel_checkpoint_abandoned: {
    stakesNote: "Empty checkpoint — search, roll past, or treat it as bait.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_convoy_pass: {
    stakesNote: "Convoy on the trace — merge, hold, or let them eat the road.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_bogged_soft: {
    stakesNote: "Soft ground — winch, bypass, or accept delay before dark.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_crossroads_smoke: {
    stakesNote: "Smoke at the crossroads — push, scout, or wait it out.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_rubble_choke: {
    stakesNote: "Rubble choke — clear, squeeze, or detour wide.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_night_halt: {
    stakesNote: "Night halt — hold discipline, rotate watch, or move early.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_supply_ammo_crate: {
    stakesNote: "Ammo off the road — strip, report, or pass.",
    tierFlavor: SUPPLY_TIER_FLAVOR,
  },
  gen_supply_water_shortage: {
    stakes: "elevated",
    stakesNote: "Water failed — share, scrounge, or press on thirsty.",
    tierFlavor: SUPPLY_TIER_FLAVOR,
  },
  gen_travel_fuel_cache: {
    stakesNote: "Abandoned fuel — take it, mark it, or leave it for MPs.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_pontoon_delay: {
    stakesNote: "Pontoon queue — wait, scout a ford, or force the crossing.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_travel_mine_marker: {
    stakesNote: "Marked mines — follow treads, probe on foot, or detour wide.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  gen_supply_parts_crate: {
    stakesNote: "Abandoned parts — strip, share coords, or keep rolling.",
    tierFlavor: SUPPLY_TIER_FLAVOR,
  },
  gen_human_refugee_cart: {
    stakes: "elevated",
    stakesNote: "Refugees on the verge — help, push through, or detour.",
  },
  gen_human_church_bell: {
    stakes: "elevated",
    stakesNote: "Church bell — investigate, silence it, or leave the ghosts.",
  },
  npc_field_kitchen: {
    stakesNote: "Field kitchen — eat, trade intel, or decline.",
  },
  gen_combat_sniper_lane: {
    stakes: "elevated",
    stakesNote: "Sniper lane — smoke, rush, or bypass wide.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_combat_rocket_barrage: {
    stakes: "elevated",
    stakesNote: "Rocket barrage — brace, move between salvos, or counter-battery HE.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_defensive_roadblock_hold: {
    stakesNote: "Roadblock hold — discipline, flares, or aggressive sortie.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  gen_offensive_hill_grab: {
    stakesNote: "High ground — assault, flank, or suppress then move.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  anchor_munster_rubble: {
    stakes: "critical",
    stakesNote: "Münster rubble — paired clearance, ram, or overwatch.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  elite_stug_hunt: {
    stakes: "critical",
    stakesNote: "StuG ambush — flank, bait, or smoke reposition.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  social_letters_censor: {
    stakesNote: "Censored mail — read aloud, burn unopened, or write one honest line.",
  },
  briefing_final_push: {
    stakesNote: "Final push briefing — reserves, ammo, route.",
  },
  w19_t2_travel_wire: {
    stakesNote: "Wire across the trace — probe, follow treads, or wide detour.",
    tierFlavor: TRAVEL_TIER_FLAVOR,
  },
  w19_t2_supply_oil: {
    stakesNote: "Abandoned fuel drums — siphon, mark, or skip.",
    tierFlavor: SUPPLY_TIER_FLAVOR,
  },
  w19_t2_human_piano: {
    stakes: "elevated",
    stakesNote: "Piano in ruins — listen, stop it, or leave.",
  },
  w19_t2_npc_dentist: {
    stakesNote: "Field dentist — treat jaw, decline, or trade morphine.",
  },
  gen_human_piano_key: {
    stakesNote: "Piano key in the street — play briefly, refuse, or move on.",
  },
  gen_human_dog_tags: {
    stakesNote: "Tags on a fence post — return, keep, or look away.",
  },
  npc_medic_litters: {
    stakesNote: "Aid station on the verge — lend hands or keep rolling.",
  },
  npc_pilot_down: {
    stakesNote: "Downed pilot — recover, redirect, or leave him to MPs.",
  },
  npc_radioman_net: {
    stakesNote: "Dirty net — share codes, stay silent, or switch frequency.",
  },
  npc_surrender_column: {
    stakesNote: "Surrender column — escort, pass through, or search first.",
  },
  w19_t2_combat_mg42: {
    stakes: "elevated",
    stakesNote: "MG42 hedge — coax, WP, or back off.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  w19_t2_combat_mortar: {
    stakes: "elevated",
    stakesNote: "Mortar bracket — move, smoke, or hull down.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  w19_t2_defensive_hedgehog: {
    stakesNote: "Dragon's teeth — hold, flare, or patrol.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  w19_t2_offensive_barn: {
    stakesNote: "Barn strongpoint — HE, infantry clear, or ram.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  w19_t2_elite_halftrack: {
    stakes: "critical",
    stakesNote: "Sd.Kfz. AT — first shot, flank, or withdraw.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  w19_t2_rest_letter: {
    stakesNote: "Rest stop — write home, sleep, or stand watch.",
    atmosphere: "Quiet hour. Paper smells like home and diesel.",
  },
};

function mergeChoices(
  base: EventChoice[],
  overrides?: Partial<EventChoice>[],
): EventChoice[] {
  if (!overrides?.length) return base.map((c) => c);
  const byId = new Map(overrides.filter((c) => c.id).map((c) => [c.id!, c]));
  return base.map((c) => {
    const o = byId.get(c.id);
    return o ? { ...c, ...o, effects: c.effects } : c;
  });
}

export function applyImmersion(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  const rich = IMMERSION_RICH[catalogId] ?? IMMERSION_RICH[ev.id];
  const stakes = rich?.stakes ?? ev.stakes ?? defaultStakes(ev.kind, ev.useDice, catalogId);
  const useDice = rich?.useDice ?? ev.useDice;

  let tierFlavor = rich?.tierFlavor ?? ev.tierFlavor;
  if (!tierFlavor && useDice) {
    tierFlavor = stakes === "critical" ? CRITICAL_TIER_FLAVOR : COMBAT_TIER_FLAVOR;
  }

  const patched: RuntimeEvent = {
    ...ev,
    ...rich,
    id: ev.id,
    kind: ev.kind,
    narrative: rich?.narrative ?? ev.narrative,
    choices: mergeChoices(
      ev.choices.map((c) => enrichChoice(c, { ...ev, useDice: !!useDice })),
      rich?.choices as Partial<EventChoice>[] | undefined,
    ).map((c) => enrichChoice(c, { ...ev, useDice: !!useDice, stakes })),
    stakes,
    stakesNote: rich?.stakesNote ?? ev.stakesNote ?? defaultStakesNote(ev.kind, catalogId),
    atmosphere: rich?.atmosphere ?? ev.atmosphere ?? defaultAtmosphere(ev.kind, catalogId),
    tierFlavor,
    useDice,
  };

  return patched;
}

export function patchEventCatalogImmersion(catalog: Record<string, RuntimeEvent>): void {
  for (const id of Object.keys(catalog)) {
    const ev = catalog[id];
    if (ev) catalog[id] = applyImmersion(ev, id);
  }
}
