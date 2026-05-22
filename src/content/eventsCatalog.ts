import type { RuntimeEvent } from "../engine/types";
import { patchEventCatalogImmersion } from "./immersion";

/** Authoring-time catalog; cloned + templated at runtime. */
export const EVENT_CATALOG: Record<string, RuntimeEvent> = {
  briefing_generic: {
    id: "briefing_generic",
    kind: "briefing",
    atmosphere: "The CP is a requisitioned room in something that used to matter — a schoolhouse, a stable, a church annex. The smell of candles and wet maps hasn't left.",
    narrative:
      "The company commander lays a grease-pencil map across whatever surface is available. The marks are corrections on corrections, the road already revised twice before you arrived.\n\nObjective: {objective}. {tank} is fueled and staged. The crew is waiting.",
    quote: '{cmd}: "Listen up. We roll in ten. Questions after we\'re moving."',
    preChoiceNpc: { speaker: "Company Commander", line: "I know it's tight. It's always tight. That's why it's your crew and not someone else's." },
    choices: [
      {
        id: "ack",
        label: "\"Understood. We'll take the left approach.\"",
        role: "commander",
        dialogueLine: "Understood, sir. We'll take the left approach and push for the junction.",
        outcomeText: "The crew falls in. Hatches clang shut like punctuation. The column starts moving before anyone has time to change their mind.",
        npcReply: "That's the one. Don't lose the road.",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
      {
        id: "request_smoke",
        label: "\"We'll need smoke on that ridge first, sir.\"",
        role: "gunner",
        dialogueLine: "Request smoke on the ridge at grid 441 before we commit, sir. Blind approach otherwise.",
        outcomeText: "He checks the map. Nods. The smoke is called in. You mount up two minutes later, the ridge already turning white.",
        npcReply: "Smoke is on the way. Move when it lifts, not before.",
        effects: [{ op: "mod_all_constitution", delta: 3 }, { op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
      {
        id: "mount_quiet",
        label: "\"Yes sir.\" [say nothing else]",
        role: "commander",
        dialogueLine: "Yes sir.",
        flavorOnly: true,
        outcomeText: "You mount up. Some things don't need words. The engine turns over and the rest is motion.",
        effects: [],
      },
    ],
  },
  briefing_attack: {
    id: "briefing_attack",
    kind: "briefing",
    atmosphere: "Morning. Cold. The kind of light that makes everything look like it's already happened.",
    narrative:
      "The briefing is sharp and short — the CO doesn't believe in elaborate explanations before a push. The map shows a fortified position. There are two roads in and one way this ends well.\n\nObjective: {objective}. {tank} leads the breach. Infantry follows through the gap you make.",
    quote: '{cmd}: "We hit hard and we hit first. There is no second option."',
    preChoiceNpc: { speaker: "Capt. Hayes", line: "I need that position gone by 0800 or we lose the artillery window. Don't slow down for anything that's already dead." },
    choices: [
      {
        id: "direct_assault",
        label: "\"We'll take it straight down the main approach.\"",
        role: "commander",
        dialogueLine: "We go straight. Direct approach, full speed, keep infantry in our wake.",
        outcomeText: "Direct is dangerous but it's also decisive. The hull takes paint off the treeline and breaks into the open. The crew knows what to do.",
        npcReply: "That's what I needed to hear. Go.",
        effects: [{ op: "mod_all_constitution", delta: 4 }, { op: "mod_tank_health", delta: -5 }],
      },
      {
        id: "flank_request",
        label: "\"Give me twenty minutes and I'll flank the left position.\"",
        role: "driver",
        dialogueLine: "There's a drainage ditch on the left side. Twenty minutes and I can bring us in behind their gun position.",
        outcomeText: "He checks the watch against the map and gives you the twenty. The ditch is tight but the angle is everything you hoped.",
        npcReply: "Twenty minutes. Not twenty-one.",
        effects: [{ op: "mod_all_constitution", delta: 5 }, { op: "add_salvage", amount: 2 }],
      },
      {
        id: "ack_push",
        label: "\"Yes sir.\" [mount up]",
        role: "commander",
        dialogueLine: "Yes sir.",
        flavorOnly: true,
        outcomeText: "Nothing left to say. The tank moves. The attack begins.",
        effects: [],
      },
    ],
  },
  briefing_defense: {
    id: "briefing_defense",
    kind: "briefing",
    atmosphere: "The position was chosen by someone who has never had to hold one. The ground is wrong. The field of fire is wrong. You make it work anyway.",
    narrative:
      "Hold the line. That's the entire order. The CO points to the map grid and then at the ground beneath your feet and those two things mean the same thing now.\n\nObjective: {objective}. {tank} holds the road junction. Division is moving up artillery. Until then, it's you.",
    quote: '{cmd}: "We hold until told otherwise. That\'s all this is."',
    preChoiceNpc: { speaker: "Lt. Morales", line: "Armor is coming up the eastern road. Maybe an hour. You have to make an hour look easy." },
    choices: [
      {
        id: "hull_down",
        label: "\"We go hull-down on the ridge. Best angle from there.\"",
        role: "gunner",
        dialogueLine: "Hull-down position on that ridge gives us three hundred meter sight lines. We'll see them before they see our main gun.",
        outcomeText: "The ridge is everything the gunner said. You wait in the dirt and silence until the first contact. The gun is ready before the order.",
        npcReply: "Good call. Don't let anything past that first crest.",
        effects: [{ op: "mod_all_constitution", delta: 3 }, { op: "mod_constitution", role: "gunner", delta: 5 }],
      },
      {
        id: "fallback_plan",
        label: "\"What's the fallback if they breach the left flank?\"",
        role: "commander",
        dialogueLine: "If they punch through the left, what's our fallback grid? I need a route that isn't the road.",
        outcomeText: "Morales marks two alternatives on the map. The information is worth more than the minute it cost.",
        npcReply: "Grid 319 or 320, your pick. Don't use either unless you have to.",
        effects: [{ op: "mod_all_constitution", delta: 4 }, { op: "add_salvage", amount: 1 }],
      },
      {
        id: "hold_ack",
        label: "\"Understood. We'll hold.\"",
        role: "commander",
        dialogueLine: "Understood. We'll hold the junction.",
        flavorOnly: true,
        outcomeText: "Simple words. The crew hears them and knows what they mean. They move to position without being told.",
        effects: [],
      },
    ],
  },
  briefing_pursuit: {
    id: "briefing_pursuit",
    kind: "briefing",
    atmosphere: "The enemy is moving. When they move they make mistakes. This is the part of war that feels almost like winning — right until it doesn't.",
    narrative:
      "They're running. The CO's voice is different when he says it — faster, lighter, a man who's been waiting to use that word. The map shows a retreating column with two possible routes of escape.\n\nObjective: {objective}. {tank} cuts the road ahead. If they get around you, they regroup and you do this again somewhere worse.",
    quote: '{drv}: "Running Germans are still dangerous Germans. Don\'t let the map fool you."',
    preChoiceNpc: { speaker: "Maj. Connelly", line: "Intercept grid is here. They're moving fast but they're moving tired. Don't give them time to breathe." },
    choices: [
      {
        id: "fastest_route",
        label: "\"We take the shortest route and set the block.\"",
        role: "driver",
        dialogueLine: "Shortest route, full speed. We get there before they do or this whole thing falls apart.",
        outcomeText: "The driver takes it seriously. Every gear change is a decision, every second saved is a meter of road blocked before they arrive.",
        npcReply: "Move. Don't stop for anything until you're on that grid.",
        effects: [{ op: "mod_all_constitution", delta: 3 }, { op: "mod_tank_health", delta: -4 }],
      },
      {
        id: "cut_route",
        label: "\"We go parallel and cut the secondary road too.\"",
        role: "commander",
        dialogueLine: "They have a secondary exit through the village on the north track. We cut both and they're boxed.",
        outcomeText: "Connelly approves with a gesture. Two birds. Tight timing. The column moves.",
        npcReply: "Smart. Don't let one side slip while you're watching the other.",
        effects: [{ op: "mod_all_constitution", delta: 4 }, { op: "add_salvage", amount: 2 }],
      },
      {
        id: "mount_intercept",
        label: "\"We're moving now, sir.\"",
        role: "commander",
        dialogueLine: "We're already moving, sir.",
        flavorOnly: true,
        outcomeText: "The tank is in gear before the briefing ends. Connelly lets it happen. That's the right answer.",
        effects: [],
      },
    ],
  },
  gen_travel_fork: {
    id: "gen_travel_fork",
    kind: "travel",
    atmosphere: "The road is wrong in both directions. It's just a question of which wrong you can live with.",
    narrative:
      "The road forks through torn countryside. Left cuts a bombed village — faster, exposed. Right skirts a treeline — longer, darker.\n\nThe driver doesn't ask for an opinion. He slows the tank and waits with both options available and neither of them good.",
    quote: '{drv}: "That village gives me bad feelings, Sarge. Every window up there is a decision somebody already made."',
    choices: [
      {
        id: "village",
        label: "Push through the village — save time, risk exposure.",
        role: "driver",
        dialogueLine: "Through the village. We're faster than we're visible.",
        outcomeText: "You punch through. Dust lifts. Windows watch like empty eyes. Something moves in the second floor of the church. You don't stop to find out what.",
        effects: [
          { op: "mod_tank_health", delta: -3 },
          { op: "mod_constitution", role: "driver", delta: -4 },
        ],
      },
      {
        id: "trees",
        label: "Take the treeline — burn fuel, maybe buy safety.",
        role: "driver",
        dialogueLine: "Treeline. If they're in there we hear them before they see us.",
        outcomeText: "The engine labors in low gear. Branches rasp the hull like fingernails. Nothing fires. The driver breathes again two hundred meters in.",
        effects: [{ op: "mod_resource", key: "foodDays", delta: -1 }],
      },
      {
        id: "recon_first",
        label: "Commander radios ahead — two minutes before committing.",
        role: "commander",
        dialogueLine: "Hold here. Let me raise Regiment first.",
        outcomeText: "Two minutes of patience. The village checks clear. You take it clean, engine still warm, nobody's hands shaking yet.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: -2 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },
  gen_human_letters: {
    id: "gen_human_letters",
    kind: "human_moment",
    atmosphere: "The engine is off. That particular silence is where the rest of your life lives.",
    narrative:
      "Someone passes a crumpled envelope through the hatch. The paper smells like rain and cheap soap. Nobody asks who it's for.\n\nIt traveled a long way to get here. It shows.",
    quote: '{ldr}: "I can read it for you. If you want. No judgment either way."',
    choices: [
      {
        id: "read",
        label: "Let the Loader read aloud — share the weight.",
        role: "loader",
        dialogueLine: "I'll read it slow. You tell me when to stop.",
        outcomeText: "The words are ordinary. That's what makes them hurt. The loader finishes, folds the paper along its existing creases, and hands it back without a word.",
        effects: [{ op: "mod_constitution", role: "loader", delta: 6 }],
      },
      {
        id: "pocket",
        label: "Pocket it unread — keep the world outside a little longer.",
        role: "commander",
        dialogueLine: "Not now. Maybe later.",
        outcomeText: "Silence becomes its own answer. The envelope sits in a breast pocket for the rest of the day, present without being opened. That's a kind of decision too.",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
      {
        id: "asst_delivers",
        label: "Asst driver figures out whose it is and makes sure it gets there.",
        role: "asst_driver",
        dialogueLine: "Hey. This is yours. I checked the handwriting.",
        outcomeText: "It was the loader's. He doesn't say anything. He folds it very carefully and tucks it somewhere the others can't see. Nobody asks. That's the crew working correctly.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: 5 },
          { op: "mod_constitution", role: "loader", delta: 8 },
        ],
      },
    ],
  },
  gen_combat_tiger_lite: {
    id: "gen_combat_tiger_lite",
    kind: "tank_combat",
    narrative:
      "A long hull shadow slides across a hedgerow gap. Sloped armor catches the light wrong — too heavy to be anything friendly.",
    quote: '{gnr}: "I see him. Christ… I see him."',
    useDice: true,
    enemy: { idealAmmo: "AP", combatMod: -1, label: "Tiger I" },
    choices: [
      {
        id: "flank_ap",
        label: "Flank hard, load AP — commit to the shot.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "The turret slews. The world becomes recoil and ringing metal.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 2 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "smoke_wp",
        label: "Pop WP and break contact — live to regret it.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "White phosphorus blooms like a second sun. You crawl backward into the grey.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "mod_tank_health", delta: -5 },
        ],
      },
      {
        id: "driver_flank",
        label: "Driver takes a hard angle — circle wide, deny him your front plate.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "He has to track you. While he tracks, you gain the angle.",
        effects: [
          { op: "mod_tank_health", delta: -8 },
          { op: "mod_constitution", role: "driver", delta: -5 },
          { op: "add_salvage", amount: 3 },
        ],
      },
      {
        id: "loader_calls",
        label: "Loader calls ammo type before you even aim — AP, ready, now.",
        role: "loader",
        modifierBonus: 0,
        outcomeText: "Three seconds faster than normal. Those three seconds matter.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 2 },
          { op: "mod_constitution", role: "loader", delta: -3 },
          { op: "add_salvage", amount: 3 },
        ],
      },
    ],
  },
  gen_infantry_treeline: {
    id: "gen_infantry_treeline",
    kind: "infantry_combat",
    narrative:
      "Muzzle flashes stitch the treeline. Shouts in a language you don't need to translate. Someone has a tube — maybe Faust, maybe fear.",
    quote: '{asst}: "I can keep their heads down. Say when."',
    useDice: true,
    enemy: { idealAmmo: "HE", label: "Entrenched infantry" },
    choices: [
      {
        id: "he_burst",
        label: "HE into the treeline — break their nerve with main gun.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "The branch line disappears in splinters and screams.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "mod_constitution", role: "asst_driver", delta: -3 },
        ],
      },
      {
        id: "hull_suppress",
        label: "Hull MG — controlled bursts, conserve main gun.",
        role: "asst_driver",
        modifierBonus: 1,
        outcomeText: "Tracers walk like angry punctuation. Return fire slackens — for now.",
        effects: [
          { op: "mod_resource", key: "smallArmsMags", delta: -1 },
          { op: "mod_constitution", role: "asst_driver", delta: -2 },
        ],
      },
      {
        id: "run_over",
        label: "Driver drives the tank into the position — end it mechanically.",
        role: "driver",
        modifierBonus: -1,
        outcomeText: "The tree line doesn't survive the introduction.",
        effects: [
          { op: "mod_tank_health", delta: -8 },
          { op: "mod_constitution", role: "driver", delta: -8 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "commander_scouts",
        label: "Commander pops the hatch for thirty seconds — confirm before committing.",
        role: "commander",
        modifierBonus: 2,
        outcomeText: "Risky. Right. You see the tube. You fire first.",
        effects: [
          { op: "mod_hp", role: "commander", delta: -6 },
          { op: "spend_ammo", ammo: "HE", amount: 1 },
          { op: "add_salvage", amount: 3 },
        ],
      },
    ],
  },
  gen_rest_coffee: {
    id: "gen_rest_coffee",
    kind: "rest",
    atmosphere: "The hull is still warm from the last move. The air smells like spent powder and, improbably, coffee.",
    narrative:
      "Someone boils water on a tiny stove taped to a ration crate. The coffee is thin and overcooked and exactly what it needs to be.\n\nThe crew doesn't talk much. They don't need to. The cups are small and the silence is its own kind of fuel.",
    quote: '{cmd}: "Small cups. Big silence. That\'s all I want right now."',
    choices: [
      {
        id: "rest",
        label: "Rest the crew — rotate watch, let everyone sleep.",
        role: "commander",
        outcomeText: "Sleep comes in slices. That's enough.",
        effects: [
          { op: "mod_all_constitution", delta: 8 },
          { op: "mod_resource", key: "waterCanteens", delta: -1 },
        ],
      },
      {
        id: "gunner_maintenance",
        label: "Gunner skips rest to clean and check the main gun.",
        role: "gunner",
        outcomeText: "He's tired. The gun is ready. He's made worse trades.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -4 },
          { op: "set_component", component: "main_gun", status: "ok" },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
      {
        id: "loader_ammo_count",
        label: "Loader runs an ammo inventory — know what you have before you need it.",
        role: "loader",
        outcomeText: "Numbers he'd rather not see. At least now he sees them.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 6 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },
  gen_supply_risk: {
    id: "gen_supply_risk",
    kind: "supply",
    atmosphere: "A supply point that shouldn't exist anymore is somehow still operational. The man running it looks like he stopped sleeping two days ago.",
    narrative:
      "A quartermaster gestures at crates half-buried in mud. His eyes are tracking the middle distance the way people do when they've heard incoming often enough to have a sense for it.\n\nObjective: {objective}. There's more here than you can carry. You have maybe three minutes.",
    quote: '{ldr}: "I can grab meds or bullets — not both. Your call, fast."',
    preChoiceNpc: { speaker: "Corporal Haas", line: "Take it and go. Don't sign anything. We're not supposed to be here." },
    choices: [
      {
        id: "meds",
        label: "Grab medkits — crew health first.",
        role: "loader",
        outcomeText: "You sprint back with white crosses pressed to your chest like shields.",
        effects: [{ op: "mod_resource", key: "medkits", delta: 1 }],
      },
      {
        id: "ammo",
        label: "Grab AP bandoliers — fight now, hurt later.",
        role: "loader",
        outcomeText: "Metal clanks. Every sound feels like an invitation.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: 2 }],
      },
      {
        id: "negotiate",
        label: "Commander talks the quartermaster into a full load — rank helps.",
        role: "commander",
        outcomeText: "He grumbles. You both know you're right. You take both crates.",
        effects: [
          { op: "mod_resource", key: "medkits", delta: 1 },
          { op: "mod_resource", key: "smallArmsMags", delta: 1 },
          { op: "mod_constitution", role: "commander", delta: -3 },
        ],
      },
    ],
  },
  gen_combat_panther: {
    id: "gen_combat_panther",
    kind: "tank_combat",
    atmosphere: "Sloped grey hull at the crossroads. The 75mm tracks slow — not at you, not yet.",
    stakes: "elevated",
    stakesNote: "Panther on bad ground. AP flank vs smoke vs break contact — Gunner and Commander will disagree.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative:
      "Sloped grey hull at the crossroads. Long 75mm barrel tracking right — not at you, not yet. A Panther in a bad mood.",
    quote: '{gnr}: "Angled hull. Needs AP on the flank or we bounce off."',
    useDice: true,
    enemy: { idealAmmo: "AP", combatMod: -1, label: "Panther" },
    choices: [
      {
        id: "flank_ap",
        label: "Commit — AP on the flank, clean shot.",
        role: "gunner",
        modifierBonus: 1,
        outcomeText: "The round finds the join between turret and hull. One clean answer.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 3 },
          { op: "add_salvage", amount: 3 },
          { op: "journal", text: "Killed a Panther at the crossroads.", kind: "moment" },
        ],
      },
      {
        id: "withdraw",
        label: "Break contact — not the right ground.",
        role: "commander",
        modifierBonus: 0,
        outcomeText: "You back off through a farmyard. The Panther doesn't follow. You don't ask why.",
        effects: [
          { op: "mod_tank_health", delta: -8 },
          { op: "mod_constitution", role: "driver", delta: -6 },
        ],
      },
      {
        id: "wp_blind",
        label: "WP to blind him — driver circles while his optics are burning.",
        role: "loader",
        modifierBonus: 0,
        outcomeText: "White smoke, then white fire. His vision goes first.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "spend_ammo", ammo: "AP", amount: 2 },
          { op: "add_salvage", amount: 4 },
        ],
      },
      {
        id: "asst_hull_mg",
        label: "Asst driver suppresses his infantry screen while gunner aims.",
        role: "asst_driver",
        modifierBonus: 1,
        outcomeText: "Their infantry ducks. The Panther is alone. That's enough.",
        effects: [
          { op: "mod_resource", key: "smallArmsMags", delta: -1 },
          { op: "spend_ammo", ammo: "AP", amount: 3 },
          { op: "add_salvage", amount: 3 },
        ],
      },
    ],
  },
  gen_combat_pak: {
    id: "gen_combat_pak",
    kind: "defensive_stand",
    atmosphere: "A flash from beneath the hedgerow — dug-in AT, invisible until it fires.",
    stakes: "elevated",
    stakesNote: "AT gun owns the angle. HE the position or trade hull for distance.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative:
      "A muzzle flash from a hedgerow window — no, from beneath the hedgerow. An AT gun, dug in and invisible until it fired once.",
    quote: '{drv}: "It came from nowhere. We\'re hull-down but—"',
    useDice: true,
    enemy: { idealAmmo: "HE", combatMod: -1, label: "AT gun" },
    choices: [
      {
        id: "he_gun",
        label: "HE on the hedgerow — collapse the whole position.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "Earth and splinters fly. The firing stops.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "add_salvage", amount: 1 },
        ],
      },
      {
        id: "smoke_evade",
        label: "WP screen and reverse — trade ground for crew.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "The smoke costs twenty meters. The meters cost nothing.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "damage_random_component" },
          { op: "mod_all_constitution", delta: -3 },
        ],
      },
      {
        id: "driver_back_cover",
        label: "Driver backs into a fold — minimize exposure, wait for their reload.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "Three seconds of nothing. Then the gunner fires into the pause.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: -6 },
          { op: "spend_ammo", ammo: "HE", amount: 1 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "asst_dismount_suppress",
        label: "Asst driver dismounts with small arms — flank the gun position.",
        role: "asst_driver",
        modifierBonus: -1,
        outcomeText: "He flanks. He's lucky. He doesn't say that.",
        effects: [
          { op: "mod_hp", role: "asst_driver", delta: -10 },
          { op: "mod_resource", key: "smallArmsMags", delta: -2 },
          { op: "add_salvage", amount: 3 },
        ],
      },
    ],
  },
  gen_combat_heat_round: {
    id: "gen_combat_heat_round",
    kind: "tank_combat",
    atmosphere: "Something heavy in the tree line. You may only get one honest shot.",
    stakes: "elevated",
    stakesNote: "HEAT is a gamble — one tray, one chance. Loader and Gunner own the call.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative:
      "A soft clang on the hull — then silence that's too long. Not a penetration. But the armor plate at your shoulder is warm when it shouldn't be.",
    quote: '{cmd}: "Everyone sound off. Twice."',
    useDice: true,
    choices: [
      {
        id: "push",
        label: "Keep pushing — crew sounded off, track the threat.",
        role: "commander",
        modifierBonus: 0,
        outcomeText: "Discipline is knowing the difference between scared and dead.",
        effects: [
          { op: "damage_random_component" },
          { op: "mod_all_constitution", delta: -5 },
        ],
      },
      {
        id: "back_up",
        label: "Back up and check for damage — certainty over speed.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "The hull plate cracked. Caught it before it failed.",
        effects: [
          { op: "mod_tank_health", delta: -5 },
          { op: "mod_constitution", role: "driver", delta: -4 },
        ],
      },
      {
        id: "gunner_return_fire",
        label: "Gunner fires at the muzzle flash — return fire now.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "Blind shot, angry shot. Something breaks somewhere.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "mod_tank_health", delta: -4 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "loader_internal_check",
        label: "Loader checks the internal hull — if something cracked, he'll feel it.",
        role: "loader",
        modifierBonus: 1,
        outcomeText: "He finds a fracture in the bracket. Wedges it. Buys time.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -5 },
          { op: "mod_tank_health", delta: -3 },
          { op: "set_component", component: "armor_front", status: "damaged" },
        ],
      },
    ],
  },
  gen_injury_scar: {
    id: "gen_injury_scar",
    kind: "human_moment",
    atmosphere: "Blood on the deck plate. The smell stays after you wipe it.",
    stakes: "elevated",
    stakesNote: "Someone's hurt bad. Medkit now or push the mission — crew decides.",
    narrative:
      "The field dressing held but the shrapnel is still in there. The medic at the depot says 'you'll feel it in winter.' He's not wrong.",
    choices: [
      {
        id: "push_through",
        label: "Push through — note it and move.",
        role: "loader",
        outcomeText: "Pain becomes background. It was always background.",
        effects: [
          { op: "mod_hp", role: "loader", delta: -8 },
          { op: "add_scar", role: "loader", text: "shrapnel scar, left shoulder", rolePenalty: 1 },
        ],
      },
      {
        id: "rest_it",
        label: "Rest and change the dressing.",
        role: "commander",
        outcomeText: "One hour. Counts for something.",
        effects: [
          { op: "mod_hp", role: "loader", delta: -4 },
          { op: "mod_resource", key: "medkits", delta: -1 },
          { op: "add_scar", role: "loader", text: "treated shrapnel wound, left shoulder", rolePenalty: 1 },
        ],
      },
    ],
  },
  gen_defensive_wave: {
    id: "gen_defensive_wave",
    kind: "defensive_stand",
    atmosphere: "Horizon flickers. The next wave is already forming.",
    stakes: "elevated",
    stakesNote: "Hold rules and nerve. Who fires first decides who lives longer.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative:
      "You hull-down behind a fold in the earth. The radio crackles promises it can't keep. The first probing shots kick dirt into the periscope glass.",
    useDice: true,
    choices: [
      {
        id: "hold_fire",
        label: "Hold fire — let silhouettes firm up before committing.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "Discipline buys meters. Meters buy minutes.",
        effects: [{ op: "mod_all_constitution", delta: -3 }],
      },
      {
        id: "early_he",
        label: "HE on movement — don't let them settle into position.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "The field coughs smoke. Shapes scatter like startled birds.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 1 }],
      },
      {
        id: "driver_reposition",
        label: "Driver shifts the hull — give the gunner a better firing angle.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "Twenty feet left. The angle is clean now.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: -4 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "loader_pre_stages",
        label: "Loader pre-stages HE and WP — ready for whatever the commander calls.",
        role: "loader",
        modifierBonus: 1,
        outcomeText: "He cycles rounds before orders come. That's experience.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -3 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
    ],
  },
  gen_offensive_push: {
    id: "gen_offensive_push",
    kind: "offensive_assault",
    atmosphere: "Smoke and shouting. The line ahead still has teeth.",
    stakes: "elevated",
    stakesNote: "Push costs fuel, ammo, bodies. Aggressive gains ground; cautious gains tomorrow.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative:
      "The objective is a roofline and a flag nobody believes in. Infantry hug your flanks like they own your courage.",
    useDice: true,
    choices: [
      {
        id: "drive_hard",
        label: "Drive straight — shock and speed, worry later.",
        role: "driver",
        modifierBonus: -1,
        outcomeText: "Tracks bite. Buildings slide past too close.",
        effects: [
          { op: "mod_tank_health", delta: -6 },
          { op: "add_salvage", amount: 3 },
        ],
      },
      {
        id: "support_by_fire",
        label: "Support by fire — let infantry advance while you cover.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "Your machine speaks. Their advance stutters.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }],
      },
      {
        id: "gunner_far_positions",
        label: "Gunner suppresses far rooftop positions — deny their observers.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "The rooftop goes quiet. That's enough to start moving.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 1 },
          { op: "mod_constitution", role: "gunner", delta: -4 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "loader_he_ready",
        label: "Loader pre-stages HE rounds — rapid fire on contact.",
        role: "loader",
        modifierBonus: 0,
        outcomeText: "Three rounds in twenty seconds. The objective clears.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 3 },
          { op: "mod_constitution", role: "loader", delta: -5 },
          { op: "add_salvage", amount: 4 },
        ],
      },
    ],
  },
  anchor_cobra: {
    id: "anchor_cobra",
    kind: "historical_anchor",
    narrative:
      "Operation Cobra isn't a word anymore — it's velocity. Columns compress and stretch like a living thing afraid of its own spine.",
    quote: '{cmd}: "If we get separated, we rendezvous on the far side of panic."',
    choices: [
      {
        id: "push",
        label: "Push inside the corridor — stay with the column.",
        role: "commander",
        outcomeText: "You ride the explosion's wake. The map becomes a lie you survive anyway.",
        effects: [
          { op: "journal", text: "Survived Cobra corridor.", kind: "moment" },
          { op: "discovery_stub", id: "cobra_corridor" },
        ],
      },
      {
        id: "flank_column",
        label: "Break left — find a parallel route, less crowd, more risk.",
        role: "driver",
        outcomeText: "Empty road buys speed. The silence costs something different.",
        effects: [
          { op: "mod_all_constitution", delta: -4 },
          { op: "add_salvage", amount: 2 },
          { op: "journal", text: "Survived Cobra corridor.", kind: "moment" },
        ],
      },
      {
        id: "scavenge_chaos",
        label: "Slow through the wreckage — gather what the column left behind.",
        role: "loader",
        outcomeText: "Dead vehicles give what they can. You take it without apology.",
        effects: [
          { op: "add_salvage", amount: 4 },
          { op: "mod_constitution", role: "loader", delta: -5 },
          { op: "journal", text: "Survived Cobra corridor.", kind: "moment" },
        ],
      },
    ],
  },
  anchor_bulge: {
    id: "anchor_bulge",
    kind: "historical_anchor",
    narrative:
      "Snow learns your names. The radio fills with voices that don't belong to your world anymore — thin, polite, terrified.",
    quote: '{cyn}: "Monuments later. Right now: teeth."',
    useDice: true,
    choices: [
      {
        id: "hold_road",
        label: "Hold the junction — make them pay for every meter.",
        role: "commander",
        modifierBonus: 0,
        outcomeText: "Metal rings. The cold makes every sound sharper than it should be.",
        effects: [
          { op: "mod_tank_health", delta: -10 },
          { op: "mod_all_constitution", delta: -5 },
          { op: "add_salvage", amount: 4 },
          { op: "seed_flag", flag: "bulge_held_junction" },
        ],
      },
      {
        id: "aggressive_fire",
        label: "Hit them before they consolidate — HE into the tree line.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "Rounds walk the white ground. Something stops moving. Something else keeps moving.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 3 },
          { op: "mod_tank_health", delta: -6 },
          { op: "add_salvage", amount: 5 },
          { op: "seed_flag", flag: "bulge_held_junction" },
        ],
      },
      {
        id: "tactical_withdraw",
        label: "Fall back one ridgeline — give ground, deny them the cost.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "The junction falls. The crew doesn't. Sometimes that's the only math that counts.",
        effects: [
          { op: "mod_all_constitution", delta: -8 },
          { op: "add_salvage", amount: 2 },
          { op: "seed_flag", flag: "bulge_held_junction" },
        ],
      },
    ],
  },
  anchor_rhine: {
    id: "anchor_rhine",
    kind: "historical_anchor",
    narrative:
      "The river is a line drawn by someone else's hand. Engineers wave flags that mean nothing until they mean everything.",
    choices: [
      {
        id: "cross",
        label: "Take the crossing under smoke — no heroics.",
        role: "driver",
        outcomeText: "Water becomes sky becomes mud. You emerge on the wrong side of history — exactly where you're supposed to be.",
        effects: [{ op: "seed_flag", flag: "rhine_crossing_logistics" }],
      },
      {
        id: "coordinate",
        label: "Coordinate with engineers — controlled crossing, proper timing.",
        role: "commander",
        outcomeText: "It's slower. It's right. The river notices neither.",
        effects: [
          { op: "mod_all_constitution", delta: 4 },
          { op: "seed_flag", flag: "rhine_crossing_logistics" },
        ],
      },
      {
        id: "help_a_man",
        label: "Pull a panicked soldier onto the hull — you have the room.",
        role: "loader",
        outcomeText: "He doesn't know your name. He'll remember it anyway.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 8 },
          { op: "mod_resource", key: "waterCanteens", delta: -1 },
          { op: "seed_flag", flag: "rhine_crossing_logistics" },
        ],
      },
    ],
  },
  anchor_huertgen: {
    id: "anchor_huertgen",
    kind: "historical_anchor",
    narrative:
      "The forest doesn't end. It learns. Roots trip tracks. Tree bursts turn splinters into shrapnel.",
    useDice: true,
    choices: [
      {
        id: "slow",
        label: "Slow crawl — optics up, hatches cracked.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "Time thickens. Every meter is negotiated.",
        effects: [
          { op: "mod_all_constitution", delta: -6 },
          { op: "seed_flag", flag: "huertgen_survived" },
        ],
      },
      {
        id: "suppressive_fire",
        label: "Lay suppression on the tree line — HE, keep heads down.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "The forest becomes noise. You move through the noise.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "mod_all_constitution", delta: -4 },
          { op: "seed_flag", flag: "huertgen_survived" },
        ],
      },
      {
        id: "dismount_check",
        label: "Loader dismounts to clear the immediate approach on foot.",
        role: "loader",
        modifierBonus: 1,
        outcomeText: "Two minutes of terror buys ten minutes of certainty.",
        effects: [
          { op: "mod_hp", role: "loader", delta: -6 },
          { op: "mod_all_constitution", delta: -3 },
          { op: "seed_flag", flag: "huertgen_survived" },
        ],
      },
    ],
  },
  anchor_paris_skirt: {
    id: "anchor_paris_skirt",
    kind: "historical_anchor",
    narrative:
      "You don't enter Paris — you brush it like a wound you're not allowed to touch. Church bells sound wrong in armor.",
    choices: [
      {
        id: "skirt",
        label: "Skirt north — orders are orders.",
        role: "commander",
        outcomeText: "Civilians watch from doorways. You pretend not to see their hope.",
        effects: [{ op: "mod_constitution", role: "loader", delta: -4 }],
      },
      {
        id: "long_bypass",
        label: "Take a longer bypass — don't risk a column jam near civilians.",
        role: "driver",
        outcomeText: "More road. Less weight. The detour smells like hay and something that used to be summer.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: -1 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
      {
        id: "brief_stop",
        label: "Brief stop — one man stretches his legs, sees something real.",
        role: "loader",
        outcomeText: "He buys bread he can't afford with money that won't be worth anything soon. The bread is perfect.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 10 },
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "journal", text: "Brief stop near Paris.", kind: "moment" },
        ],
      },
    ],
  },
  anchor_siegfried: {
    id: "anchor_siegfried",
    kind: "historical_anchor",
    narrative:
      "Dragon's teeth grin out of the earth. Somebody named this place like a joke nobody laughs at twice.",
    useDice: true,
    choices: [
      {
        id: "breach",
        label: "Breach with HE and guts — blow a path through the teeth.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "Concrete coughs dust. The tank coughs back.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 3 },
          { op: "set_component", component: "optics", status: "damaged" },
        ],
      },
      {
        id: "find_gap",
        label: "Find the gap — someone always left one.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "Half a mile east, where engineers apparently took a lunch break. You note it. You don't report it.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 6 },
          { op: "add_salvage", amount: 1 },
        ],
      },
      {
        id: "wait_engineers",
        label: "Wait for engineers — their problem, their explosives.",
        role: "commander",
        modifierBonus: 0,
        outcomeText: "Forty minutes. The engineers make it look easy. They've done it before.",
        effects: [
          { op: "mod_all_constitution", delta: 4 },
          { op: "mod_resource", key: "foodDays", delta: -1 },
        ],
      },
    ],
  },
  anchor_push_germany: {
    id: "anchor_push_germany",
    kind: "historical_anchor",
    narrative:
      "Towns surrender in different languages: hands, flags, silence. You stop trusting all three.",
    choices: [
      {
        id: "push",
        label: "Keep rolling — don't get pulled into street politics.",
        role: "commander",
        outcomeText: "You leave arguments for infantry. Your job is distance.",
        effects: [{ op: "add_salvage", amount: 2 }],
      },
      {
        id: "cover_advance",
        label: "Hold position and cover infantry as they clear the block.",
        role: "gunner",
        outcomeText: "The gun speaks twice. The street listens.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 1 },
          { op: "mod_constitution", role: "gunner", delta: -4 },
          { op: "add_salvage", amount: 3 },
        ],
      },
      {
        id: "human_moment",
        label: "Loader steps off to help a wounded soldier — one minute.",
        role: "loader",
        outcomeText: "The man lives or he doesn't. You don't stay to find out. The tank doesn't wait.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 8 },
          { op: "mod_hp", role: "loader", delta: -4 },
          { op: "journal", text: "Stopped for a wounded man in the push into Germany.", kind: "moment" },
        ],
      },
    ],
  },
  elite_night_ambush_stub: {
    id: "elite_night_ambush_stub",
    kind: "elite_encounter",
    narrative:
      "Night doesn't fall here — it leaks. Shapes sprint between trees without sound until they do.",
    quote: '{kid}: "Tell me what to do. Just tell me what to do."',
    useDice: true,
    enemy: { idealAmmo: "HE", combatMod: -1, label: "Night ambush" },
    choices: [
      {
        id: "wp",
        label: "WP screen — blind them and break contact.",
        role: "gunner",
        modifierBonus: 1,
        outcomeText: "White heat eats the dark. You move while it blinds everyone equally.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "grant_charm", role: "loader", charmId: "lucky_coin" },
        ],
      },
      {
        id: "fight",
        label: "Fight it out — hull MG on full auto, no hesitation.",
        role: "asst_driver",
        modifierBonus: -2,
        outcomeText: "Muzzle flash paints the inside of your eyelids.",
        effects: [
          { op: "mod_hp", role: "asst_driver", delta: -12 },
          { op: "add_trauma", role: "asst_driver", trauma: "jumpy" },
        ],
      },
      {
        id: "reverse_dark",
        label: "Driver reverses into the dark — deny them the tank, find a new line.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "Backward into nothing. They lose you in thirty seconds.",
        effects: [
          { op: "mod_tank_health", delta: -6 },
          { op: "mod_constitution", role: "driver", delta: -8 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },
  foot_woods: {
    id: "foot_woods",
    kind: "travel",
    atmosphere: "The forest closes. Sound goes wrong — too close, too far, all at once.",
    stakes: "critical",
    stakesNote: "Disoriented on foot. Push, flank, or climb — each path has its own ambush.",
    narrative:
      "Without the tank, the world is too loud and too quiet. You move in bursts, pockets heavy, breath fogging.",
    choices: [
      {
        id: "slow",
        label: "Move slow — listen more than look.",
        role: "commander",
        outcomeText: "Twigs snap anyway. You keep moving.",
        effects: [{ op: "mod_all_constitution", delta: -4 }],
      },
      {
        id: "gunner_lead",
        label: "Gunner takes point with his pistol — fast, quiet, aggressive.",
        role: "gunner",
        outcomeText: "He moves like someone who's done it before. You don't ask when.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -7 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "loader_pathfind",
        label: "Loader finds a deer track — slower but covered.",
        role: "loader",
        outcomeText: "An extra ten minutes. An extra ten minutes of not being shot.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -3 },
        ],
      },
    ],
  },
  foot_lines: {
    id: "foot_lines",
    kind: "human_moment",
    atmosphere: "Diesel smoke and somebody else's hurry. Charity at unsafe speed.",
    stakes: "critical",
    stakesNote: "Water and directions are both scarce — share or chase.",
    narrative:
      "A jeep passes at unsafe speed. Someone throws a canteen without stopping — charity at velocity.",
    choices: [
      {
        id: "drink",
        label: "Share the water — everybody gets a swallow.",
        role: "loader",
        outcomeText: "Throat remembers what hope tastes like.",
        effects: [{ op: "mod_resource", key: "waterCanteens", delta: 1 }],
      },
      {
        id: "wave_down",
        label: "Commander flags them — maybe they know the route ahead.",
        role: "commander",
        outcomeText: "The driver slows just enough. Two words and a hand gesture. Better than nothing.",
        effects: [
          { op: "mod_all_constitution", delta: 3 },
          { op: "mod_constitution", role: "commander", delta: 4 },
        ],
      },
      {
        id: "follow_dust",
        label: "Driver falls in behind them — their route is better than guessing.",
        role: "driver",
        outcomeText: "A mile of riding somebody else's certainty. Worth every step.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 6 },
        ],
      },
    ],
  },
  foot_gate: {
    id: "foot_gate",
    kind: "human_moment",
    atmosphere: "Friendly lines smell like hot food and diesel. Counting feels like cargo.",
    stakes: "critical",
    stakesNote: "Gate sergeant holds power over food and passage — talk, trade, or push through.",
    narrative:
      "Friendly lines smell like diesel and hot food. A sergeant counts you like cargo.",
    useDice: true,
    choices: [
      {
        id: "talk",
        label: "Give full report — names, map, what you saw.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "Paperwork is its own kind of survival.",
        effects: [{ op: "journal", text: "Reached friendly lines on foot.", kind: "moment" }],
      },
      {
        id: "scout_first",
        label: "Driver circles the perimeter before you walk in — verify it's really friendly.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "It's friendly. Paranoia is just awareness that got tired.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: -4 },
          { op: "mod_all_constitution", delta: 5 },
          { op: "journal", text: "Reached friendly lines on foot.", kind: "moment" },
        ],
      },
      {
        id: "loader_asks",
        label: "Loader asks where the food is before anyone asks where the tank is.",
        role: "loader",
        modifierBonus: -1,
        outcomeText: "Nobody argues with the man asking about food. You eat before the debrief.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "mod_all_constitution", delta: 6 },
          { op: "journal", text: "Reached friendly lines on foot.", kind: "moment" },
        ],
      },
    ],
  },
};

