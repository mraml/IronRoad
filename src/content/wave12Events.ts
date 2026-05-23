import type { RuntimeEvent } from "../engine/types";

/** Wave 12 — encounter pool expansion (§2.9). Merged into EVENT_CATALOG at load. */
export const WAVE12_EVENTS: Record<string, RuntimeEvent> = {
  gen_travel_checkpoint_abandoned: {
    id: "gen_travel_checkpoint_abandoned",
    kind: "travel",
    atmosphere: "Sandbags slumped like tired shoulders. Nobody home except the wind.",
    narrative:
      "An abandoned checkpoint straddles the road — sandbags, a flipped table, a helmet on a post that nobody retrieved.\n\nThe column slows. Someone already looted the useful parts. What's left is a question about who was here and why they left in a hurry.",
    choices: [
      {
        id: "search",
        label: "Loader searches the bunker — might be maps or rations.",
        role: "loader",
        outcomeText: "A stained map and half a K-ration. Not much, but not nothing.",
        effects: [{ op: "add_salvage", amount: 1 }, { op: "mod_resource", key: "foodDays", delta: 1 }],
      },
      {
        id: "drive_through",
        label: "Driver rolls through — don't linger on ghosts.",
        role: "driver",
        outcomeText: "The tank doesn't stop. The checkpoint slides past like a bad dream you chose not to have.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 3 }],
      },
      {
        id: "mark_grid",
        label: "Commander marks the grid for Regiment — intel matters.",
        role: "commander",
        outcomeText: "You radio the coordinates. Some clerk will file it. Maybe someone lives because you bothered.",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
    ],
  },
  gen_travel_convoy_pass: {
    id: "gen_travel_convoy_pass",
    kind: "travel",
    atmosphere: "Dust first. Engines second. The war moving in one direction.",
    narrative:
      "A truck convoy passes the other way — quartermaster, ambulances, a priest in a jeep that looks too clean.\n\nThey don't stop. Nobody ever stops unless they have to. You get a hand signal and a cloud of diesel and then they're gone.",
    choices: [
      {
        id: "wave_down",
        label: "Commander flags them — any word from ahead?",
        role: "commander",
        dialogueLine: "Hold up — what's the road like past the next ridge?",
        outcomeText: "The driver of the lead truck shouts something about mud and a blown bridge. Useful. Late.",
        effects: [{ op: "mod_all_constitution", delta: 4 }],
      },
      {
        id: "trade",
        label: "Loader trades two mags for a carton of cigarettes.",
        role: "loader",
        outcomeText: "Fair trade by war's math. The carton disappears into the hull before anyone with stripes notices.",
        effects: [
          { op: "mod_resource", key: "smallArmsMags", delta: -2 },
          { op: "mod_all_constitution", delta: 6 },
        ],
      },
      {
        id: "let_pass",
        label: "Keep rolling — their hurry isn't yours.",
        role: "driver",
        outcomeText: "You pull aside, let the column boil past, merge back into your own silence.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 2 }],
      },
    ],
  },
  gen_travel_bogged_soft: {
    id: "gen_travel_bogged_soft",
    kind: "travel",
    atmosphere: "The ground sucks at steel. Spring in France is a traitor.",
    narrative:
      "Soft shoulder. The right track spins once, twice, and then the tank sits wrong — not stuck, not free.\n\nThe column is behind you. The map says this was a road yesterday.",
    choices: [
      {
        id: "winch",
        label: "Asst driver rigs a tow from the following tank.",
        role: "asst_driver",
        outcomeText: "Cable taut. Mud protests. The hull lurches forward with a sound like defeat reversed.",
        effects: [
          { op: "set_component", component: "track_right", status: "damaged" },
          { op: "mod_all_constitution", delta: 3 },
        ],
      },
      {
        id: "rock",
        label: "Loader stones the track path — old trick, still works.",
        role: "loader",
        outcomeText: "Twenty minutes of ugly work. You move. The crew's backs remember it.",
        effects: [{ op: "mod_constitution", role: "loader", delta: -5 }, { op: "mod_all_constitution", delta: 2 }],
      },
      {
        id: "bypass",
        label: "Driver backs out and finds harder ground.",
        role: "driver",
        outcomeText: "Wide arc through a field. The farmer, if he's watching, will hate you. You're past before he decides.",
        effects: [{ op: "mod_resource", key: "foodDays", delta: -1 }],
      },
    ],
  },
  gen_travel_crossroads_smoke: {
    id: "gen_travel_crossroads_smoke",
    kind: "travel",
    atmosphere: "Smoke at a crossroads means someone wanted obscurity or someone is burning.",
    narrative:
      "Grey smoke drifts across the intersection. Could be a cooking fire. Could be a demolition team. Could be both.\n\nThe gunner has the cupola hatch cracked. The driver has the clutch in.",
    choices: [
      {
        id: "halt_observe",
        label: "Halt fifty meters — gunner scans before commit.",
        role: "gunner",
        outcomeText: "Cooking fire. Three figures. They scatter when they see you. No shots. Small mercy.",
        effects: [{ op: "mod_constitution", role: "gunner", delta: 4 }],
      },
      {
        id: "wp_screen",
        label: "WP screen and punch through — don't gift them a target.",
        role: "commander",
        outcomeText: "White phosphorus turns the crossroads into a question mark. You're through before it answers.",
        effects: [
          { op: "spend_ammo", ammo: "WP", amount: 1 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "detour",
        label: "Driver takes the farm track — longer, quieter.",
        role: "driver",
        outcomeText: "The farm track costs time and paint. It does not cost blood. Today that counts as winning.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -3 }, { op: "mod_all_constitution", delta: 3 }],
      },
    ],
  },
  gen_travel_rubble_choke: {
    id: "gen_travel_rubble_choke",
    kind: "travel",
    atmosphere: "Brick dust in the treads. The town is a throat that's closed.",
    narrative:
      "Rubble chokes the main street — a collapsed façade, a tram line nobody will ride again.\n\nThe tank can bull through or the crew can clear on foot. Neither option is clean.",
    choices: [
      {
        id: "push",
        label: "Driver pushes rubble — hull as bulldozer.",
        role: "driver",
        outcomeText: "Stone screams on steel. You gain the far side. The front armor will remember.",
        effects: [{ op: "mod_tank_health", delta: -6 }, { op: "mod_constitution", role: "driver", delta: -4 }],
      },
      {
        id: "clear",
        label: "Crew dismounts and clears a foot path.",
        role: "loader",
        outcomeText: "An hour of hands and backs. The tank squeezes through like a guilty thought.",
        effects: [
          { op: "mod_all_constitution", delta: -5 },
          { op: "mod_constitution", role: "loader", delta: 3 },
        ],
      },
      {
        id: "alternate",
        label: "Commander finds the alley map — alternate route.",
        role: "commander",
        outcomeText: "The alley is tight. It's also empty. You slide through with inches to spare and nerves to burn.",
        effects: [{ op: "mod_constitution", role: "commander", delta: -3 }, { op: "add_salvage", amount: 1 }],
      },
    ],
  },
  gen_travel_night_halt: {
    id: "gen_travel_night_halt",
    kind: "travel",
    atmosphere: "Dark so complete the stars feel like enemy observation.",
    narrative:
      "Night halt. Engines off. The crew listens to a country that might still be hostile.\n\nSomeone eats. Someone watches. Nobody sleeps the way civilians sleep.",
    choices: [
      {
        id: "double_watch",
        label: "Gunner and asst driver split watch — no surprises.",
        role: "gunner",
        outcomeText: "Nothing comes. The nothing still costs sleep. Dawn finds you hollow and alive.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -6 },
          { op: "mod_constitution", role: "asst_driver", delta: -5 },
          { op: "mod_all_constitution", delta: 4 },
        ],
      },
      {
        id: "blackout",
        label: "Commander orders full blackout — cold camp.",
        role: "commander",
        outcomeText: "No fires. No lights. The cold sits in the bones. So does the safety.",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
      {
        id: "move_on",
        label: "Driver pushes a few more klicks — hate sitting still.",
        role: "driver",
        outcomeText: "You roll until fuel says stop. The halt comes in a better ditch. Small victories.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -4 }, { op: "mod_all_constitution", delta: 1 }],
      },
    ],
  },
  gen_human_photo_wall: {
    id: "gen_human_photo_wall",
    kind: "human_moment",
    atmosphere: "Faces on a wall. Smiles from before anyone learned what a Tiger sounds like.",
    narrative:
      "A nail in plaster holds a cluster of photographs — weddings, babies, a dog that probably didn't survive the shelling.\n\nThe loader stares longer than he means to.",
    choices: [
      {
        id: "leave",
        label: "Leave them — not yours to carry.",
        role: "commander",
        outcomeText: "You move on. The wall stays. It will stay longer than you.",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "pocket_one",
        label: "Loader pockets one photo — he'll explain later.",
        role: "loader",
        outcomeText: "Paper in a breast pocket. Weightless. Heavy.",
        effects: [{ op: "mod_constitution", role: "loader", delta: 8 }],
      },
      {
        id: "cover",
        label: "Asst driver covers them with a blanket from the hull.",
        role: "asst_driver",
        outcomeText: "Not burial. Not quite. The gesture sits in the crew's silence all afternoon.",
        effects: [{ op: "mod_all_constitution", delta: 6 }],
      },
    ],
  },
  gen_human_piano_key: {
    id: "gen_human_piano_key",
    kind: "human_moment",
    atmosphere: "A piano key under boot leather. Someone's parlor leaked into the road.",
    narrative:
      "The house is open. A single key lies in the street like a tooth.\n\nThe kid asks if anyone can still play. The veteran says nobody should.",
    choices: [
      {
        id: "play",
        label: "Loader taps one note inside — thirty seconds.",
        role: "loader",
        outcomeText: "One note. Wrong and perfect. The crew listens like men at a funeral who still believe in music.",
        effects: [{ op: "mod_all_constitution", delta: 10 }, { op: "mod_constitution", role: "loader", delta: -3 }],
      },
      {
        id: "silence",
        label: "Commander shuts the door — move on.",
        role: "commander",
        outcomeText: "The door closes on a world that isn't yours to fix.",
        effects: [{ op: "mod_constitution", role: "commander", delta: -2 }],
      },
      {
        id: "salvage_wire",
        label: "Gunner takes piano wire for a sight repair.",
        role: "gunner",
        outcomeText: "Practical theft. The wire works. The crew doesn't talk about the cost.",
        effects: [{ op: "add_salvage", amount: 2 }, { op: "mod_constitution", role: "gunner", delta: -4 }],
      },
    ],
  },
  gen_human_wounded_horse: {
    id: "gen_human_wounded_horse",
    kind: "human_moment",
    atmosphere: "A horse screams the way machines cannot — raw and offended by pain.",
    narrative:
      "A draft horse in the ditch, flank opened by shrapnel. It tries to stand and cannot.\n\nThe faithful one goes quiet. The pragmatist already knows the answer.",
    choices: [
      {
        id: "end_it",
        label: "Gunner ends it — one shot, merciful.",
        role: "gunner",
        outcomeText: "One shot. The sound stops. The silence after is worse and better.",
        effects: [
          { op: "mod_constitution", role: "gunner", delta: -8 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "walk_away",
        label: "Drive on — can't fix everything.",
        role: "driver",
        outcomeText: "The tank moves. The horse sound fades. It doesn't leave the crew entirely.",
        effects: [{ op: "mod_all_constitution", delta: -4 }],
      },
      {
        id: "water",
        label: "Loader gives it water and moves on.",
        role: "loader",
        outcomeText: "Water. A pat on the neck. You leave anyway. Some kindness is incomplete.",
        effects: [
          { op: "mod_resource", key: "waterCanteens", delta: -1 },
          { op: "mod_constitution", role: "loader", delta: 5 },
        ],
      },
    ],
  },
  npc_engineer_bridge: {
    id: "npc_engineer_bridge",
    kind: "npc_conversation",
    atmosphere: "Timber and sweat. Engineers treat time like another material to shape.",
    narrative:
      "Combat engineers on a side road — they're shoring a culvert before the column drowns in mud.\n\nThe sergeant in charge has hands like shovels and patience like stone.",
    preChoiceNpc: { speaker: "Engineer Sgt.", line: "You heavies want this culvert or you want to swim? Give me ten minutes or give me a hand." },
    choices: [
      {
        id: "help",
        label: "Loader and asst driver help — ten minutes costs ten minutes.",
        role: "loader",
        dialogueLine: "We'll lend backs. You lend passage.",
        outcomeText: "Timber settles. The sergeant nods once — high praise from a man who doesn't spend words.",
        npcReply: "\"You're through. Try not to collapse it on the way out.\"",
        effects: [{ op: "mod_all_constitution", delta: 4 }, { op: "add_salvage", amount: 1 }],
      },
      {
        id: "wait",
        label: "Wait it out — commander radios rear about delay.",
        role: "commander",
        dialogueLine: "We hold. Tell Regiment the road's catching its breath.",
        outcomeText: "Delay logged. The culvert holds. The schedule doesn't.",
        npcReply: "\"Smart. Rushing this kills more than Germans.\"",
        effects: [{ op: "mod_constitution", role: "commander", delta: 3 }],
      },
      {
        id: "detour",
        label: "Driver finds a field bypass — risky but moving.",
        role: "driver",
        dialogueLine: "We'll take the field. You keep the culvert.",
        outcomeText: "The field is soft but passable. The engineers wave you off like a bad idea that worked.",
        effects: [{ op: "mod_tank_health", delta: -4 }],
      },
    ],
  },
  npc_refugee_family: {
    id: "npc_refugee_family",
    kind: "npc_conversation",
    atmosphere: "A cart and a blanket and everything they couldn't carry.",
    narrative:
      "A family on the verge of the road — father, mother, two children who stare at the tank like it is weather.\n\nThey are moving west. You are moving east. The war is directions.",
    preChoiceNpc: { speaker: "Father (French)", line: "Please — is the next village burning or only the last one?" },
    choices: [
      {
        id: "truth",
        label: "Commander tells the truth — short, no comfort.",
        role: "commander",
        dialogueLine: "The last one burned. The next one might. Go west. Don't stop on the road.",
        outcomeText: "He nods like a man who already knew. They push the cart faster.",
        npcReply: "\"Merci. God watch your treads.\"",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
      {
        id: "rations",
        label: "Loader gives a day's rations from the hull.",
        role: "loader",
        dialogueLine: "Take this. Hide it. Don't let anyone see you with American food.",
        outcomeText: "Hands take the tin like sacrament. The cart turns. You feel briefly human.",
        effects: [
          { op: "mod_resource", key: "foodDays", delta: -1 },
          { op: "mod_all_constitution", delta: 8 },
        ],
      },
      {
        id: "move",
        label: "Driver rolls slow — don't dust them.",
        role: "driver",
        dialogueLine: "We'll pass quiet. Keep the children off the verge.",
        outcomeText: "Low gear. Minimum dust. The family disappears behind a hedge. The war continues.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 4 }],
      },
    ],
  },
  npc_cook_truck: {
    id: "npc_cook_truck",
    kind: "npc_conversation",
    atmosphere: "Hot grease on cold air. The best smell in the war.",
    narrative:
      "A field kitchen truck — actual coffee, actual heat, a cook who treats complaints like sport.\n\nThe line is long. Your crew is not technically in it.",
    preChoiceNpc: { speaker: "Cook Cpl. Diaz", line: "Tankers. You smell like oil and bad decisions. You want soup or you want philosophy?" },
    choices: [
      {
        id: "soup",
        label: "Soup for the crew — trade a salvage point of goodwill.",
        role: "loader",
        dialogueLine: "Soup. All five. We'll owe you a story later.",
        outcomeText: "Soup is thin and perfect. Constitution climbs like a small resurrection.",
        effects: [{ op: "mod_all_constitution", delta: 12 }, { op: "spend_salvage", amount: 1 }],
      },
      {
        id: "coffee_cmd",
        label: "Commander takes coffee and the day's rumor.",
        role: "commander",
        dialogueLine: "Coffee. And tell me what's actually happening on the left flank.",
        outcomeText: "Coffee burns right. The rumor is worse than the map. Both are useful.",
        npcReply: "\"Left flank's chewing itself. You ain't left. Yet.\"",
        effects: [{ op: "mod_constitution", role: "commander", delta: 6 }, { op: "journal", text: "Cook-truck rumor on the flank.", kind: "moment" }],
      },
      {
        id: "pass",
        label: "Keep rolling — food on the hull is safer.",
        role: "driver",
        dialogueLine: "Smells good. We're not stopping. Convoy discipline.",
        outcomeText: "Diaz flips you a gesture that's half insult, half respect. You move.",
        effects: [],
      },
    ],
  },
  gen_combat_halftrack_belt: {
    id: "gen_combat_halftrack_belt",
    kind: "tank_combat",
    atmosphere: "Half-track treads bite snow. Their machine gun already knows your silhouette.",
    narrative:
      "A German half-track on the treeline belt — MG42 already firing tracers that stitch the mud.\n\nThe gunner wants the turret. The driver wants angle.",
    useDice: true,
    enemy: { idealAmmo: "HE", label: "Sd.Kfz. 251" },
    choices: [
      {
        id: "he_burst",
        label: "HE the belt — erase the treeline.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "HE walks the line. The half-track stops being a problem.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }],
      },
      {
        id: "smoke_angle",
        label: "Smoke and flank — driver owns the geometry.",
        role: "driver",
        choiceRisk: "tactical",
        outcomeText: "Smoke. Angle. The MG fires at ghosts while you finish the real shot.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
      {
        id: "hold",
        label: "Hold hull-down — let them spend ammo first.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "They spend. You don't. When they pause you erase them.",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
    ],
  },
  gen_combat_mg_nest: {
    id: "gen_combat_mg_nest",
    kind: "infantry_combat",
    atmosphere: "A stitched line of tracers from a hole that isn't big enough to hate.",
    narrative:
      "MG nest in a farm wall — low, mean, perfectly placed to ruin anyone who believes in open ground.\n\nThe asst driver's hull gun wants work. The commander wants a plan.",
    useDice: true,
    choices: [
      {
        id: "suppress",
        label: "Asst driver suppresses — loader prepares HE.",
        role: "asst_driver",
        choiceRisk: "tactical",
        outcomeText: "Brass falls like rain. The nest goes quiet long enough for the main gun.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: -2 }],
      },
      {
        id: "he_room",
        label: "HE the whole room — erase the wall.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "The wall collapses inward. The gun doesn't fire again.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 1 }],
      },
      {
        id: "smoke_run",
        label: "Smoke and run the gap — speed over elegance.",
        role: "driver",
        choiceRisk: "cautious",
        outcomeText: "WP blooms. The tank runs the gap before the nest finds you again.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }, { op: "mod_tank_health", delta: -5 }],
      },
    ],
  },
  gen_combat_88_flash: {
    id: "gen_combat_88_flash",
    kind: "tank_combat",
    atmosphere: "A flash like summer lightning. The sound arrives late, which is how you know it's aimed.",
    narrative:
      "Eighty-eight flash from a treeline copse — no full silhouette, just malice and geometry.\n\nAP or smoke. Move or die. The crew knows the menu.",
    useDice: true,
    enemy: { idealAmmo: "AP", combatMod: -1, label: "PaK 88" },
    choices: [
      {
        id: "ap_return",
        label: "AP return fire — duel the flash.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "You fire where the flash was. Something breaks. Maybe them. Maybe luck.",
        effects: [{ op: "spend_ammo", ammo: "AP", amount: 2 }],
      },
      {
        id: "smoke_break",
        label: "Smoke and break line of sight.",
        role: "driver",
        choiceRisk: "cautious",
        outcomeText: "WP and reverse. The second shot misses because smoke remembers your name.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 1 }],
      },
      {
        id: "indirect",
        label: "Commander calls arty on the copse — spend time.",
        role: "commander",
        choiceRisk: "tactical",
        outcomeText: "Arty answers late but loud. The copse becomes a crater. You leave.",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
    ],
  },
  gen_infantry_sniper_drain: {
    id: "gen_infantry_sniper_drain",
    kind: "infantry_combat",
    atmosphere: "A drainage pipe that watches back.",
    narrative:
      "Sniper in a drainage pipe — one crack and then the kind of silence that measures you.\n\nEveryone wants to be somewhere else. The tank is somewhere else's opposite.",
    useDice: true,
    choices: [
      {
        id: "he_pipe",
        label: "HE the pipe — end the math.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "The pipe ceases to be architecture. The math stops.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 1 }],
      },
      {
        id: "scatter",
        label: "Commander orders scatter on foot.",
        role: "commander",
        choiceRisk: "tactical",
        outcomeText: "Five targets. The shot doesn't come. You regroup angry and alive.",
        effects: [{ op: "mod_all_constitution", delta: -4 }],
      },
      {
        id: "crawl",
        label: "Asst driver crawls with smoke — old infantry habit.",
        role: "asst_driver",
        choiceRisk: "cautious",
        outcomeText: "Smoke and crawl. The second shot never lands. Your knees hate you.",
        effects: [{ op: "mod_resource", key: "smallArmsMags", delta: -1 }],
      },
    ],
  },
  gen_defensive_counter_battery: {
    id: "gen_defensive_counter_battery",
    kind: "defensive_stand",
    atmosphere: "Counter-battery whistles. The sky is somebody else's argument.",
    narrative:
      "German tubes somewhere in the woodline. Your arty is answering. The tank is a listening post with too much armor.\n\nHold or reposition. Both cost.",
    useDice: true,
    choices: [
      {
        id: "hold",
        label: "Hold position — hull-down, ride the bracket.",
        role: "commander",
        choiceRisk: "cautious",
        outcomeText: "Brackets close. None land. Discipline beats panic again.",
        effects: [{ op: "mod_all_constitution", delta: -3 }],
      },
      {
        id: "reposition",
        label: "Driver repositions fifty meters — break the bracket.",
        role: "driver",
        choiceRisk: "tactical",
        outcomeText: "Fifty meters saves the day. The shells eat where you were.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 5 }],
      },
      {
        id: "spot",
        label: "Gunner spots muzzle flash for arty — give them coordinates.",
        role: "gunner",
        choiceRisk: "aggressive",
        outcomeText: "Coordinates good. The woodline lifts. Silence after is professional.",
        effects: [{ op: "add_salvage", amount: 2 }, { op: "mod_constitution", role: "gunner", delta: -4 }],
      },
    ],
  },
  gen_offensive_smoke_screen: {
    id: "gen_offensive_smoke_screen",
    kind: "offensive_assault",
    atmosphere: "White phosphorus turns the field into a blank page.",
    narrative:
      "Push order. Your WP will write the page. Infantry behind you waits for the sentence.\n\nThe driver sees gaps. The gunner sees threats.",
    useDice: true,
    choices: [
      {
        id: "wp_push",
        label: "WP screen and push — own the gap.",
        role: "commander",
        choiceRisk: "aggressive",
        outcomeText: "Smoke and speed. The objective inch closer. The cost comes later.",
        effects: [{ op: "spend_ammo", ammo: "WP", amount: 2 }, { op: "mod_all_constitution", delta: 4 }],
      },
      {
        id: "inf_follow",
        label: "Slow push — keep infantry on your decks.",
        role: "driver",
        choiceRisk: "tactical",
        outcomeText: "Slow is survivable. The line holds together. Progress is real if narrow.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -3 }, { op: "mod_all_constitution", delta: 5 }],
      },
      {
        id: "hold_smoke",
        label: "Hold in smoke — let arty finish the field.",
        role: "gunner",
        choiceRisk: "cautious",
        outcomeText: "Arty does the work. You claim the ground after. Cheaper in hull.",
        effects: [{ op: "mod_all_constitution", delta: 2 }],
      },
    ],
  },
  anchor_metz_siege: {
    id: "anchor_metz_siege",
    kind: "historical_anchor",
    atmosphere: "Fortified Metz sits on the map like a fist that won't open.",
    narrative:
      "Metz — siege lines, old forts, new craters. The division wants patience. The crew wants an end.\n\nObjective still burns: {objective}. The city doesn't care about your schedule.",
    quote: "{cmd}: \"We don't have to love sieges. We have to survive them.\"",
    choices: [
      {
        id: "battery",
        label: "Support the battery — indirect fire, exposed position.",
        role: "gunner",
        outcomeText: "Steel on steel. The fort answers less each hour. So do you.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }, { op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "infiltrate",
        label: "Night approach on secondary road — driver leads.",
        role: "driver",
        outcomeText: "Dark and slow. You find a seam in the ring. The map will lie about it tomorrow.",
        effects: [{ op: "add_salvage", amount: 3 }, { op: "mod_constitution", role: "driver", delta: -6 }],
      },
      {
        id: "hold_line",
        label: "Hold the line and ration ammo — commander conserves.",
        role: "commander",
        outcomeText: "Patience is a weapon. It's also a wound. You hold.",
        effects: [{ op: "mod_all_constitution", delta: 5 }, { op: "journal", text: "Held the Metz ring.", kind: "moment" }],
      },
    ],
  },
  anchor_remagen_bridge: {
    id: "anchor_remagen_bridge",
    kind: "historical_anchor",
    atmosphere: "The Rhine is a border even when the bridge still stands.",
    narrative:
      "Remagen — Ludendorff Bridge still standing, which feels like a mistake everyone is rushing to correct.\n\nEvery unit in the theater wants across. Your crew wants to be first or wants to be anywhere else.",
    quote: '{drv}: "Bridges are where the war remembers to aim."',
    useDice: true,
    choices: [
      {
        id: "cross",
        label: "Cross with the column — hull in the open.",
        role: "driver",
        outcomeText: "Open treads. Open sky. You cross because orders are orders and luck is luck.",
        effects: [
          { op: "mod_tank_health", delta: -10 },
          { op: "journal", text: "Crossed the Rhine at Remagen.", kind: "moment" },
        ],
      },
      {
        id: "cover",
        label: "Suppress from this bank — gunner covers crossing units.",
        role: "gunner",
        outcomeText: "Your fire buys seconds. Seconds buy lives. The bridge exhales infantry and armor.",
        effects: [{ op: "spend_ammo", ammo: "HE", amount: 2 }, { op: "mod_all_constitution", delta: 6 }],
      },
      {
        id: "wait_engineers",
        label: "Wait for engineers — commander refuses suicide.",
        role: "commander",
        outcomeText: "Engineers tape and pray. You cross after. The bridge holds long enough to matter.",
        effects: [{ op: "mod_all_constitution", delta: 4 }, { op: "add_salvage", amount: 2 }],
      },
    ],
  },
  social_mail_call: {
    id: "social_mail_call",
    kind: "rest",
    atmosphere: "Paper sorted in a tent that smells like home and censorship.",
    narrative:
      "Mail call — names called, envelopes passed, faces doing math on what they might read.\n\nSome get nothing. That is also mail call.",
    choices: [
      {
        id: "read_aloud",
        label: "Loader reads his letter aloud — crew listens.",
        role: "loader",
        outcomeText: "A sister's handwriting. Bad news wrapped in good jokes. The crew laughs wrong and it helps.",
        effects: [{ op: "mod_all_constitution", delta: 10 }],
      },
      {
        id: "write",
        label: "Commander writes three lines — lies of safety.",
        role: "commander",
        outcomeText: "Three lines. Enough to keep someone sleeping in Ohio. You seal it.",
        effects: [{ op: "mod_constitution", role: "commander", delta: 5 }],
      },
      {
        id: "skip",
        label: "Gunner skips the line — not today.",
        role: "gunner",
        outcomeText: "No letter. No disappointment. The silence is its own habit.",
        effects: [{ op: "mod_constitution", role: "gunner", delta: -3 }],
      },
    ],
  },
  social_deck_cleaning: {
    id: "social_deck_cleaning",
    kind: "rest",
    atmosphere: "Grease on cards. Men pretending the deck is the only battle.",
    narrative:
      "Someone spreads cards on a tarpsheet. The deck is missing a queen. Nobody mentions it.\n\nSmall bets. Smaller talk.",
    choices: [
      {
        id: "play",
        label: "Play one hand — loader deals.",
        role: "loader",
        outcomeText: "You lose money you didn't have. You win an hour that feels almost normal.",
        effects: [{ op: "mod_all_constitution", delta: 8 }],
      },
      {
        id: "clean",
        label: "Asst driver cleans the deck — ritual, not game.",
        role: "asst_driver",
        outcomeText: "Edges squared. Backs aligned. Order imposed on cardboard. It helps.",
        effects: [{ op: "mod_constitution", role: "asst_driver", delta: 6 }],
      },
      {
        id: "sleep",
        label: "Commander sleeps through it — earned.",
        role: "commander",
        outcomeText: "Sleep. The laughter stays outside the dream. For once.",
        effects: [{ op: "mod_constitution", role: "commander", delta: 10 }],
      },
    ],
  },
  social_superstition: {
    id: "social_superstition",
    kind: "rest",
    atmosphere: "A bolt, a ribbon, a habit older than the manual.",
    narrative:
      "The kid ties a ribbon on the periscope. The veteran says nothing. The dark comedian says everything.\n\nSuperstition spreads faster than orders.",
    choices: [
      {
        id: "allow",
        label: "Let it ride — harmless nerve.",
        role: "commander",
        outcomeText: "The ribbon stays. The next event feels watched-over, which is nonsense that works.",
        effects: [{ op: "mod_all_constitution", delta: 6 }],
      },
      {
        id: "mock",
        label: "Dark comedian mocks it — tension breaks.",
        role: "gunner",
        outcomeText: "Laughter. The ribbon stays anyway. Truth and jokes share the hull.",
        effects: [{ op: "mod_all_constitution", delta: 5 }, { op: "mod_constitution", role: "gunner", delta: 4 }],
      },
      {
        id: "remove",
        label: "Pragmatist cuts it off — waste of focus.",
        role: "asst_driver",
        outcomeText: "Ribbon gone. The kid sulks. The tank feels colder for an hour.",
        effects: [{ op: "mod_constitution", role: "asst_driver", delta: 3 }, { op: "mod_all_constitution", delta: -2 }],
      },
    ],
  },
  social_grave_markers: {
    id: "social_grave_markers",
    kind: "rest",
    atmosphere: "Crosses made from supply crates. Names in pencil.",
    narrative:
      "A roadside grave detail — not yours, not officially. Someone from another unit marking yesterday.\n\nThe faithful one wants to help. The cynic wants to keep driving.",
    choices: [
      {
        id: "help",
        label: "Faithful helps carve a name — five minutes.",
        role: "loader",
        outcomeText: "Five minutes. A name deeper in the wood. You leave lighter and heavier.",
        effects: [{ op: "mod_all_constitution", delta: 4 }, { op: "mod_constitution", role: "loader", delta: 8 }],
      },
      {
        id: "salute",
        label: "Commander salute and move — respect without theater.",
        role: "commander",
        outcomeText: "Salute. Move. The road doesn't pause for grief. You carry it anyway.",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "drive",
        label: "Driver keeps engine running — can't stop every time.",
        role: "driver",
        outcomeText: "You don't stop. The crosses slide past. The crew doesn't comment. They notice.",
        effects: [{ op: "mod_constitution", role: "driver", delta: -4 }],
      },
    ],
  },
  gen_travel_fuel_shortage: {
    id: "gen_travel_fuel_shortage",
    kind: "travel",
    atmosphere: "Fuel gauges lie. The column still slows anyway.",
    narrative:
      "Division fuel is rationed again. Your tank has enough to move, not enough to feel safe.\n\nThe driver does math in his head. The commander does math on the map. Both answers are uncomfortable.",
    choices: [
      {
        id: "siphon",
        label: "Loader siphons from a disabled truck — quick and ugly.",
        role: "loader",
        outcomeText: "Fuel in the tank. Guilt in the crew. The war accepts both.",
        effects: [{ op: "mod_constitution", role: "loader", delta: -4 }, { op: "mod_all_constitution", delta: 2 }],
      },
      {
        id: "wait",
        label: "Wait for fuel truck — commander refuses to run dry.",
        role: "commander",
        outcomeText: "The truck comes. Late. The schedule bleeds. You move anyway.",
        effects: [{ op: "mod_constitution", role: "commander", delta: -3 }],
      },
      {
        id: "short_hop",
        label: "Driver short-hops — conserve, accept delay.",
        role: "driver",
        outcomeText: "You arrive behind the column. Alive. Behind.",
        effects: [{ op: "mod_constitution", role: "driver", delta: 5 }],
      },
    ],
  },
};

export const WAVE12_GENERIC_POOL_IDS = [
  "gen_travel_fuel_shortage",
  "gen_travel_checkpoint_abandoned",
  "gen_travel_convoy_pass",
  "gen_travel_bogged_soft",
  "gen_travel_crossroads_smoke",
  "gen_travel_rubble_choke",
  "gen_travel_night_halt",
  "gen_human_photo_wall",
  "gen_human_piano_key",
  "gen_human_wounded_horse",
  "npc_engineer_bridge",
  "npc_refugee_family",
  "npc_cook_truck",
  "gen_combat_halftrack_belt",
  "gen_combat_mg_nest",
  "gen_combat_88_flash",
  "gen_infantry_sniper_drain",
  "gen_defensive_counter_battery",
  "gen_offensive_smoke_screen",
] as const;

export const WAVE12_ANCHOR_IDS = ["anchor_metz_siege", "anchor_remagen_bridge"] as const;

export const WAVE12_SOCIAL_IDS = [
  "social_mail_call",
  "social_deck_cleaning",
  "social_superstition",
  "social_grave_markers",
] as const;