// ─── between-mission social beats (spec §10.2) ───────────────────────────────

Object.assign(EVENT_CATALOG, {
  social_cards: {
    id: "social_cards",
    kind: "rest",
    atmosphere: "A lantern or a candle or a flashlight someone left running. Some light. Enough light. Cards on a ration crate and the sound of breathing and shuffling.",
    narrative:
      "Someone deals cards on an upturned ration crate. The rules change every hand. Nobody argues about it. That's not what the game is for.\n\nThe tank sits cold behind them and the war sits somewhere past the perimeter and for now, here, there is a game of cards.",
    quote: '{cmd}: "Winner buys. Nobody has anything. We play anyway."',
    choices: [
      {
        id: "play",
        label: "Play all night — let it run until dawn.",
        role: "loader",
        dialogueLine: "Deal me in. I'll sleep when we're done.",
        outcomeText: "Nobody wins. Nobody loses. The game holds something together until dawn — not victory, not rest, just the specific continuity of people who know each other well enough to cheat and not mind.",
        effects: [
          { op: "mod_all_constitution", delta: 10 },
          { op: "mod_resource", key: "waterCanteens", delta: -1 },
        ],
      },
      {
        id: "sit_out",
        label: "Watch from the edge — let the crew have it, you need to think.",
        role: "commander",
        dialogueLine: "I'll watch. Don't let the driver deal.",
        outcomeText: "The noise is good noise. The laughter is real laughter. From the edge of it you can see the crew as something other than a crew — as people, briefly — and that's a different kind of quiet than the other kind.",
        effects: [{ op: "mod_constitution", role: "commander", delta: 8 }],
      },
      {
        id: "driver_raises",
        label: "Driver raises the stakes — real money on the last hand.",
        role: "driver",
        dialogueLine: "Last hand. Real stakes. Everyone in or everyone out.",
        outcomeText: "The hand is ugly and wonderful and nobody has money worth anything in this country anyway but they play it like it matters. The pot goes to the loader. The driver doesn't care. It wasn't about the money.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 6 },
          { op: "mod_all_constitution", delta: 6 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  social_letters: {
    id: "social_letters",
    kind: "rest",
    atmosphere: "Mail arrives the way news arrives in wartime — delayed, rerouted, arriving in the wrong order, still the most important thing that happens today.",
    narrative:
      "Mail call. The batch is a week old. One letter is forwarded twice. One has a photograph inside — a kid you've never seen before, standing in a yard that doesn't exist in your map of the world anymore.\n\nThe handwriting is someone's handwriting. The paper has been touched by hands that are somewhere else. That's all it takes.",
    quote: '{drv}: "Read it slow. Some letters you only get once. Even if they come more than once, you only get them once."',
    choices: [
      {
        id: "write_back",
        label: "Write back — keep the thread alive.",
        role: "driver",
        dialogueLine: "I'm going to write back. Right now. Before something else happens.",
        outcomeText: "The words come hard and come right in that order. There's not much space on the paper but the space is enough. That's the best you can do. It arrives three weeks later and is the best thing that happens to someone that week.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 12 },
          { op: "journal", text: "Letters from home. Wrote back.", kind: "moment" },
        ],
      },
      {
        id: "fold_it",
        label: "Fold it away — you'll read it properly when there's time.",
        role: "driver",
        dialogueLine: "Later. Not now. When I can actually—",
        outcomeText: "Later keeps getting later. The letter travels folded in a breast pocket through three more engagements. It's read eventually. Just not today.",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "loader_reads",
        label: "Loader reads his letter aloud — shares it with anyone who'll listen.",
        role: "loader",
        dialogueLine: "Alright. I'm going to read this out loud and I don't want any comments.",
        outcomeText: "It's ordinary. A dog is sick but better. A pipe is leaking. A friend got married. Something about weather. Everyone is quiet after, in the specific way of people who are thinking about dogs and weather and leaking pipes and everything that means.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 10 },
          { op: "mod_all_constitution", delta: 7 },
          { op: "journal", text: "Loader read his letter aloud. A dog. A leaky pipe. A wedding.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  social_chaplain: {
    id: "social_chaplain",
    kind: "rest",
    atmosphere: "Evening. The kind that makes everything look more permanent than it is.",
    narrative:
      "The chaplain comes through on a jeep without a driver. He stops at the tank without being invited and that is both his job and his nature. He doesn't preach. He sits with the crew a while. He has a flask he doesn't offer and doesn't hide.\n\nHe has the look of someone who has sat with a lot of people in a lot of places and knows when sitting is enough.",
    quote: 'Chaplain: "You don\'t have to talk. You just have to be here. Both of us."',
    preChoiceNpc: { speaker: "Chaplain", line: "I'm not here for anything in particular. Just making the rounds." },
    choices: [
      {
        id: "talk",
        label: "Talk — let whatever needs saying come out.",
        role: "commander",
        dialogueLine: "I've been thinking about something and I don't know what to do with it.",
        outcomeText: "Half of what you say surprises you. The other half surprises him but he doesn't show it. He listens to all of it. When you're done he doesn't offer answers. He offers the specific silence of someone who has heard this before and knows it doesn't resolve.",
        npcReply: "\"Most of what you're carrying is going to stay with you. That doesn't mean it stays the same weight.\"",
        effects: [
          { op: "mod_all_constitution", delta: 12 },
          { op: "clear_trauma", role: "commander", trauma: "shellshocked" },
        ],
      },
      {
        id: "silence",
        label: "Sit in silence — presence is enough, no words needed.",
        role: "commander",
        dialogueLine: "I don't have anything to say right now.",
        outcomeText: "He says that's fine. He means it. He sits for twenty minutes and asks nothing. The silence isn't empty — it's occupied by everything neither of you needs to name aloud. That's the part that matters.",
        npcReply: "When he leaves he puts a hand briefly on the hull of the tank. Not the crew. The tank. Like it has something to carry too.",
        effects: [{ op: "mod_all_constitution", delta: 6 }],
      },
      {
        id: "gunner_stays_outside",
        label: "Gunner stays outside — doesn't believe in any of this.",
        role: "gunner",
        dialogueLine: "I'll be outside. Don't send him to talk to me.",
        outcomeText: "The chaplain finds him anyway. Sits on the front hull beside him in the dark. Doesn't mention God once. Asks the gunner where he's from, what the winters are like there, whether he ever learned to cook. The gunner answers all of it.",
        npcReply: "\"Good conversation,\" the chaplain says, getting up. \"Thank you for the company.\" He walks back to his jeep. The gunner sits for a while longer before going inside.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: 10 },
          { op: "clear_trauma", role: "gunner", trauma: "thousand_yard_stare" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  social_rumor: {
    id: "social_rumor",
    kind: "rest",
    atmosphere: "The kind of afternoon that has nothing to do but wait. Which is when the rumors move fastest.",
    narrative:
      "Rumors: the war ends next month — everyone says next month. Rumors: there's a German unit that doesn't take prisoners and they're operating three sectors east. Rumors: somebody in the 2nd found a cellar full of cognac and pre-war tinned food. Rumors: the general said something about a big push.\n\nNone of it's true. All of it matters because it fills the time between things that are true, which is most of the time.",
    quote: '{gnr}: "You believe any of it?" {cmd}: "I believe the cognac one."',
    choices: [
      {
        id: "engage",
        label: "Play along — give the crew something to argue about.",
        role: "gunner",
        dialogueLine: "I heard the same thing about the German unit. Third time I've heard it.",
        outcomeText: "The argument is stupid and brief and self-aware enough that everyone knows it. That's fine. Everyone feels marginally better for having had it. The specific relief of caring about something that doesn't matter.",
        effects: [{ op: "mod_all_constitution", delta: 7 }],
      },
      {
        id: "intel",
        label: "Press for details — something real might be buried in there.",
        role: "commander",
        dialogueLine: "Where did you hear the thing about the German unit? Who specifically?",
        outcomeText: "Most of it's garbage arranged to sound like intelligence. One detail sticks — not the dramatic one, but a small specific thing about road conditions near the secondary objective. The commander writes it down.",
        effects: [
          { op: "add_salvage", amount: 1 },
          { op: "mod_constitution", role: "commander", delta: 4 },
        ],
      },
      {
        id: "driver_rumor",
        label: "Driver has his own rumor — one nobody's heard before.",
        role: "driver",
        dialogueLine: "You want rumors? I've got one. But I'm only saying it once.",
        outcomeText: "The rumor is specific enough to be interesting and vague enough to be improvable. The crew argues about which half is true. The driver maintains he heard it directly from a signals officer. Nobody believes him. That's exactly how it should work.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 8 },
          { op: "mod_all_constitution", delta: 5 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  // ── NPC Conversation Events ──────────────────────────────────────────────

});

/** Between-mission social beat pool — injected during between_missions screen. */
export const SOCIAL_BEAT_POOL: string[] = [
  "social_cards",
  "social_letters",
  "social_chaplain",
  "social_rumor",
  "social_drunk",
  "social_found_item",
  "social_new_arrival",
  "social_dog_returns",
];

// ─── seeded follow-up events ─────────────────────────────────────────────────
// These are injected into the *next* mission when a matching seededFlag is set.

Object.assign(EVENT_CATALOG, {
  followup_rhine_logistics: {
    id: "followup_rhine_logistics",
    kind: "supply",
    narrative:
      "A liaison officer from Division catches you at the fuel point. 'Rhine crossing report.' He has a clipboard. You have answers you'd rather not give.",
    choices: [
      {
        id: "report",
        label: "Give the full account — names, timings, losses.",
        role: "commander",
        outcomeText: "He writes it down without expression. That's the part that stays with you.",
        effects: [
          { op: "mod_resource", key: "medkits", delta: 1 },
          { op: "journal", text: "Rhine crossing logged at Division.", kind: "moment" },
        ],
      },
      {
        id: "brief",
        label: "Keep it brief — operational security.",
        role: "commander",
        outcomeText: "He notes the gaps anyway. So do you.",
        effects: [{ op: "add_salvage", amount: 2 }],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  followup_huertgen_shell: {
    id: "followup_huertgen_shell",
    kind: "human_moment",
    narrative:
      "You find a shell casing lodged in the mantlet seam from the Hürtgen push. Nobody remembers which exchange it came from. You put it in a pocket anyway.",
    choices: [
      {
        id: "keep",
        label: "Keep it — proof of something.",
        role: "loader",
        outcomeText: "Small objects carry large weight.",
        effects: [{ op: "grant_charm", role: "loader", charmId: "huertgen_casing" }],
      },
      {
        id: "throw",
        label: "Throw it — stop carrying things you don't need.",
        role: "loader",
        outcomeText: "Lighter, briefly.",
        effects: [{ op: "mod_constitution", role: "loader", delta: 5 }],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  followup_bulge_survivor: {
    id: "followup_bulge_survivor",
    kind: "human_moment",
    narrative:
      "Someone at a replacement depot recognizes {tank} from the Bulge. He stares too long. He asks if {cmd} is still running with you.",
    choices: [
      {
        id: "yes",
        label: "Yes. He is.",
        role: "commander",
        outcomeText: "He nods like that means something to him. Maybe it does.",
        effects: [{ op: "mod_all_constitution", delta: 4 }],
      },
      {
        id: "no",
        label: "Not anymore.",
        role: "commander",
        outcomeText: "He doesn't push. He just moves on. That's the right call.",
        effects: [{ op: "mod_all_constitution", delta: -2 }],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  // ── NPC Conversation Events ──────────────────────────────────────────────

});

Object.assign(EVENT_CATALOG, {
  tank_replace_fork: {
    id: "tank_replace_fork",
    kind: "human_moment",
    narrative:
      "Division parks you in a mud lot full of dead hulls and living lies. A clerk taps a clipboard. 'Pick something that runs. Sign here. Pray later.'",
    quote: '{cmd}: "We don\'t steal. We inherit what the war leaves behind."',
    choices: [
      {
        id: "depot_issue",
        label: "Depot issue — paperwork hull, full shop support.",
        role: "commander",
        outcomeText: "Ugly paint. Fresh tracks. The crew pretends not to care that it isn't yours.",
        effects: [
          { op: "mod_tank_health", delta: 75 },
          { op: "seed_flag", flag: "tank_from_depot" },
          { op: "journal", text: "Replacement from depot stocks.", kind: "tank" },
        ],
      },
      {
        id: "field_capture",
        label: "Field capture — scavenge a runner from a knocked-out column.",
        role: "driver",
        outcomeText: "You know how she sounds before she knows your name. That's the deal.",
        effects: [
          { op: "mod_tank_health", delta: 50 },
          { op: "add_salvage", amount: 4 },
          { op: "seed_flag", flag: "tank_captured_field" },
        ],
      },
      {
        id: "human_trade",
        label: "Human moment — trade favors for a favor nobody writes down.",
        role: "loader",
        outcomeText: "Someone owes someone. You're somebody now. The tank runs. That's enough.",
        effects: [
          { op: "mod_tank_health", delta: 58 },
          { op: "mod_all_constitution", delta: 8 },
          { op: "seed_flag", flag: "tank_human_trade" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  foot_fields: {
    id: "foot_fields",
    kind: "travel",
    atmosphere: "Open fields mean sky. Sky means eyes.",
    stakes: "critical",
    stakesNote: "Cross in the open or wait for dusk — speed vs exposure.",
    narrative: "Open fields mean sky. Sky means eyes. You move low, fast, stupid, and lucky.",
    choices: [
      {
        id: "sprint",
        label: "Sprint the open — pray for cloud cover.",
        role: "driver",
        outcomeText: "Lungs burn. Nobody shoots. That's the miracle.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -5 }],
      },
      {
        id: "time_it",
        label: "Commander watches the sky — cross in cloud cover windows.",
        role: "commander",
        outcomeText: "Five minutes of patience buys a crossing nobody fires on.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: -3 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
      {
        id: "rear_cover",
        label: "Asst driver watches the rear while the rest cross — leapfrog.",
        role: "asst_driver",
        outcomeText: "Textbook. Nobody ever does textbook. It works.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: -6 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  foot_bridge: {
    id: "foot_bridge",
    kind: "travel",
    narrative: "A stone bridge arches over black water. One way is a town. The other is memory.",
    choices: [
      {
        id: "cross",
        label: "Cross quick — don't look at the water.",
        role: "commander",
        outcomeText: "The bridge doesn't notice you. That's the best outcome.",
        effects: [{ op: "mod_all_constitution", delta: -2 }],
      },
      {
        id: "gunner_covers",
        label: "Gunner covers the far bank while the crew crosses one at a time.",
        role: "gunner",
        outcomeText: "Slow but safe. He's the last one across. You don't mention that.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -5 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "check_integrity",
        label: "Driver checks the bridge first — a cracked stone is a cracked plan.",
        role: "driver",
        outcomeText: "It holds. You knew it would. You had to be sure.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: -3 },
          { op: "mod_all_constitution", delta: 1 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  foot_sniper: {
    id: "foot_sniper",
    kind: "infantry_combat",
    atmosphere: "A single crack. Then silence that listens back.",
    stakes: "critical",
    stakesNote: "Sniper contact on foot — drop, rush, or smoke.",
    narrative: "A single crack — not close, not far. Someone is measuring you with glass.",
    useDice: true,
    choices: [
      {
        id: "smoke",
        label: "Smoke and crawl — burn a mag for breathing room.",
        role: "asst_driver",
        modifierBonus: 0,
        outcomeText: "Dust hangs. The second shot doesn't come.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: -1 }],
      },
      {
        id: "scatter",
        label: "Commander orders scatter — each man finds cover independently.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "Five targets are harder than one. The shot doesn't come.",
        effects: [
          { op: "mod_all_constitution", delta: -5 },
          { op: "mod_constitution", role: "commander", delta: -4 },
        ],
      },
      {
        id: "return_fire",
        label: "Gunner pins the position with small arms — buy time to move.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "He fires blind at a shadow. The shadow doesn't fire back.",
        effects: [
          { op: "mod_hp", role: "gunner", delta: -8 },
          { op: "mod_resource", key: "smallArmsMags", delta: -2 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  foot_farm: {
    id: "foot_farm",
    kind: "human_moment",
    stakes: "critical",
    stakesNote: "Civilian mercy on foot — eat, refuse, or stand watch while the war waits outside.",
    atmosphere: "The smell of hay and livestock in a working barn. Someone here is still living their life in spite of everything.",
    narrative: "A barn door opens a crack. A woman older than the war gestures with one hand — come in, eat, be quiet. She doesn't smile. She doesn't have to.",
    preChoiceNpc: { speaker: "The woman", line: "Mangez. Vite. Avant que quelqu'un vous voie." },
    choices: [
      {
        id: "accept",
        label: "Accept — small mercy, taken with respect.",
        role: "loader",
        dialogueLine: "Merci, madame. We won't stay long.",
        outcomeText: "Bread tastes like guilt and gratitude at the same time. She refills the loader's bowl without looking at him. That's the closest thing to welcome the barn has.",
        npcReply: "She says nothing else. When you leave she closes the barn door and latches it. She'll be fine. She's been fine before.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "mod_constitution", role: "loader", delta: 6 },
        ],
      },
      {
        id: "commander_declines",
        label: "Commander declines — she has enough problems without five soldiers.",
        role: "commander",
        dialogueLine: "Non, madame. Merci. We're moving through.",
        outcomeText: "Her face doesn't change. That's the hardest part — there's no disappointment or relief, just the face of someone who has learned not to expect anything in particular from men with guns.",
        npcReply: "She closes the door quietly. The crew walks past in silence.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: -6 },
          { op: "mod_all_constitution", delta: -2 },
        ],
      },
      {
        id: "post_watch",
        label: "Gunner stands watch outside — the rest eat, someone should.",
        role: "gunner",
        dialogueLine: "Go. I've got the door.",
        outcomeText: "He eats last. He eats cold. He doesn't say anything about it and neither does anyone else because everyone knows it was right.",
        npcReply: "When the gunner comes in last she hands him bread without ceremony and goes back to whatever she was doing before the war interrupted.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "mod_constitution", role: "gunner", delta: -4 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  foot_checkpoint: {
    id: "foot_checkpoint",
    kind: "human_moment",
    stakes: "critical",
    stakesNote: "MP checkpoint — papers, charm, or quiet theft before the column backs up.",
    atmosphere: "A rope across the road and two MPs who look like they've been here since Tuesday and Tuesday was last week.",
    narrative: "MPs wave you toward a checkpoint. They don't ask questions they don't want answered but they do ask questions. The taller one has a clipboard. The other one watches the treeline like it owes him money.",
    preChoiceNpc: { speaker: "MP, Taller One", line: "State your unit, destination, and what happened to your vehicle, in that order." },
    choices: [
      {
        id: "papers",
        label: "Show dogtags — keep it official, answer everything straight.",
        role: "commander",
        dialogueLine: "Dog tags, serial numbers. Vehicle was lost to enemy action. We're moving to friendly lines.",
        outcomeText: "Rubber stamps and tired eyes. You become paperwork again. The MP writes something down and waves you through. You are official. You almost feel human.",
        npcReply: "He hands back the tags. \"Stay on this road. Second right. Don't stop for anything that isn't wearing a helmet.\"",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "driver_talks",
        label: "Driver does the talking — charming, fast, technically credible.",
        role: "driver",
        dialogueLine: "Hey, Corporal — we're 3rd Armored, tank went down at the river crossing, trying to link up with the column. You probably heard about it. Whole mess.",
        outcomeText: "The MP's pen pauses. He hasn't heard about it specifically. But he's heard about enough things today that this sounds plausible enough. He waves them through.",
        npcReply: "\"Stay on the road. Don't make me look for you.\" He watches you go with the expression of a man who knows he'll never find out if that was true.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 6 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "loader_hides",
        label: "Loader pockets the extra salvage kit before inspection.",
        role: "loader",
        dialogueLine: "Nothing in these pockets. Just personal effects, Corporal.",
        outcomeText: "The MPs are tired and there's a column backing up behind you. They wave you through without checking bags. The salvage kit rides in the loader's jacket. It stays.",
        npcReply: "\"Move up. You're blocking the road.\"",
        effects: [
          { op: "add_salvage", amount: 2 },
          { op: "mod_constitution", role: "loader", delta: -3 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  foot_ditch: {
    id: "foot_ditch",
    kind: "travel",
    atmosphere: "A drainage ditch smells like fuel and old rain.",
    stakes: "critical",
    stakesNote: "Follow the ditch or climb out — mud and visibility trade places.",
    narrative: "A drainage ditch smells like fuel and rain. You follow it because maps lie less than roads.",
    choices: [
      {
        id: "follow",
        label: "Follow the ditch — muddy and reliable.",
        role: "driver",
        outcomeText: "Mud in every seam. Still breathing.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -4 }],
      },
      {
        id: "asst_scouts",
        label: "Asst driver scouts fifty meters ahead — no surprises.",
        role: "asst_driver",
        outcomeText: "He finds a dead German and a dry section. Reports both.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: -5 },
          { op: "add_salvage", amount: 1 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "loader_helps",
        label: "Loader helps the most exhausted man through the muck.",
        role: "loader",
        outcomeText: "Two men slower, everyone arrives.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -5 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  foot_dog: {
    id: "foot_dog",
    kind: "human_moment",
    stakes: "critical",
    stakesNote: "A dog on the march — feed it, chase it, or let it walk until it chooses to leave.",
    atmosphere: "Mid-column, the sound of boots on a road that's been used too much. And something else. Lighter. Four feet.",
    narrative: "A dog falls in beside the column for a mile. It's not a thin dog — somebody's been feeding it. Nobody names it. Nobody admits they're glad it's there. It just walks beside them like it has somewhere to be and this is the right direction.",
    choices: [
      {
        id: "share",
        label: "Loader shares a crust from the ration pack.",
        role: "loader",
        dialogueLine: "Here. Don't tell the commander.",
        outcomeText: "The dog takes it politely. It walks another quarter mile and then peels off into the ditch without ceremony. That's its job. It had somewhere else to be after all.",
        effects: [{ op: "mod_resource", key: "foodDays", delta: -1 }, { op: "mod_all_constitution", delta: 4 }],
      },
      {
        id: "chase_off",
        label: "Driver chases it away — it'll get shot walking with soldiers.",
        role: "driver",
        dialogueLine: "Go on. Get. This isn't safe for you.",
        outcomeText: "It goes. Eventually. The driver doesn't feel good about it. That's probably the right response.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: -5 },
          { op: "mod_all_constitution", delta: 1 },
        ],
      },
      {
        id: "just_let_it",
        label: "Nobody does anything — let it walk with you as long as it wants.",
        role: "commander",
        dialogueLine: "Leave it. It's not hurting anything.",
        outcomeText: "It follows for two miles and then makes its own decision about its next destination. Some company asks for nothing and offers everything. That's the best kind.",
        effects: [{ op: "mod_all_constitution", delta: 6 }],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  elite_stug_nest: {
    id: "elite_stug_nest",
    kind: "elite_encounter",
    narrative:
      "A low hull hides behind a berm — no turret, just a slit and a long 75 that doesn't miss for sport. StuG nest. Someone built it with patience.",
    quote: '{gnr}: "HEAT if we have it. Angle is everything."',
    useDice: true,
    enemy: { idealAmmo: "HEAT", combatMod: -1, label: "StuG III" },
    choices: [
      {
        id: "heat_face",
        label: "Commit HEAT — face it head-on through the slit.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "The berm erupts. The StuG stops being patient.",
        effects: [
          { op: "spend_ammo", ammo: "HEAT", amount: 2 },
          { op: "add_salvage", amount: 3 },
        ],
      },
      {
        id: "flank",
        label: "Flank wide — burn distance, deny them the angle.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "You buy an angle the nest didn't plan for.",
        effects: [{ op: "mod_tank_health", delta: -6 }, { op: "add_salvage", amount: 2 }],
      },
      {
        id: "loader_clever",
        label: "Loader spots a drainage channel — use it to approach blind.",
        role: "loader",
        modifierBonus: 2,
        outcomeText: "They built the nest facing the road. Nobody told them about the ditch.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 8 },
          { op: "spend_ammo", ammo: "HEAT", amount: 1 },
          { op: "add_salvage", amount: 4 },
          { op: "journal", text: "Loader found the approach to the StuG nest.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  elite_konkurs_column: {
    id: "elite_konkurs_column",
    kind: "elite_encounter",
    narrative:
      "Captured column on the road — half German, half chaos. A King Tiger idles like a cathedral that learned to hate.",
    quote: '{cyn}: "If that turret turns, we\'re a story. If it doesn\'t, we\'re lucky."',
    useDice: true,
    enemy: { idealAmmo: "AP", combatMod: -2, label: "King Tiger" },
    choices: [
      {
        id: "ap_track",
        label: "AP into the running gear — make it a pillbox, not a threat.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "Tracks scream. The monster becomes a monument.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 4 },
          { op: "damage_random_component" },
          { op: "add_salvage", amount: 5 },
        ],
      },
      {
        id: "withdraw_smoke",
        label: "Smoke and peel — live with the shame, not the obituary.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "Pride costs more than salvage. You keep the crew.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }, { op: "mod_all_constitution", delta: -6 }],
      },
      {
        id: "asst_radio_diversion",
        label: "Asst driver raises the enemy frequency — fake orders, buy two minutes.",
        role: "asst_driver",
        modifierBonus: 0,
        outcomeText: "The Tiger crew looks confused. Confused is your friend.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: 10 },
          { op: "spend_ammo", ammo: "AP", amount: 3 },
          { op: "add_salvage", amount: 4 },
          { op: "journal", text: "Asst driver bluffed a King Tiger's crew with false radio orders.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  gen_travel_mine: {
    id: "gen_travel_mine",
    kind: "travel",
    atmosphere:
      "The road surface is wrong — too fresh, too deliberate. The wrong kind of quiet: not peaceful, listening.",
    stakes: "elevated",
    stakesNote: "Mines don't argue. Driver pace vs Commander risk — pick a lane.",
    narrative: "A mine marker tilts wrong — too new, too clean. Someone moved the wire. There's a fresh scrape in the dirt where the road narrows between two drainage culverts. The driver stops before being asked.",
    useDice: true,
    choices: [
      {
        id: "probe",
        label: "Probe with a track — slow and hated by everyone in the hull.",
        role: "driver",
        modifierBonus: 0,
        dialogueLine: "Everybody hold on. And I mean be quiet.",
        outcomeText: "The world holds its breath for seventeen seconds. The track finds dirt. The driver breathes again in a way that sounds like it cost him something.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -8 }],
      },
      {
        id: "dismount_check",
        label: "Asst driver dismounts to check the culvert visually.",
        role: "asst_driver",
        modifierBonus: 1,
        dialogueLine: "I'll go. Don't run me over if I start running.",
        outcomeText: "He finds it — pressure plate, shifted laterally, not buried deep enough. He marks it, backs away, reports. The detour costs twenty minutes. The alternative costs more.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: -10 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
      {
        id: "alternate_route",
        label: "Commander calls a route change — bypass through the field.",
        role: "commander",
        modifierBonus: -1,
        dialogueLine: "Don't trust it. Go left through the field, rejoin the road past the culvert.",
        outcomeText: "The field is soft. The tank bogs briefly and the driver earns his pay getting through it. Cleaner than the alternative.",
        effects: [
          { op: "mod_tank_health", delta: -5 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_travel_bridge_down: {
    id: "gen_travel_bridge_down",
    kind: "travel",
    atmosphere:
      "The bridge sags like a tired animal. Engineers mark crossings on maps — the river didn't get the memo.",
    stakes: "elevated",
    stakesNote: "Cross damaged span or find another way — time vs hull.",
    narrative: "The bridge is gone — just ribs of steel and a cold joke in the water below. Someone blew it recently; the ends still smoke where the charges went.",
    choices: [
      {
        id: "ford",
        label: "Driver finds a ford downstream — wet tracks, dry nerves.",
        role: "driver",
        dialogueLine: "The bank looks soft but the bottom should hold. Maybe.",
        outcomeText: "Cold water climbs the hull like a second crew. The engine complains the whole way. You reach the far bank with everything working and no dignity left.",
        effects: [{ op: "mod_tank_health", delta: -4 }, { op: "mod_resource", key: "waterCanteens", delta: -1 }],
      },
      {
        id: "wait_engineers",
        label: "Commander radios for engineers — wait for a proper crossing.",
        role: "commander",
        dialogueLine: "Hold here. I'm raising engineers.",
        outcomeText: "Two hours. Longer than you wanted, shorter than the alternative if the ford had failed. The crossing is clean and costs nothing but time.",
        effects: [
          { op: "mod_all_constitution", delta: -3 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
      {
        id: "loader_scouts",
        label: "Loader checks the bank on foot — find the best line before committing.",
        role: "loader",
        dialogueLine: "Let me check the bank first. Two minutes.",
        outcomeText: "The loader comes back wet to the knees with actual useful information. The crossing saves the hull three percent hull damage and finds a supply cache someone left in the reeds.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -4 },
          { op: "mod_tank_health", delta: -2 },
          { op: "add_salvage", amount: 2 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_human_watch: {
    id: "gen_human_watch",
    kind: "human_moment",
    atmosphere: "The village is too quiet for a village. The only things moving are the wrong height to be soldiers.",
    narrative: "Two kids watch the tank pass like it's weather. One waves. The other doesn't blink. They're standing on a wall that used to be the front of something.",
    preChoiceNpc: { speaker: "The waving one", line: "Américain?" },
    choices: [
      {
        id: "wave",
        label: "Wave back — small politeness, nothing more.",
        role: "loader",
        dialogueLine: "Yeah, kid. Américain.",
        outcomeText: "The waving kid smiles. The other still doesn't blink. The loader holds the wave until the tank clears the corner.",
        npcReply: "The waving one waves twice more and runs inside. The still one just watches until you're gone.",
        effects: [{ op: "mod_constitution", role: "loader", delta: 5 }],
      },
      {
        id: "stop_explain",
        label: "Commander stops — says something brief through the hatch.",
        role: "commander",
        dialogueLine: "We're passing through. It'll be quiet again soon.",
        outcomeText: "One of them says a word in their language that might mean thank you or might mean something else entirely. He saves it anyway.",
        npcReply: "The waving one nods like an adult would. The still one finally blinks.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: 8 },
          { op: "mod_all_constitution", delta: 3 },
          { op: "journal", text: "Two kids watching the tank. One waved. One didn't.", kind: "moment" },
        ],
      },
      {
        id: "drive_past",
        label: "Driver keeps rolling — eyes on the road.",
        role: "driver",
        dialogueLine: "Eyes front. Not our stop.",
        outcomeText: "The kids shrink in the mirror. The driver turns the mirror down. Some things are easier not to watch.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -5 }],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_supply_black_market: {
    id: "gen_supply_black_market",
    kind: "supply",
    atmosphere: "This man has been in three different theaters. None of them officially. He has a look that says he'll outlast the war, the army, and possibly the country.",
    narrative: "A sergeant with no visible unit affiliation and an improbable number of crates sits behind a jeep in a ruined farmyard. He sells chocolate, ammunition, and the kind of information that has a short shelf life.",
    preChoiceNpc: { speaker: "Sgt. Unknown", line: "I don't know your names and I don't want to. What do you need and what do you have?" },
    choices: [
      {
        id: "buy_food",
        label: "Buy food — pay in salvage stories.",
        role: "commander",
        dialogueLine: "Rations. Whatever you have. Here's what we saw at the river crossing.",
        outcomeText: "You overpay in currency the army doesn't recognize. The food is real. The sergeant has heard the story before but listens anyway.",
        npcReply: "Good enough. Tell your division the crossroads at Pont-Ste-Marie is clear on the east side. That's free.",
        effects: [{ op: "spend_salvage", amount: 2 }, { op: "mod_resource", key: "foodDays", delta: 2 }],
      },
      {
        id: "gunner_trades",
        label: "Gunner trades a spare part for ammo — he knows what it's worth.",
        role: "gunner",
        dialogueLine: "What'll you give me for a working radio mount? Still in the bracket.",
        outcomeText: "The sergeant's eyes light up with the particular joy of a man who trades in useful things. Gunner walks back with AP rounds and no regrets at all.",
        npcReply: "Next time you're through this sector, ask for me by the wrong name. I'll know who you mean.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -4 },
          { op: "spend_salvage", amount: 1 },
          { op: "mod_resource", key: "smallArmsMags", delta: 2 },
        ],
      },
      {
        id: "loader_haggles",
        label: "Loader haggles hard — talks the price down before anyone commits.",
        role: "loader",
        dialogueLine: "That price is what you tell guys who don't know the going rate. We know the going rate.",
        outcomeText: "The sergeant respects it the way men who negotiate for a living always respect someone who won't fold. You get more than you paid for.",
        npcReply: "Alright. I like you. Don't come back — it'll ruin the relationship.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 5 },
          { op: "spend_salvage", amount: 1 },
          { op: "mod_resource", key: "foodDays", delta: 2 },
          { op: "mod_resource", key: "waterCanteens", delta: 1 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_rest_smoke: {
    id: "gen_rest_smoke",
    kind: "rest",
    atmosphere:
      "Five men on a cooling tank in the shade of something that used to be a building. A cigarette would be a treaty with the next hour.",
    stakes: "routine",
    stakesNote: "Rest is never free — noise, light, and who stands watch.",
    narrative: "Smoke break without cigarettes — just heat rising off the deck and jokes nobody finishes.\n\nThe loader is asleep against the track. The gunner is cleaning something that doesn't need cleaning. This is what downtime looks like.",
    choices: [
      {
        id: "breathe",
        label: "Let the silence stretch — nobody talks, nobody has to.",
        role: "gunner",
        dialogueLine: "Don't start a conversation. I mean it.",
        outcomeText: "Sometimes rest is not doing anything louder than necessary. The crew finds the frequency of their own breathing and stays there for twenty minutes. It helps more than anyone says.",
        effects: [{ op: "mod_all_constitution", delta: 5 }],
      },
      {
        id: "loader_food",
        label: "Loader breaks out hidden rations — where did he even get those?",
        role: "loader",
        dialogueLine: "Don't ask. Just eat.",
        outcomeText: "Nobody asks. The food is real. There's enough for everyone if nobody takes more than their share, which everyone knows without being told.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "mod_all_constitution", delta: 7 },
          { op: "mod_constitution", role: "loader", delta: 5 },
        ],
      },
      {
        id: "asst_joke",
        label: "Asst driver tells a joke. It isn't funny. Everyone laughs anyway.",
        role: "asst_driver",
        dialogueLine: "Okay, okay — a man walks into a bar in Aachen, right—",
        outcomeText: "The punchline doesn't land at all. Three men laugh until it does. Laughter is a sound that doesn't belong here and that's exactly why you need it.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: 6 },
          { op: "mod_all_constitution", delta: 8 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_combat_mortar: {
    id: "gen_combat_mortar",
    kind: "defensive_stand",
    atmosphere: "Whistles bracket the position. The ground jumps in fractions.",
    stakes: "elevated",
    stakesNote: "Mortars don't miss forever. Move, dig, or shoot — standing still is a vote.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative: "Mortars walk toward you like slow footsteps. The ground learns your shape.",
    useDice: true,
    choices: [
      {
        id: "move",
        label: "Move the tank — break the pattern, deny the bracket.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "Dirt fountains where you were.",
        effects: [{ op: "mod_tank_health", delta: -5 }],
      },
      {
        id: "gunner_suppresses",
        label: "Gunner fires HE at likely mortar position — make them move.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "The mortar team relocates. Your rounds hit empty earth. Good enough.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "mod_all_constitution", delta: -3 },
        ],
      },
      {
        id: "cmd_smoke",
        label: "Commander calls for smoke — standard counter-mortar drill.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "White smoke drifts between you and them. They stop firing into the blind.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_infantry_cellar: {
    id: "gen_infantry_cellar",
    kind: "infantry_combat",
    atmosphere: "Stone building, black windows. Movement inside that isn't yours.",
    stakes: "elevated",
    stakesNote: "Room fighting costs HE and exposure. Commander pays in hatch time.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative: "Cellar doors slam. Muzzles in the dark. Someone screams orders in two languages at once.",
    useDice: true,
    enemy: { idealAmmo: "HE", label: "Building defenders" },
    choices: [
      {
        id: "he",
        label: "HE into the doorway — end the argument.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "The house stops arguing.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }],
      },
      {
        id: "asst_suppress",
        label: "Asst driver hoses the windows with hull MG — pin them, don't waste a round.",
        role: "asst_driver",
        modifierBonus: 1,
        outcomeText: "They stay down. You move past. That counts.",
        effects: [
          { op: "mod_resource", key: "smallArmsMags", delta: -2 },
          { op: "mod_constitution", role: "asst_driver", delta: -5 },
        ],
      },
      {
        id: "cmd_surrender",
        label: "Commander shouts for surrender — worth ten seconds and nothing else.",
        role: "commander",
        modifierBonus: 0,
        outcomeText: "Three men come out with their hands up. You accept this.",
        effects: [
          { op: "mod_all_constitution", delta: 5 },
          { op: "add_salvage", amount: 1 },
          { op: "journal", text: "Three prisoners from a cellar fight.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_officer_roadblock: {
    id: "gen_officer_roadblock",
    kind: "travel",
    atmosphere: "There are two kinds of officers in a war. The kind who've been to the front and the kind blocking the road.",
    narrative: "A staff car blocks the road with its bumper precisely in the center of it. A colonel with clean boots stands beside it and checks his watch in a way that suggests time is being wasted — specifically, yours.",
    preChoiceNpc: { speaker: "Col. Something", line: "You. Tank commander. I need your vehicle's fuel capacity and current load. Division is short on estimates." },
    choices: [
      {
        id: "comply",
        label: "Comply — salute, answer, move on.",
        role: "commander",
        dialogueLine: "Sir. Fuel capacity is rated 170 gallons. Current load is classified until your aide produces the right form. Sir.",
        outcomeText: "You lose an hour and some patience but keep your orders clean. The colonel writes something on a clipboard. He does not thank you.",
        npcReply: "Dismissed. And tell your driver the road markings are there for a reason.",
        effects: [{ op: "mod_all_constitution", delta: -3 }],
      },
      {
        id: "driver_bypass",
        label: "Driver eases through the ditch around the staff car — technically not disobeying orders.",
        role: "driver",
        dialogueLine: "Sorry, Colonel, brakes are — we're moving. Very sorry.",
        outcomeText: "The colonel's aide shouts something. The engine is louder than his opinion about it.",
        npcReply: "The colonel's voice carries into the distance. He has strong feelings. The tank has a transmission and wins.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 6 },
          { op: "mod_tank_health", delta: -2 },
        ],
      },
      {
        id: "gunner_stare",
        label: "Gunner begins a slow turret traverse toward the staff car.",
        role: "gunner",
        dialogueLine: "Sorry, sir — routine traverse check. Carry on.",
        outcomeText: "The colonel looks at the gun barrel. The gun barrel looks at the staff car. The staff car moves. Nobody says a word about it. Nobody ever will.",
        npcReply: "The colonel gets in his car facing away from you. He drives off at exactly the speed of a man pretending nothing happened.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: 4 },
          { op: "mod_all_constitution", delta: 5 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_radio_squeal: {
    id: "gen_radio_squeal",
    kind: "travel",
    atmosphere: "Static in a moving tank sounds like breathing. This is something else.",
    narrative: "The radio squeals with a voice that isn't yours and coordinates that don't match the map. The voice is calm. That's the wrong kind of calm.",
    preChoiceNpc: { speaker: "Unknown station", line: "Requesting any station on this net — we have a fire mission and nobody answering. Over." },
    choices: [
      {
        id: "ignore",
        label: "Ignore it — wrong frequency, not your problem.",
        role: "commander",
        dialogueLine: "Squelch it. Not our net, not our call.",
        outcomeText: "Silence returns. So does the doubt about whether that was the right call. It probably was. It might not have been.",
        effects: [{ op: "mod_constitution", role: "commander", delta: -4 }],
      },
      {
        id: "call_back",
        label: "Gunner calls back — voice challenge, see who answers.",
        role: "gunner",
        dialogueLine: "Unknown station, this is — what's your authenticator? Over.",
        outcomeText: "Wrong frequency, friendly unit, very confused. Right instinct. Someone else's fire mission, someone else's problem, but at least you know.",
        npcReply: "Roger. Disregard. We have comms now. Out.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -2 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
      {
        id: "trace_freq",
        label: "Asst driver works the radio — trace it, help them.",
        role: "asst_driver",
        dialogueLine: "Give me two minutes. I can find where they are.",
        outcomeText: "It's a field artillery battery three klicks north, radio operator new and lost. You help them. They give you a reference grid for the next twenty-four hours. That's worth more than it sounds.",
        npcReply: "Much appreciated, armor. We'll call you a good word if we get the chance.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: 6 },
          { op: "add_salvage", amount: 2 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_loader_shell_stuck: {
    id: "gen_loader_shell_stuck",
    kind: "tank_combat",
    atmosphere: "The breech won't close. The world outside doesn't pause.",
    stakes: "elevated",
    stakesNote: "Stuck round with contact near — clear it or abandon the gun.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative: "The breech ring eats a round. The gunner curses like prayer. The tank is a metal throat with something stuck in it.",
    choices: [
      {
        id: "kick",
        label: "Loader clears it — sweat and leverage.",
        role: "loader",
        outcomeText: "The round frees. Your hands shake anyway.",
        effects: [{ op: "mod_constitution", role: "loader", delta: -6 }, { op: "set_component", component: "main_gun", status: "damaged" }],
      },
      {
        id: "emergency_dismount",
        label: "Commander orders a brief halt and external check — safety first.",
        role: "commander",
        outcomeText: "Five minutes outside the tank. Cold air, clearer head. The breach clears clean.",
        effects: [
          { op: "mod_all_constitution", delta: -3 },
          { op: "mod_constitution", role: "loader", delta: 4 },
        ],
      },
      {
        id: "asst_helps",
        label: "Asst driver squeezes through to help — two sets of hands.",
        role: "asst_driver",
        outcomeText: "Cramped. Ugly. It works. The round seats.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: -4 },
          { op: "mod_constitution", role: "loader", delta: 4 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_asst_periscope: {
    id: "gen_asst_periscope",
    kind: "travel",
    atmosphere: "Dust on the glass. Every scratch feels like a threat.",
    stakes: "routine",
    stakesNote: "Optics and nerves — fix it now or fight half-blind next beat.",
    narrative: "The assistant driver's periscope fogs and won't clear. The world shrinks to a grey coin.",
    choices: [
      {
        id: "wipe",
        label: "Asst driver wipes it raw — risk a splinter.",
        role: "asst_driver",
        outcomeText: "Vision returns. The road doesn't look better.",
        effects: [{ op: "mod_hp", role: "asst_driver", delta: -3 }],
      },
      {
        id: "loader_fix",
        label: "Loader fashions a rag seal from kit — five minutes, proper fix.",
        role: "loader",
        outcomeText: "Clear view. Nobody shot at them during the fix. Bonus.",
        effects: [
          { op: "mod_constitution", role: "asst_driver", delta: 6 },
          { op: "mod_constitution", role: "loader", delta: 4 },
        ],
      },
      {
        id: "cmd_halt",
        label: "Commander orders a full halt — won't move blind.",
        role: "commander",
        outcomeText: "Frustrating. Correct. The periscope gets replaced from the kit bag.",
        effects: [
          { op: "mod_all_constitution", delta: -2 },
          { op: "set_component", component: "optics", status: "ok" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_cmd_crossing: {
    id: "gen_cmd_crossing",
    kind: "offensive_assault",
    atmosphere: "Water, wire, and the math of who goes first.",
    stakes: "elevated",
    stakesNote: "Crossing under fire — hull leads or infantry screens. Debate before you move.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative: "The objective is a crossroads and a clock. Both lie.",
    useDice: true,
    choices: [
      {
        id: "push",
        label: "Push straight — speed over elegance.",
        role: "commander",
        modifierBonus: -1,
        outcomeText: "You take ground. You pay in noise.",
        effects: [{ op: "mod_tank_health", delta: -5 }, { op: "add_salvage", amount: 2 }],
      },
      {
        id: "driver_alternate",
        label: "Driver finds an alternate approach — less covered but flanking.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "The approach angle surprises them. That's the whole plan.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: -5 },
          { op: "add_salvage", amount: 3 },
        ],
      },
      {
        id: "loader_ammo_prep",
        label: "Loader stages AP and HE before the push — no fumbling in contact.",
        role: "loader",
        modifierBonus: 0,
        outcomeText: "He has the first round in the breech before you even say fire.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -3 },
          { op: "add_salvage", amount: 2 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,
  gen_defensive_flare: {
    id: "gen_defensive_flare",
    kind: "defensive_stand",
    atmosphere: "A flare climbs and turns the night into a courtroom.",
    stakes: "elevated",
    stakesNote: "Light exposes everyone. Shoot now or let them close — brutal either way.",
    tierFlavor: {
      1: "The round goes wrong. Spall, smoke, and the sick feeling of metal finding you.",
      2: "You hold — messy, costly, but the crew is still talking.",
      3: "Good enough. Nobody celebrates. Everybody breathes.",
      4: "Clean work for once. The war almost pretends to be fair.",
    },    narrative: "Flares rise like false suns. Shapes move where you told yourself nothing could.",
    useDice: true,
    choices: [
      {
        id: "hold",
        label: "Hold discipline — identify before fire.",
        role: "gunner",
        modifierBonus: 1,
        outcomeText: "Patience turns a panic into a plan.",
        effects: [{ op: "mod_all_constitution", delta: -2 }],
      },
      {
        id: "asst_flanks",
        label: "Asst driver watches the flanks with MG — don't let them envelope you.",
        role: "asst_driver",
        modifierBonus: 0,
        outcomeText: "They tried for the flank. He was already there.",
        effects: [
          { op: "mod_resource", key: "smallArmsMags", delta: -1 },
          { op: "mod_constitution", role: "asst_driver", delta: -5 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "cmd_support",
        label: "Commander calls for artillery support on the approach — use the radio.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "Six minutes. They're accurate this time.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: -4 },
          { op: "add_salvage", amount: 3 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  // ── NPC Conversation Events ──────────────────────────────────────────────

});

// ─── Wave 7-B: new historical anchors, elite encounters, social beats ─────────

Object.assign(EVENT_CATALOG, {

  // ── New anchors ──────────────────────────────────────────────────────────────
  anchor_seine_crossing: {
    id: "anchor_seine_crossing",
    kind: "historical_anchor",
    narrative:
      "The Seine doesn't care about schedules. German units retreat across her like ink bleeding back off the page — some organised, some already ruined. Your column is a wedge looking for a gap.",
    quote: '{drv}: "Bridge is gone. Pontoon is maybe. Ford is optimism."',
    useDice: true,
    choices: [
      {
        id: "chase_ford",
        label: "Driver finds a shallow crossing — push through, accept the risk.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "Water climbs the hull to the sponson. The engine complains. You make the far bank before it stops complaining.",
        effects: [
          { op: "mod_tank_health", delta: -5 },
          { op: "add_salvage", amount: 3 },
          { op: "seed_flag", flag: "seine_pursuit" },
          { op: "journal", text: "Crossed the Seine. Wet boots, working tank.", kind: "moment" },
        ],
      },
      {
        id: "wait_pontoon",
        label: "Hold position — wait for engineers to confirm the pontoon.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "An hour costs nothing but time. The engineers wave you through. You cross clean.",
        effects: [
          { op: "mod_all_constitution", delta: -3 },
          { op: "add_salvage", amount: 2 },
          { op: "seed_flag", flag: "seine_pursuit" },
          { op: "journal", text: "Crossed the Seine on the engineers' pontoon.", kind: "moment" },
        ],
      },
      {
        id: "salvage_crossing",
        label: "Loader spots abandoned German supply wagons on the near bank — strip them before crossing.",
        role: "loader",
        modifierBonus: -1,
        outcomeText: "The wagons give up their ammunition without ceremony. You cross heavier and later than planned.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: 2 },
          { op: "add_salvage", amount: 5 },
          { op: "seed_flag", flag: "seine_pursuit" },
          { op: "journal", text: "Scavenged the Seine banks before the crossing.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  anchor_cologne: {
    id: "anchor_cologne",
    kind: "historical_anchor",
    narrative:
      "Cologne is a cathedral and a ruin and a duel in the street between something that matters and something that used to. A Panther sits in the square like it belongs there. The buildings decide the engagement before you do.",
    quote: '{gnr}: "Six hundred meters. Rubble everywhere. He can angle and we can\'t stop him if he does."',
    useDice: true,
    enemy: { idealAmmo: "AP", combatMod: -1, label: "Panther" },
    choices: [
      {
        id: "direct_ap",
        label: "Gunner takes the shot — AP through the turret face at this angle.",
        role: "gunner",
        modifierBonus: -1,
        outcomeText: "The round flies in a cathedral that used to have a roof. The Panther doesn't answer.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 3 },
          { op: "damage_random_component" },
          { op: "add_salvage", amount: 5 },
          { op: "journal", text: "Killed the Last Panther at Cologne.", kind: "moment" },
          { op: "discovery_stub", id: "cologne_duel" },
        ],
      },
      {
        id: "building_collapse",
        label: "Driver pulls to the flank — HE into the corner building, bring it down on him.",
        role: "driver",
        modifierBonus: 0,
        outcomeText: "Two floors become rubble. The Panther becomes archaeology.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 4 },
          { op: "mod_all_constitution", delta: -6 },
          { op: "add_salvage", amount: 4 },
          { op: "journal", text: "Buried the Cologne Panther in rubble.", kind: "moment" },
          { op: "discovery_stub", id: "cologne_duel" },
        ],
      },
      {
        id: "cmd_reposition",
        label: "Commander calls for infantry coordination — smoke, then reposition for a rear shot.",
        role: "commander",
        modifierBonus: 1,
        outcomeText: "The infantry smoke screen buys the angle. The rear plate is an honest shot.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "spend_ammo", ammo: "AP", amount: 2 },
          { op: "add_salvage", amount: 4 },
          { op: "journal", text: "Coordinated the Cologne Panther kill.", kind: "moment" },
          { op: "discovery_stub", id: "cologne_duel" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  anchor_ve_day: {
    id: "anchor_ve_day",
    kind: "historical_anchor",
    narrative:
      "The radio says it's over. The radio has said a lot of things. But the guns aren't answering back anymore, and that's a kind of evidence. Someone in the column fires a signal flare for no tactical reason. The smoke is green. It hangs in the air like it doesn't know what to do next either.",
    quote: '{kid}: "That\'s it? That\'s actually it?"',
    useDice: false,
    choices: [
      {
        id: "quiet_moment",
        label: "Stay at the tank — let it settle without words.",
        role: "commander",
        outcomeText: "The silence after shooting stops isn't peaceful. It's just different. The crew sits with it. That's enough.",
        effects: [
          { op: "mod_all_constitution", delta: 15 },
          { op: "journal", text: "VE Day. Still here.", kind: "moment" },
          { op: "discovery_stub", id: "ve_day_witnessed" },
        ],
      },
      {
        id: "celebrate_with_column",
        label: "Walk down the column — be where the noise is.",
        role: "asst_driver",
        outcomeText: "Someone has a bottle they've been saving since Normandy. It tastes like regret and relief and something that doesn't have a name.",
        effects: [
          { op: "mod_all_constitution", delta: 12 },
          { op: "mod_constitution", role: "asst_driver", delta: 8 },
          { op: "journal", text: "VE Day. Shared a bottle with the column.", kind: "moment" },
          { op: "discovery_stub", id: "ve_day_witnessed" },
        ],
      },
      {
        id: "write_home",
        label: "Loader pulls out paper — everyone writes something down.",
        role: "loader",
        outcomeText: "Five men, five letters to five different places. Some of them will arrive.",
        effects: [
          { op: "mod_all_constitution", delta: 18 },
          { op: "journal", text: "VE Day. Letters written.", kind: "moment" },
          { op: "discovery_stub", id: "ve_day_witnessed" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  // ── New elite encounters ──────────────────────────────────────────────────────
  elite_remagen: {
    id: "elite_remagen",
    kind: "elite_encounter",
    narrative:
      "The bridge at Remagen stands when it shouldn't. SS rearguard has the approaches. They know what happens if you cross. They plan to make it expensive.",
    quote: '{cmd}: "We get one window. Maybe."',
    useDice: true,
    enemy: { idealAmmo: "HE", combatMod: -1, label: "SS Rearguard" },
    choices: [
      {
        id: "direct_breach",
        label: "Commander calls a direct breach — full speed, suppress everything.",
        role: "commander",
        modifierBonus: -1,
        outcomeText: "The bridge shakes. Men are dying on both ends of it. You reach the far side with your momentum and some of your crew.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 3 },
          { op: "mod_tank_health", delta: -15 },
          { op: "mod_all_constitution", delta: -8 },
          { op: "add_salvage", amount: 6 },
          { op: "journal", text: "Breached the Remagen bridge approach.", kind: "moment" },
        ],
      },
      {
        id: "smoke_suppress",
        label: "Lay smoke across the bridge approaches — let infantry move first.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "The WP screen turns them blind. Infantry floods the near side. You cross in their wake.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 2 },
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "mod_tank_health", delta: -8 },
          { op: "add_salvage", amount: 5 },
          { op: "journal", text: "Crossed Remagen under smoke.", kind: "moment" },
        ],
      },
      {
        id: "asst_flank",
        label: "Asst Driver spots a covered approach — hull-down angle to suppress the near pylon.",
        role: "asst_driver",
        modifierBonus: 1,
        outcomeText: "The approach angle you find changes the whole equation. They can't respond to what they can't see.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 2 },
          { op: "mod_constitution", role: "asst_driver", delta: 10 },
          { op: "add_salvage", amount: 5 },
          { op: "journal", text: "Found the angle at Remagen.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  elite_tiger_wallendorf: {
    id: "elite_tiger_wallendorf",
    kind: "elite_encounter",
    narrative:
      "Wallendorf is a village that knows what a Tiger sounds like in a narrow lane. The sound is low and certain, like a door closing on something that didn't want to be closed. The hull fills the entire lane. There is no flank shot from here.",
    quote: '{gnr}: "At this range, if we miss once, we don\'t get another. That thing will open us like a can."',
    useDice: true,
    enemy: { idealAmmo: "AP", combatMod: -2, label: "Tiger I" },
    choices: [
      {
        id: "ap_flank",
        label: "Reverse hard and find the alley — get to the flank before he traverses.",
        role: "driver",
        modifierBonus: 1,
        outcomeText: "You back down the lane fast enough that something ceramic breaks in the hull. The Tiger's turret is still moving when you put AP through the side plate.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 3 },
          { op: "damage_random_component" },
          { op: "add_salvage", amount: 6 },
          { op: "journal", text: "Flanked and killed the Tiger at Wallendorf.", kind: "moment" },
          { op: "discovery_stub", id: "tiger_wallendorf" },
        ],
      },
      {
        id: "withdraw",
        label: "Pull back — report the position and let artillery handle it.",
        role: "commander",
        modifierBonus: 2,
        outcomeText: "Pride is a luxury. The call goes up to artillery. An hour later, Wallendorf has a crater problem. You have ammunition.",
        effects: [
          { op: "mod_all_constitution", delta: -8 },
          { op: "mod_resource", key: "foodDays", delta: 1 },
          { op: "add_salvage", amount: 2 },
          { op: "journal", text: "Called in the Tiger at Wallendorf. Someone else got the kill.", kind: "moment" },
        ],
      },
      {
        id: "ambush_position",
        label: "Gunner sets up in the barn entrance — wait for him to clear the lane junction.",
        role: "gunner",
        modifierBonus: 0,
        outcomeText: "Patience is a kind of ammunition. The Tiger rounds the corner into your shot. The barn is kindling but the Tiger is stopped.",
        effects: [
          { op: "spend_ammo", ammo: "AP", amount: 2 },
          { op: "mod_tank_health", delta: -12 },
          { op: "add_salvage", amount: 5 },
          { op: "journal", text: "Killed the Tiger at Wallendorf from ambush.", kind: "moment" },
          { op: "discovery_stub", id: "tiger_wallendorf" },
        ],
      },
      {
        id: "he_building",
        label: "Loader loads HE — collapse the building beside him, block his manoeuvre.",
        role: "loader",
        modifierBonus: -1,
        outcomeText: "The wall comes down in three shells. The Tiger is trapped under rubble, still alive, still trying to traverse. You put AP through the roof hatch.",
        effects: [
          { op: "spend_ammo", ammo: "HE", amount: 3 },
          { op: "spend_ammo", ammo: "AP", amount: 1 },
          { op: "mod_tank_health", delta: -8 },
          { op: "add_salvage", amount: 7 },
          { op: "journal", text: "Buried and killed the Tiger at Wallendorf.", kind: "moment" },
          { op: "discovery_stub", id: "tiger_wallendorf" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,


  // ── NPC Conversation Events ──────────────────────────────────────────────

});

// ── New social beats ────────────────────────────────────────────────────────

Object.assign(EVENT_CATALOG, {

  social_drunk: {
    id: "social_drunk",
    kind: "human_moment",
    atmosphere: "Cellar air and bad decisions already made.",
    stakesNote: "Found liquor tests discipline — humor, anger, or silence will spread.",
    narrative:
      "Someone found something in a farmhouse cellar. Not wine — something older and more serious. {drv} has the look of a man who made a poor decision an hour ago and has had time to make peace with it.",
    quote: '{drv}: "I am fine. I am — I have been worse. Tell them I am fine."',
    useDice: false,
    choices: [
      {
        id: "let_it_happen",
        label: "Leave him to it — everyone needs a night off from being themselves.",
        role: "commander",
        outcomeText: "Morning is less kind than the bottle but the crew gives him space. He's embarrassed in the useful way.",
        effects: [
          { op: "mod_all_constitution", delta: 8 },
          { op: "mod_constitution", role: "driver", delta: -5 },
        ],
      },
      {
        id: "join_in",
        label: "Someone sits with him — this is better done in company.",
        role: "loader",
        outcomeText: "Two men and a bottle and the war at arm's length for one evening. Not safe. Not sustainable. Exactly right.",
        effects: [
          { op: "mod_all_constitution", delta: 12 },
          { op: "mod_constitution", role: "loader", delta: -3 },
          { op: "mod_constitution", role: "driver", delta: 5 },
        ],
      },
      {
        id: "sober_up",
        label: "Asst Driver gets him water — bad idea to lose a man to a cellar.",
        role: "asst_driver",
        outcomeText: "The water helps less than the company. He's operational by midnight. He owes the asst driver something unnamed.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 10 },
          { op: "mod_constitution", role: "asst_driver", delta: 5 },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  social_found_item: {
    id: "social_found_item",
    kind: "human_moment",
    atmosphere: "A child's toy in liberated dust. The war didn't ask permission to intrude.",
    stakesNote: "Keep it, bury it, or share it — the crew's conscience is on the table.",
    narrative:
      "In the back room of a liberated house, {ldr} finds something that doesn't belong to the war. A box. A photograph. A child's toy that survived things children shouldn't.",
    quote: '{ldr}: "Don\'t ask me why I picked it up. I don\'t know either."',
    useDice: false,
    choices: [
      {
        id: "keep_it",
        label: "He keeps it — call it a charm, call it cargo, call it whatever.",
        role: "loader",
        outcomeText: "The thing rides in his breast pocket. He doesn't explain it. Nobody asks. That's how crew works.",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 12 },
          { op: "journal", text: "Something found in a liberated house rides with the crew.", kind: "moment" },
        ],
      },
      {
        id: "leave_it",
        label: "Put it back — someone will come home to look for it.",
        role: "commander",
        outcomeText: "It stays on the shelf exactly where he found it. That sits better than he expected.",
        effects: [
          { op: "mod_all_constitution", delta: 5 },
          { op: "journal", text: "Left something behind in a liberated house.", kind: "moment" },
        ],
      },
      {
        id: "share_it",
        label: "Show the crew — let everyone hold it for a moment.",
        role: "asst_driver",
        outcomeText: "The photograph goes from hand to hand. Nobody speaks. It comes back to him and he puts it in his pocket anyway.",
        effects: [
          { op: "mod_all_constitution", delta: 9 },
          { op: "mod_constitution", role: "loader", delta: 6 },
          { op: "journal", text: "A photograph from a liberated house. Everyone held it once.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  social_new_arrival: {
    id: "social_new_arrival",
    kind: "human_moment",
    atmosphere: "A replacement who hasn't learned the crew's silences yet.",
    stakesNote: "Trust is earned fast or never — integrate, test, or keep distance.",
    narrative:
      "A replacement. Clean uniform, wrong boots for this road, face that hasn't decided what expression to keep. He has a name on his papers. The crew will give him a different one before the hour is out.",
    quote: '{cmd}: "What do they call you? No — what are we going to call you."',
    useDice: false,
    choices: [
      {
        id: "let_crew_name",
        label: "Commander lets it happen organically — the crew finds the name.",
        role: "commander",
        outcomeText: "Thirty seconds of observation and the gunner says it. The name sticks before the replacement can object. Welcome.",
        effects: [
          { op: "mod_all_constitution", delta: 8 },
          { op: "journal", text: "A replacement arrived. The crew named him before he could.", kind: "moment" },
        ],
      },
      {
        id: "ask_him",
        label: "Ask him what he wants to be called — give the kid something.",
        role: "loader",
        outcomeText: "He looks surprised. He gives them a name from back home. It fits well enough. That's rare.",
        effects: [
          { op: "mod_all_constitution", delta: 10 },
          { op: "journal", text: "A replacement arrived. He chose his own name.", kind: "moment" },
        ],
      },
      {
        id: "give_name",
        label: "Asst Driver already has the name ready — he was watching from when the truck stopped.",
        role: "asst_driver",
        outcomeText: "The asst driver points at the replacement's face: 'That's your name.' Nobody argues. The replacement nods like a man accepting a verdict.",
        effects: [
          { op: "mod_all_constitution", delta: 7 },
          { op: "mod_constitution", role: "asst_driver", delta: 6 },
          { op: "journal", text: "A replacement arrived. Asst Driver had the name waiting.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,

  social_dog_returns: {
    id: "social_dog_returns",
    kind: "human_moment",
    atmosphere: "Mud on paws. No owner. The war pauses for a heartbeat.",
    stakesNote: "The dog came back — feed, chase, or adopt the distraction.",
    narrative:
      "The dog. You last saw it during the foot section — it found you then and apparently it has not let go of that idea. It sits thirty meters from the tank, watching with the patience of something that has decided you are its people now.",
    quote: '{kid}: "I told you. I told you he\'d find us."',
    useDice: false,
    choices: [
      {
        id: "keep_him",
        label: "The dog stays — he earned it.",
        role: "commander",
        outcomeText: "He rides on the deck when the hatch is open. He's quiet during contact. He has opinions about rations. The crew votes him in unanimously and doesn't mention it.",
        effects: [
          { op: "mod_all_constitution", delta: 15 },
          { op: "journal", text: "The dog found the crew again. He stayed.", kind: "moment" },
          { op: "discovery_stub", id: "dog_returns" },
        ],
      },
      {
        id: "feed_send_off",
        label: "Feed him from your rations and send him on — it's better he's not near a tank.",
        role: "loader",
        outcomeText: "He takes what's offered and sits until the column moves. You don't look back. He's still sitting when you turn the corner. You feel it for a while.",
        effects: [
          { op: "mod_all_constitution", delta: 8 },
          { op: "mod_resource", key: "foodDays", delta: -1 },
          { op: "journal", text: "The dog found the crew again. They fed him and said goodbye.", kind: "moment" },
        ],
      },
      {
        id: "wave_him_in",
        label: "Asst Driver calls him over first — let the dog decide.",
        role: "asst_driver",
        outcomeText: "The dog comes without hesitation. The asst driver looks ridiculous for a moment. Then he just looks happy. That's fine too.",
        effects: [
          { op: "mod_all_constitution", delta: 12 },
          { op: "mod_constitution", role: "asst_driver", delta: 8 },
          { op: "journal", text: "The dog chose. Asst Driver called him and he came.", kind: "moment" },
        ],
      },
    ],
  } satisfies import("../engine/types").RuntimeEvent,


  // ── NPC Conversation Events ──────────────────────────────────────────────

  npc_local_woman: {
    id: "npc_local_woman",
    kind: "npc_conversation",
    atmosphere: "A bombed street with water still running from a broken pipe. And a woman standing beside a doorway holding a pitcher like things are normal.",
    narrative: "A civilian woman — French, Belgian, somewhere in the middle of the geography of this war — stands at the edge of a courtyard and offers water from a clay pitcher. She doesn't speak English. She doesn't need to. The gesture is clear.\n\nShe's been here through all of it. Before you, during, and probably after.",
    preChoiceNpc: { speaker: "The woman", line: "S'il vous plaît. Pour les soldats." },
    choices: [
      {
        id: "accept_graciously",
        label: "Accept graciously — bow, say thank you in whatever French you have.",
        role: "loader",
        dialogueLine: "Merci, madame. Merci beaucoup.",
        outcomeText: "The water is cold and tastes like the town used to. She watches the crew drink and something in her face is not quite a smile but is close enough to matter.",
        npcReply: "She refills the pitcher from somewhere and goes back inside. She didn't have to do that. She did it anyway.",
        effects: [
          { op: "mod_resource", key: "waterCanteens", delta: 1 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
      {
        id: "decline_politely",
        label: "Decline — she needs it more than you do.",
        role: "commander",
        dialogueLine: "Non, madame. Gardez-le. Merci.",
        outcomeText: "She hesitates, then withdraws into her doorway. The commander doesn't know if he made the right call. He made a call.",
        npcReply: "She watches until the crew moves on. Then closes the door.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: 5 },
        ],
      },
      {
        id: "ask_positions",
        label: "Gunner asks — through gesture — if she's seen German movement.",
        role: "gunner",
        dialogueLine: "Allemands? Par ici?",
        outcomeText: "She points east. Three fingers. She's been watching. She's been keeping count. The gunner marks the direction on his mental map.",
        npcReply: "She says something fast in French, then mimes a tank — hands like a low hull — and shakes her head. They're gone. For now.",
        effects: [
          { op: "mod_resource", key: "waterCanteens", delta: 1 },
          { op: "mod_all_constitution", delta: 3 },
          { op: "add_salvage", amount: 1 },
        ],
      },
    ],
  },

  npc_local_kids: {
    id: "npc_local_kids",
    kind: "npc_conversation",
    atmosphere: "The town is the kind of half-empty that happens when some people left and some people stayed. The ones who stayed have children.",
    narrative: "Two kids have materialized at the side of the road — there one moment and not there the previous one. They watch the crew with the total unself-consciousness of children who have seen enough soldiers that soldiers don't frighten them anymore. They might be eight. They might be older. This war ages things.",
    preChoiceNpc: { speaker: "The older one", line: "Chewing-gum? Chocolat?" },
    choices: [
      {
        id: "wave_and_roll",
        label: "Wave and keep rolling — not a stop you can afford.",
        role: "commander",
        dialogueLine: "Wave. Don't stop.",
        flavorOnly: true,
        outcomeText: "The crew waves. The kids wave back. The tank keeps moving. It's a small transaction but it's real.",
        effects: [],
      },
      {
        id: "slow_something",
        label: "Slow down — say something to them through the hatch.",
        role: "commander",
        dialogueLine: "Hey. Comment vous appelez-vous?",
        outcomeText: "The older one says his name. The younger one says something that might be a name or might be a complaint about the older one. The commander repeats the name back. The kid corrects his pronunciation. They're laughing by the time the tank moves again.",
        npcReply: "They run alongside for half a block before peeling off. The older one shouts something that sounds like it might be a joke in French.",
        effects: [
          { op: "mod_all_constitution", delta: 5 },
          { op: "journal", text: "Two kids at the roadside. The older one laughed at my French.", kind: "moment" },
        ],
      },
      {
        id: "ration_gift",
        label: "Driver passes them a ration from the hatch — chocolate if there is any.",
        role: "driver",
        dialogueLine: "Here. Take it.",
        outcomeText: "The chocolate lands in the older kid's hands and both of them look at it like it's something religious. The driver gets back in his seat feeling like a human being, which is rarer than it sounds.",
        npcReply: "They're already running away with it before the hatch closes. The younger one waves without looking back.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: -1 },
          { op: "mod_constitution", role: "driver", delta: 8 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },

  npc_officer_orders: {
    id: "npc_officer_orders",
    kind: "npc_conversation",
    atmosphere: "Before an engagement everything is too quiet and too loud at the same time. Then a staff officer rides up.",
    narrative: "A staff officer on a horse — actually a horse, in 1944, as if the cavalry hasn't gotten the memo — reins up beside the column before the line of departure. He has orders. He has opinions about them. He has a look that says he didn't sleep and wasn't expecting to.",
    preChoiceNpc: { speaker: "Maj. Stafford", line: "Listen carefully. Command has revised the axis of advance. You are now the rightmost element. The left flank is infantry. Do not wait for them." },
    choices: [
      {
        id: "yes_sir",
        label: "\"Yes sir, understood. We'll move on your mark.\"",
        role: "commander",
        dialogueLine: "Yes sir, understood. Rightmost element, don't wait for infantry. We'll move on your signal.",
        flavorOnly: true,
        outcomeText: "The officer nods and wheels the horse. The crew has their orders. Orders are a kind of certainty, even when they aren't.",
        effects: [],
      },
      {
        id: "adjust_approach",
        label: "\"Request permission to adjust — the right approach has an exposed ridge.\"",
        role: "commander",
        dialogueLine: "Sir, the rightmost approach crosses an exposed ridgeline at grid 447. Request we lead with smoke.",
        outcomeText: "The major checks the map. He doesn't say good catch. He says adjust approved, then turns and rides back down the column. That's good catch in officer.",
        npcReply: "\"Make it work. You've got five minutes before the artillery window opens.\"",
        effects: [
          { op: "mod_all_constitution", delta: 4 },
          { op: "add_salvage", amount: 1 },
        ],
      },
      {
        id: "ask_ridge",
        label: "\"What's your read on that ridge at 447, sir?\"",
        role: "gunner",
        dialogueLine: "Major — the ridge at grid 447, do we have any eyes on it?",
        outcomeText: "He looks at the gunner like men of his rank sometimes look at men who ask the right questions. Then he answers it. That's the whole exchange. Worth every second.",
        npcReply: "\"Recce came back clean two hours ago. That's all I have. Trust it or don't.\"",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: 5 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },

  npc_replacement_depot: {
    id: "npc_replacement_depot",
    kind: "npc_conversation",
    atmosphere: "Between missions the supply depot is where the war does its paperwork. It smells like diesel and forms in triplicate.",
    narrative: "A supply sergeant behind a table of crates has the look of a man who has processed ten thousand requisitions and is profoundly unimpressed by need. He has what you need — probably — in the crates behind him that he's technically not supposed to have.",
    preChoiceNpc: { speaker: "S/Sgt. Kowalski", line: "Unit, requisition number, and don't tell me you lost the carbon copy." },
    choices: [
      {
        id: "thank_leave",
        label: "Take what you're owed and leave without pressing your luck.",
        role: "commander",
        dialogueLine: "We'll take what's allocated and sign for it. Keep it simple.",
        outcomeText: "Simple works. You get what's owed, he gets his clipboard back, and nobody argues about the difference. That's a successful transaction in wartime.",
        npcReply: "\"Next.\" He's already looking past you.",
        effects: [
          { op: "mod_resource", key: "medkits", delta: 1 },
          { op: "add_salvage", amount: 1 },
        ],
      },
      {
        id: "press_ammo",
        label: "Ask — respectfully but directly — about extra AP rounds.",
        role: "loader",
        dialogueLine: "Sergeant — we burned through most of our AP at the bridge. Anything in those crates behind you?",
        outcomeText: "He looks at the crates. Looks at you. Looks at the crates. Does some arithmetic the army didn't teach him. Opens one crate. Doesn't say anything about it.",
        npcReply: "\"Sign here. And here. And here on the carbon copy you don't have, so I'll just write 'attached'.\"",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 4 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "ask_unit_ahead",
        label: "Ask what happened to the unit ahead of you.",
        role: "commander",
        dialogueLine: "What can you tell me about the 12th Armored that came through two days ago?",
        outcomeText: "He sets the clipboard down. That's not a good sign. What he tells you is operational. What he doesn't tell you is in his face and that's enough.",
        npcReply: "\"Heavy losses. Medic tells me at least thirty percent. Don't ask me anything else because I'll say I didn't hear the question.\"",
        effects: [
          { op: "mod_constitution", role: "commander", delta: -4 },
          { op: "mod_all_constitution", delta: -2 },
          { op: "journal", text: "The 12th Armored took heavy losses ahead of us.", kind: "discovery" },
        ],
      },
    ],
  },

  npc_other_crew: {
    id: "npc_other_crew",
    kind: "npc_conversation",
    atmosphere: "Another tank at rest in a farmyard. Different markings, same mud. Different war, same war.",
    narrative: "A crew from a different company — different unit patch, same thousand-yard look — has their tank parked in the shade of a half-standing barn. Their commander is eating something out of a tin and watching the column move past without much interest. Then his eyes catch yours and he nods.",
    preChoiceNpc: { speaker: "Other crew commander", line: "What unit? We've been trying to get a picture of who's where." },
    choices: [
      {
        id: "trade_rumors",
        label: "Trade what you've heard — both sides benefit.",
        role: "commander",
        dialogueLine: "We're 3rd Armored. We came through the river crossing at Pont-Neuf. What are you seeing east of here?",
        outcomeText: "He has something you don't and you have something he doesn't. The trade takes five minutes and is worth more than either side's individual share.",
        npcReply: "\"Stay off the main road past the factory. They had a 75 dug in there yesterday morning. Might be gone, might not be.\"",
        effects: [
          { op: "mod_all_constitution", delta: 3 },
          { op: "add_salvage", amount: 2 },
        ],
      },
      {
        id: "ask_what_seen",
        label: "Ask what they've seen — more useful than anything on the map.",
        role: "gunner",
        dialogueLine: "We've been following a map that's two days old. What does the ground actually look like?",
        outcomeText: "The other crew's gunner stands up from somewhere behind the tank and joins the conversation. Two gunners talking about terrain is worth a battalion briefing.",
        npcReply: "\"Soft ground on the left flank. You'll bog if you go off road. The right has better drainage but there's a ditch that'll swallow a track if you don't see it.\"",
        effects: [
          { op: "mod_all_constitution", delta: 5 },
        ],
      },
      {
        id: "share_rations",
        label: "Offer to share rations — they look like they haven't eaten.",
        role: "loader",
        dialogueLine: "We've got extra. Nothing fancy. You want some?",
        outcomeText: "They do. They didn't say they did but they do. The rations disappear in about three minutes and the other commander shakes your loader's hand in a way that means more than rations.",
        npcReply: "\"We'll remember that. If you're ever east of Aachen ask for Bravo-2. That's us.\"",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: -1 },
          { op: "mod_all_constitution", delta: 6 },
          { op: "mod_constitution", role: "loader", delta: 5 },
        ],
      },
    ],
  },

  npc_medic_check: {
    id: "npc_medic_check",
    kind: "npc_conversation",
    atmosphere: "Between missions. A medic doing the rounds. The kind of professional optimism that means he's seen the alternative.",
    narrative: "A field medic works his way down the column with a kit bag and the careful eyes of someone whose job is to see what people are hiding. He stops at your tank. He looks at the crew the way doctors look at patients — which is to say, briefly and accurately.",
    preChoiceNpc: { speaker: "Medic Pvt. Torres", line: "Everyone functional? Anyone hiding something I'm going to hear about later?" },
    choices: [
      {
        id: "let_him_check",
        label: "Let him check the whole crew — no arguments.",
        role: "commander",
        dialogueLine: "Check everyone. All of them.",
        outcomeText: "He finds three things. None of them are emergencies. All of them are better addressed now than later. He patches what he can and makes notes on the rest.",
        npcReply: "\"The loader's got shrapnel in his left hand that's going to be a problem in about a week. Tell him.\"",
        effects: [
          { op: "mod_all_constitution", delta: 5 },
          { op: "mod_resource", key: "medkits", delta: -1 },
        ],
      },
      {
        id: "wave_off",
        label: "Wave him off — everyone's fine, keep moving.",
        role: "commander",
        dialogueLine: "We're good. No casualties, no issues.",
        flavorOnly: true,
        outcomeText: "He looks at the crew with the neutral expression of a man who has heard \"we're fine\" before. He moves on. Maybe you're right. Maybe you'll find out.",
        effects: [],
      },
      {
        id: "ask_crewman",
        label: "Ask him specifically about the crew member who's been quiet.",
        role: "commander",
        dialogueLine: "My loader — he took a knock last week. I'd like your read on him.",
        outcomeText: "Torres sits the loader down and spends five minutes on him. The diagnosis is fatigue compounded by a mild concussion and the specific damage of not having acknowledged it. He prescribes rest, which is the one thing available.",
        npcReply: "\"He's functional. He'll stay functional if you watch him. Let him sleep when you can.\"",
        effects: [
          { op: "mod_constitution", role: "loader", delta: 8 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },

  npc_war_correspondent: {
    id: "npc_war_correspondent",
    kind: "npc_conversation",
    atmosphere: "After an engagement. The smoke hasn't cleared and there's a man in a correspondent's jacket with a notebook. War has a press corps.",
    narrative: "A journalist with a notebook and the practiced manner of someone who has asked the same question in many dangerous places catches up to the tank after the last contact. He has a press badge and the specific kind of energy of a man who is both brave and unqualified to assess risk.",
    preChoiceNpc: { speaker: "Correspondent", line: "Tank commander — what happened back there? The readers want to know what armor combat looks like up close." },
    choices: [
      {
        id: "honest_story",
        label: "Give him the honest story — no heroics, just what happened.",
        role: "commander",
        dialogueLine: "It was loud and fast and I don't know if we did the right thing or just the possible thing. That's usually what it is.",
        outcomeText: "He writes it down. Not what he was hoping for, maybe. But he writes it down. It's the kind of quote that gets cut by editors and remembered by the man who heard it.",
        npcReply: "\"That's the most honest thing anyone's told me in six months. I'll see what I can do with it.\"",
        effects: [
          { op: "mod_constitution", role: "commander", delta: 6 },
          { op: "journal", text: "Talked to a correspondent after the engagement. Told him what it actually was.", kind: "moment" },
        ],
      },
      {
        id: "official_version",
        label: "Give him the official version — professional, appropriate, useful to morale.",
        role: "commander",
        dialogueLine: "We engaged and neutralized a threat to the advance. The crew performed well. That's the story.",
        flavorOnly: true,
        outcomeText: "He writes it all down and thanks you. That version will go home in a newspaper. It is not wrong. It is not the whole story. Both of those things are true.",
        effects: [],
      },
      {
        id: "refuse",
        label: "Refuse entirely — nothing to say, not the right time.",
        role: "commander",
        dialogueLine: "No comment. Move on.",
        outcomeText: "He closes the notebook. Some crews don't talk. He understands. He moves on to the next tank and asks the same question and gets a different answer.",
        npcReply: "He nods and moves off without complaint. A journalist who understands no is rarer than you'd think.",
        effects: [
          { op: "mod_constitution", role: "commander", delta: 3 },
        ],
      },
    ],
  },

  npc_prisoner_moment: {
    id: "npc_prisoner_moment",
    kind: "npc_conversation",
    atmosphere: "After infantry contact. There's a man standing in a field with his hands raised and the specific expression of someone who has made the most important decision of his life.",
    narrative: "He came out of a ditch with his hands already up — no weapons visible, uniform muddy, young. He is a German soldier. He is also a person. Both of those things are true at the same time and that's what makes this complicated.",
    preChoiceNpc: { speaker: "German soldier", line: "Nicht schiessen. Bitte. Ich ergebe mich." },
    choices: [
      {
        id: "let_through",
        label: "Wave him toward the rear — prisoners go to infantry, not armor.",
        role: "commander",
        dialogueLine: "Go. That way. Gehen Sie. Schnell.",
        flavorOnly: true,
        outcomeText: "He understands the gesture. He goes. Behind him the field is empty and quiet in the particular way that happens after someone isn't there anymore.",
        effects: [],
      },
      {
        id: "gesture_question",
        label: "Ask him something through gesture — others, weapons, position.",
        role: "gunner",
        dialogueLine: "Andere Soldaten? Wie viele?",
        outcomeText: "He shows three fingers, then points east, then shakes his head. Three. Somewhere east. Gone or not, he doesn't know. The gunner marks it and waves him back.",
        npcReply: "\"Danke.\" He says it quietly. He means it.",
        effects: [
          { op: "add_salvage", amount: 1 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "human_moment",
        label: "Give him water before sending him back.",
        role: "loader",
        dialogueLine: "Here. Water. Wasser.",
        outcomeText: "He takes it with both hands. Drinks. Hands it back. The loader nods. He nods back. That's the whole exchange. It has no strategic value whatsoever.",
        npcReply: "He walks toward the rear in a straight line, hands still partially raised. The loader watches until he's small.",
        effects: [
          { op: "mod_resource", key: "waterCanteens", delta: -1 },
          { op: "mod_all_constitution", delta: 5 },
          { op: "mod_constitution", role: "loader", delta: 6 },
        ],
      },
    ],
  },

  npc_padre_field: {
    id: "npc_padre_field",
    kind: "npc_conversation",
    atmosphere: "R&R. A different chaplain than you've seen before — older, walking the line with a quiet that's earned, not performed.",
    narrative: "An army chaplain makes his way along the vehicle line, stopping briefly at each tank. He's not performing faith at people — he's just moving through, available. When he reaches yours he looks at the crew the way a person looks at people, which is already different from how most of this works.",
    preChoiceNpc: { speaker: "Chaplain", line: "Don't get up. I'm just walking. Is there anything you need?" },
    choices: [
      {
        id: "talk_briefly",
        label: "Talk briefly — nothing heavy, just conversation.",
        role: "commander",
        dialogueLine: "Sit down if you want. We've got coffee. Approximation of coffee.",
        flavorOnly: true,
        outcomeText: "He sits on the hull for ten minutes. He mostly listens. He says something at the end that isn't a verse or a platitude, just an observation. It stays with you.",
        effects: [],
      },
      {
        id: "ask_personal",
        label: "Ask him something you've been carrying — nothing he can answer, but ask.",
        role: "commander",
        dialogueLine: "How do you make sense of it? All of it.",
        outcomeText: "He's quiet for long enough that you think he's going to give you an answer. Instead he says he doesn't, that he's been asking the same question since North Africa, and that he finds asking it useful even without the answer.",
        npcReply: "\"The question keeps you a person. That's not nothing.\"",
        effects: [
          { op: "mod_constitution", role: "commander", delta: 7 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
      {
        id: "offer_seat",
        label: "Offer him a seat and just let him stay awhile.",
        role: "loader",
        dialogueLine: "You can sit up here if you want. Better view. Not that there's much to see.",
        outcomeText: "He sits on the hull for twenty minutes. At some point the crew realizes nobody's talking and nobody minds. He leaves when he's ready. The tank feels slightly larger afterward.",
        npcReply: "\"Thank you for the company.\" He means the crew. He means the silence. He means all of it.",
        effects: [
          { op: "mod_all_constitution", delta: 8 },
          { op: "mod_constitution", role: "loader", delta: 5 },
        ],
      },
    ],
  },

  npc_old_farmer: {
    id: "npc_old_farmer",
    kind: "npc_conversation",
    atmosphere: "Farmland that was working before the war and will be working after. The man standing at the edge of his field has outlasted armies before.",
    narrative: "An older farmer watches the column pass from the edge of a furrowed field. He's not afraid. He's seen enough of this to have made his peace with what armies do to land and to men, and he's still standing in his field which means something.",
    preChoiceNpc: { speaker: "The farmer", line: "He watches. He doesn't wave. He watches the way people watch weather." },
    choices: [
      {
        id: "nod_pass",
        label: "Nod as you pass — acknowledge him without stopping.",
        role: "commander",
        dialogueLine: "Nod. Keep rolling.",
        flavorOnly: true,
        outcomeText: "He nods back. One acknowledging glance exchanged between a man going somewhere and a man staying put. That's the whole conversation and it says what it needs to.",
        effects: [],
      },
      {
        id: "stop_acknowledge",
        label: "Stop briefly — say something, acknowledge what his land has been through.",
        role: "commander",
        dialogueLine: "Bonjour. Nous passons seulement. Merci de nous laisser passer.",
        outcomeText: "He's quiet for a moment. Then he says something in a dialect that doesn't translate exactly. The driver thinks it means 'don't break the fence posts.' The commander thinks it might mean something else. Either way it's not hostile.",
        npcReply: "He gestures at the field — the churned mud and tank tracks — and shrugs. He's seen worse. He'll fix it.",
        effects: [
          { op: "mod_all_constitution", delta: 4 },
          { op: "journal", text: "An old farmer at the edge of a field. Still there.", kind: "moment" },
        ],
      },
      {
        id: "cigarette",
        label: "Driver offers him a cigarette through the hatch.",
        role: "driver",
        dialogueLine: "Here, old man. For the trouble.",
        outcomeText: "He accepts it. He doesn't move toward the tank — he waits, and the driver stretches out a little further to bridge the gap. It's a good cigarette. He looks at it like it's a good cigarette.",
        npcReply: "He lights it with a match from his jacket, takes one draw, and goes back to watching the column. He doesn't wave. He doesn't need to.",
        effects: [
          { op: "mod_constitution", role: "driver", delta: 6 },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
    ],
  },

  legendary_sergeant_york_moment: {
    id: "legendary_sergeant_york_moment",
    kind: "npc_conversation",
    atmosphere: "A lull in the column. A man in a different cut of uniform is studying a map like it owes him money.",
    narrative:
      "A sergeant from another division — the kind of soldier stories get written about later — asks which way the road to the next battalion net is.\n\nHe's polite. He's tired. He looks at your tank the way men look at machines that still work.",
    stakes: "critical",
    stakesNote: "A named soldier on the road — what you say and what you give may matter more than the map.",
    preChoiceNpc: {
      speaker: "Sgt. York (passing through)",
      line: "You boys headed east? We're supposed to link at the next crossroads. Any word from that direction?",
    },
    choices: [
      {
        id: "share_intel",
        label: "Share what you know — grid, contact, timing.",
        role: "commander",
        dialogueLine: "East's hot until 1600. Crossroads at grid 512 — hold there, don't push past without arty.",
        outcomeText: "He listens like a man who files everything. When you're done he folds the map and nods once.",
        npcReply: "\"Much obliged. We'll be the ones you hear about if it goes wrong.\"",
        effects: [
          { op: "mod_all_constitution", delta: 6 },
          { op: "add_salvage", amount: 2 },
          { op: "discovery_stub", id: "alvin_york_names" },
          { op: "journal", text: "A sergeant the papers will write about passed through. You gave him the truth.", kind: "moment" },
        ],
      },
      {
        id: "rations",
        label: "Loader passes a ration tin — no questions.",
        role: "loader",
        dialogueLine: "Take it. We're not hungry enough to be heroes about food.",
        outcomeText: "He takes the tin without ceremony. Some debts on the road never get repaid in kind.",
        npcReply: "\"God bless you.\" He means it like a man who still believes words work.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: -1 },
          { op: "mod_all_constitution", delta: 8 },
        ],
      },
      {
        id: "move_on",
        label: "Keep rolling — no time for detours.",
        role: "driver",
        dialogueLine: "Can't help you, Sergeant. We've got a schedule and it's already bleeding.",
        flavorOnly: true,
        outcomeText: "He steps back from the treads. The column moves. You don't look back long enough to see if he finds his way.",
        effects: [],
      },
    ],
  },

});

/** On-foot beat order after brew-up (§8.2). */
export const FOOT_BEAT_IDS: string[] = [
  "foot_woods",
  "foot_fields",
  "foot_lines",
  "foot_bridge",
  "foot_sniper",
  "foot_farm",
  "foot_checkpoint",
  "foot_ditch",
  "foot_dog",
  "foot_gate",
];

/**
 * Maps seeded flag → follow-up event id to inject into the next mission.
 * The generator reads this when building missions and when advancing between them.
 */
export const SEEDED_FOLLOW_UPS: Record<string, string> = {
  rhine_crossing_logistics: "followup_rhine_logistics",
  huertgen_survived: "followup_huertgen_shell",
  bulge_held_junction: "followup_bulge_survivor",
};

export const GENERIC_POOL: string[] = [
  "gen_travel_fork",
  "gen_travel_mine",
  "gen_travel_bridge_down",
  "gen_human_letters",
  "gen_human_watch",
  "gen_combat_tiger_lite",
  "gen_combat_panther",
  "gen_combat_pak",
  "gen_combat_heat_round",
  "gen_combat_mortar",
  "gen_infantry_treeline",
  "gen_infantry_cellar",
  "gen_rest_coffee",
  "gen_rest_smoke",
  "gen_supply_risk",
  "gen_supply_black_market",
  "gen_defensive_wave",
  "gen_defensive_flare",
  "gen_offensive_push",
  "gen_cmd_crossing",
  "gen_officer_roadblock",
  "gen_radio_squeal",
  "gen_loader_shell_stuck",
  "gen_asst_periscope",
  "gen_injury_scar",
  "elite_night_ambush_stub",
  "elite_stug_nest",
  "elite_konkurs_column",
  "elite_remagen",
  "elite_tiger_wallendorf",
  "npc_local_woman",
  "npc_local_kids",
  "npc_officer_orders",
  "npc_replacement_depot",
  "npc_other_crew",
  "npc_medic_check",
  "npc_war_correspondent",
  "npc_prisoner_moment",
  "npc_padre_field",
  "npc_old_farmer",
  "legendary_sergeant_york_moment",
];

patchEventCatalogImmersion(EVENT_CATALOG);
