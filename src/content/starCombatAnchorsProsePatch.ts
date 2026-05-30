import type { RuntimeEvent } from "../engine/types";
import { getPoolKindBuckets, getTier2PoolKindBuckets } from "./poolKinds";
import { ANCHOR_IDS } from "./pools";

interface CombatAnchorOverride {
  atmosphere?: string;
  narrative?: string;
  stakesNote?: string;
  stakes?: RuntimeEvent["stakes"];
}

/** Hand-tuned STAR prose for combat-family pool beats and historical anchors. */
export const CURATED_COMBAT_ANCHORS_PROSE: Record<string, CombatAnchorOverride> = {
  gen_combat_tiger_lite: {
    atmosphere: "Sloped armor catches the light wrong — too heavy to be friendly.",
    narrative:
      "A long hull shadow slides across a hedgerow gap. The turret turns with patient menace.\n\nObjective: {objective}. Flank for AP, smoke and break, or hold the front plate and pray the gun is faster.",
  },
  gen_combat_panther: {
    atmosphere: "Gun muzzle holds steady in the viewport — a cat that already picked its angle.",
    narrative:
      "Panther hull low in the wheat, long gun already tracking your silhouette.\n\nObjective: {objective}. Deny him the shot, close the flank, or eat the first hit and answer with AP.",
  },
  gen_combat_pak: {
    atmosphere: "Dirt kicked up where nothing should be moving yet.",
    narrative:
      "Pak gun dug in at the bend — crew low, barrel level with your belt line.\n\nObjective: {objective}. Smoke, hull-down, or rush the emplacement before the sight picture clears.",
  },
  gen_combat_heat_round: {
    atmosphere: "A sharp chemical smell — someone loaded something mean.",
    narrative:
      "Enemy gun flashes white instead of orange. Heat round — shaped charge hunting your plate.\n\nObjective: {objective}. Angle hard, shoot first, or reverse before the second round finds you.",
  },
  gen_combat_mortar: {
    atmosphere: "Whistles fall from a sky that offers no cover.",
    narrative:
      "Mortar rounds bracket the lane — soft thumps, then steel rain on open hatches.\n\nObjective: {objective}. Move, button up, or counter-battery if you can spot the tube.",
  },
  gen_combat_halftrack_belt: {
    atmosphere: "Tracers stitch a line you were about to cross.",
    narrative:
      "Halftrack on the ridge — belt-fed fire walking down the road toward your bow.\n\nObjective: {objective}. HE the ridge, hull MG, or charge through and accept the cost.",
  },
  gen_combat_88_flash: {
    atmosphere: "A flash too bright for a rifle — the air remembers thunder.",
    narrative:
      "Eighty-eight flash from a treeline cut — long gun, short fuse on your schedule.\n\nObjective: {objective}. Smoke, flank, or trade shots before he reloads the next kill round.",
  },
  gen_loader_shell_stuck: {
    atmosphere: "Brass jammed in the breech — the tank holds its breath.",
    narrative:
      "Loader's hands shake on a stuck shell — fight outside while the main gun is a paperweight.\n\nObjective: {objective}. Clear the jam under fire, fight on MG, or back out before they close.",
  },
  gen_combat_hetzer_lite: {
    atmosphere: "Low silhouette — hard to see until the gun speaks.",
    narrative:
      "Hetzer hull hugging the ditch — small target, big gun, waiting for you to present belly plate.\n\nObjective: {objective}. Overwatch the ditch, HE the brush, or bypass and let someone else bleed.",
  },
  gen_combat_panzerschreck: {
    atmosphere: "A tube on a shoulder — one man who thinks he owns the road.",
    narrative:
      "Panzerschreck team in the rubble — two men, one shot, enough to kill a crew's morning.\n\nObjective: {objective}. MG them, reverse behind cover, or close fast before the backblast clears.",
  },
  gen_combat_jagdpanzer: {
    atmosphere: "No turret — just a gun in a coffin pointed at you.",
    narrative:
      "Jagdpanzer ambush from a farm wall — casemate gun, no weak turret ring to exploit.\n\nObjective: {objective}. Flank wide, smoke the wall, or AP center mass and hope the plate holds.",
  },
  gen_combat_nebelwerfer: {
    atmosphere: "A scream on rails — rockets before the whistle.",
    narrative:
      "Nebelwerfer salvo lifts from the tree line — area fire, no precision, plenty of terror.\n\nObjective: {objective}. Button up, move out of the bracket, or hunt the launcher before reload.",
  },
  gen_combat_pz4_ambush: {
    atmosphere: "Diesel smoke where the map showed empty field.",
    narrative:
      "Panzer IV hull-down behind the berm — old tank, good crew, first shot still counts.\n\nObjective: {objective}. Flank, suppress, or trade AP and see who walks away.",
  },
  gen_combat_flak88_roadblock: {
    atmosphere: "Eighty-eight muzzle level with your driver's eyes.",
    narrative:
      "Flak eighty-eight on the roadblock — anti-air gun turned anti-tank with bureaucratic efficiency.\n\nObjective: {objective}. Smoke, indirect fire, or rush the block before the crew finishes ranging.",
  },
  gen_combat_rocket_barrage: {
    atmosphere: "Air full of smoke trails — math made visible and lethal.",
    narrative:
      "Rocket barrage saturates the crossroads — nothing precise, everything dangerous to open hatches.\n\nObjective: {objective}. Push through, hold in defilade, or wait out the storm and lose time.",
  },
  gen2_combat_nashorn: {
    atmosphere: "A house on tracks hiding a gun too big for its shirt.",
    narrative:
      "Nashorn at the orchard edge — open top, open sightline, eighty-eight on a thin hull.\n\nObjective: {objective}. Shoot first, flank fast, or smoke and displace before he finds range.",
  },
  gen2_combat_bunker_line: {
    atmosphere: "Concrete teeth grinning through the morning mist.",
    narrative:
      "Bunker line spans the draw — MG ports, AT embrasures, infantry tied to the concrete.\n\nObjective: {objective}. Suppress, bypass, or chew through with HE and infantry support.",
  },
  gen2_combat_flak_truck: {
    atmosphere: "Wheels and a gun — mobility with bad intentions.",
    narrative:
      "Flak truck unlimbers at the crossroads — quick setup, quick kill, gone before counter-battery lands.\n\nObjective: {objective}. MG the crew, AP the truck, or accept delay while they reload belts.",
  },
  gen2_combat_assault_gun: {
    atmosphere: "Low hull, fixed gun — a fist in a steel glove.",
    narrative:
      "StuG assault gun in the sunken lane — no turret to shoot, hull to angle, infantry on its flanks.\n\nObjective: {objective}. Flank, coordinate HE, or push past and let the column follow.",
  },
  gen2_combat_king_tiger_far: {
    atmosphere: "Something massive moves at the treeline — too far to miss, too close to ignore.",
    narrative:
      "King Tiger at extreme range — long gun already dialed, your AP maybe not enough at this distance.\n\nObjective: {objective}. Close the range, smoke and move, or hold and make every round count.",
  },
  gen2_combat_stuhturm: {
    atmosphere: "Brick dust and a muzzle you didn't see until it fired.",
    narrative:
      "Sturmturm casemate in the rubble — urban gun port, infantry stacked in the floors above.\n\nObjective: {objective}. HE the port, infantry clear the floors, or bypass and seal them in.",
  },
  gen2_combat_pak_ambush_road: {
    atmosphere: "Fresh tire tracks end where the gun pit begins.",
    narrative:
      "Pak ambush on the road cut — camo net still settling, crew fingers on the lanyard.\n\nObjective: {objective}. Smoke the cut, overrun the pit, or reverse before the eighty-eight speaks.",
  },
  w19_t2_combat_mortar: {
    atmosphere: "Second-pass bracket — they know your halt routine now.",
    narrative:
      "Mortar fire returns on the same grid — adjusted fire, shorter walk, longer casualty list.\n\nObjective: {objective}. Displace now, counter-mortar, or drive through and dare them to adjust again.",
  },
  gen_infantry_treeline: {
    atmosphere: "Muzzle flashes stitch green into a line of angry punctuation.",
    narrative:
      "Infantry in the treeline — rifles, maybe a Faust, shouts in a language you don't need translated.\n\nObjective: {objective}. HE the line, hull MG, or drive the position and end it mechanically.",
  },
  gen_infantry_cellar: {
    atmosphere: "Cellar grates breathe cold air and rifle smoke.",
    narrative:
      "Cellar fighting — infantry below street level, grenades and stubborn rooms between you and the crossroads.\n\nObjective: {objective}. HE the entries, dismount and clear, or seal and bypass.",
  },
  gen_infantry_sniper_drain: {
    atmosphere: "One crack — then silence heavy enough to count heartbeats.",
    narrative:
      "Sniper in the drainage culvert — one shot, one crewman down, the rest of the column waiting.\n\nObjective: {objective}. Smoke, HE the culvert, or rush past and accept another crack.",
  },
  gen_combat_mg_nest: {
    atmosphere: "Belt-fed rhythm — a sewing machine that sews holes in steel.",
    narrative:
      "MG nest in the sandbags — interlocking fire across the lane you need for {objective}.\n\nObjective: {objective}. Suppress, flank with infantry, or HE the nest and drive through.",
  },
  gen_infantry_pillbox: {
    atmosphere: "Concrete lips spit tracers across the field.",
    narrative:
      "Pillbox on the forward slope — loopholes, MG, maybe a panzerfaust team in the back room.\n\nObjective: {objective}. Bypass, breach with HE, or infantry assault while you overwatch.",
  },
  gen_infantry_faust_corner: {
    atmosphere: "A tube around a corner — courage measured in meters.",
    narrative:
      "Panzerfaust at the street corner — one man, one shot, close enough to smell his breath.\n\nObjective: {objective}. MG the corner, reverse, or charge before he pulls the trigger.",
  },
  gen_infantry_basement_hold: {
    atmosphere: "Floorboards above you — boots, grenades, no easy exit.",
    narrative:
      "Basement hold — infantry below the rubble, fighting room to room while the tank blocks the street.\n\nObjective: {objective}. HE down the stairs, dismount support, or bypass and let them starve.",
  },
  gen_infantry_mine_warn: {
    atmosphere: "A skull post leans where the infantry wants you to stop.",
    narrative:
      "Mine warning at the infantry lane — Schu-mines, wire, men watching to see if you roll or probe.\n\nObjective: {objective}. Dismount, follow tracks, or detour and pay in time and fuel.",
  },
  gen_infantry_artillery_mist: {
    atmosphere: "Mist full of whistling — shells you hear before you see.",
    narrative:
      "Artillery through the mist — infantry hugging craters, your silhouette the only clear target.\n\nObjective: {objective}. Move, smoke, or hold defilade until the bracket walks past.",
  },
  gen_infantry_surrender_wave: {
    atmosphere: "Hands up — rifles dropped, fear still armed.",
    narrative:
      "Surrender wave — infantry coming out with hands high, last holdouts maybe still in the rubble.\n\nObjective: {objective}. Accept, screen for traps, or push on and let MPs sort the living.",
  },
  gen_combat_sniper_lane: {
    atmosphere: "A lane too straight — one window, one shot, one delay.",
    narrative:
      "Sniper lane through the village — rooftops, steeple, any glass that catches the sun wrong.\n\nObjective: {objective}. Smoke the lane, HE the likely nests, or speed and gamble.",
  },
  gen2_combat_panzerfaust_team: {
    atmosphere: "Two tubes, one alley — close work with no room to miss.",
    narrative:
      "Panzerfaust team in the alley — second pass, they know your approach angle now.\n\nObjective: {objective}. MG both ends, reverse out, or infantry clear before you commit the hull.",
  },
  gen2_infantry_barn_fight: {
    atmosphere: "Hay dust and gunpowder — a barn that learned to kill.",
    narrative:
      "Barn fight — infantry in the loft, MG in the door, your hull too wide for the gate.\n\nObjective: {objective}. HE the loft, infantry assault, or bypass and leave them for the next unit.",
  },
  gen2_infantry_haystack_sniper: {
    atmosphere: "Haystack too neat — a rifle port cut with patient hands.",
    narrative:
      "Haystack sniper on the field edge — camouflage good enough to fool the first pass, not the second.\n\nObjective: {objective}. HE the stack, smoke and move, or ignore and pay in crew.",
  },
  gen2_infantry_cellar_grenade: {
    atmosphere: "Grenade blast from below — the street breathes shrapnel.",
    narrative:
      "Cellar grenade fight — infantry dropping steel through grates while you block their exit.\n\nObjective: {objective}. Seal the grates, dismount and clear, or pull back before the next bundle falls.",
  },
  gen2_infantry_hedgerow_lmg: {
    atmosphere: "LMG chatter from a wall you cannot see through.",
    narrative:
      "Hedgerow LMG — Bocage cuts sightlines to nothing, infantry owns the gaps you must cross.\n\nObjective: {objective}. HE the gap, hull MG, or infantry first while you cover.",
  },
  w19_t2_combat_mg42: {
    atmosphere: "MG42 rip — cloth tearing at the speed of death.",
    narrative:
      "Second-pass MG42 nest — belt fed, pre-sighted on the lane you used yesterday.\n\nObjective: {objective}. Smoke, flank, or HE the nest before the next belt chews your bow.",
  },
  gen_defensive_wave: {
    atmosphere: "Horns and boots — a wave forming beyond the smoke.",
    narrative:
      "Defensive wave incoming — infantry massing beyond the tree line, armor maybe behind them.\n\nObjective: {objective}. Hold the line, call arty, or fall back to prepared positions before contact.",
  },
  gen_defensive_flare: {
    atmosphere: "White light — everything visible, nowhere to hide.",
    narrative:
      "Flare over the position — night turned day, silhouettes for every gun on the ridge.\n\nObjective: {objective}. Button up, shoot at the muzzle flashes, or displace before the follow-on fire.",
  },
  gen_defensive_counter_battery: {
    atmosphere: "Outgoing thumps answer incoming whistles — math with high explosives.",
    narrative:
      "Counter-battery duel — their tubes bracket you while yours hunt theirs across the valley.\n\nObjective: {objective}. Hold position, move, or coordinate fire and hope the math favors you.",
  },
  gen_defensive_arty_incoming: {
    atmosphere: "Whistles you learned to hate — steel hunting coordinates.",
    narrative:
      "Artillery incoming on the halt position — bracket tightening, hatches slamming, prayers informal.\n\nObjective: {objective}. Displace, dig in, or drive through the bracket and accept the tax.",
  },
  gen_defensive_hedgerow_ambush: {
    atmosphere: "Hedgerow too quiet — ambush weather in Normandy.",
    narrative:
      "Hedgerow ambush on the defensive — Faust teams, MG, maybe a Pak in the next field.\n\nObjective: {objective}. Smoke, reverse to hull-down, or push through before they consolidate.",
  },
  gen_defensive_night_probe: {
    atmosphere: "Metal on wire — someone testing your perimeter in the dark.",
    narrative:
      "Night probe on the line — infantry feeling for gaps, satchel charges maybe, nerves everywhere.\n\nObjective: {objective}. MG the wire, flare, or hold fire and let them reveal the main push.",
  },
  gen_defensive_ruhr_line: {
    atmosphere: "Industrial smoke — the Ruhr line smells like coal and cordite.",
    narrative:
      "Ruhr defensive line — factories, rubble, determined infantry fighting for ground already lost.\n\nObjective: {objective}. Hold the block, bypass the strongpoint, or HE the factory floor by floor.",
  },
  gen_defensive_roadblock_hold: {
    atmosphere: "Barricade and boots — they mean to make you pay for the road.",
    narrative:
      "Roadblock hold — wire, mines, infantry with nothing left to lose between you and {objective}.\n\nObjective: {objective}. Breach, flank, or wait for engineers while the column stacks behind you.",
  },
  gen2_defensive_88_reverse: {
    atmosphere: "Eighty-eight reversed into the barn — gun port you didn't see coming.",
    narrative:
      "Reverse-slope eighty-eight — hull hidden, barrel only, first shot at your belly if you crest.\n\nObjective: {objective}. Smoke the crest, flank the barn, or dismount and find the crew.",
  },
  gen2_defensive_mortar_rain: {
    atmosphere: "Mortar rain without pause — the sky keeps score.",
    narrative:
      "Mortar rain on the defensive position — adjusted fire, shorter intervals, nowhere dry to stand.\n\nObjective: {objective}. Displace, counter-mortar, or button up and lose the initiative.",
  },
  gen2_defensive_night_probe: {
    atmosphere: "Second night probe — they know where your wire ends.",
    narrative:
      "Repeat night probe — same grid, smarter infantry, satchel charges on the tracks you parked.\n\nObjective: {objective}. Flare, MG, or reposition before they find the gap the first probe mapped.",
  },
  w19_t2_defensive_hedgehog: {
    atmosphere: "Tank traps like broken teeth across the lane.",
    narrative:
      "Hedgehog line on the second pass — Czech hedgehogs, mines, MG covering the gaps you need.\n\nObjective: {objective}. Engineers forward, bypass wide, or force the gap and eat the cost.",
  },
  gen_offensive_push: {
    atmosphere: "Diesel and dust — the push smells like momentum and fear.",
    narrative:
      "Offensive push — column compressed, guns forward, every hedgerow a maybe-ambush on the way to {objective}.\n\nObjective: {objective}. Lead, follow, or flank — stopping is how columns die.",
  },
  gen_offensive_smoke_screen: {
    atmosphere: "White phosphorus — a curtain you can taste.",
    narrative:
      "Smoke screen for the push — visibility gone, friendlies maybe ahead, enemy definitely somewhere.\n\nObjective: {objective}. Drive blind, hold for clear air, or pop WP and pray the grid is right.",
  },
  gen_cmd_crossing: {
    atmosphere: "Officer's map — ink lines where blood will go.",
    narrative:
      "Command crossing — officers want the bridge now, engineers say later, your hull tests the argument.\n\nObjective: {objective}. Cross on order, wait for engineers, or scout the ford and save the span.",
  },
  gen_offensive_rhine_push: {
    atmosphere: "River mud on the treads — Germany starts on the far bank.",
    narrative:
      "Rhine push — boats, smoke, engineers waving flags that mean nothing until they mean everything.\n\nObjective: {objective}. Cross under fire, hold the beach, or support the bridgehead before counterattack.",
  },
  gen_offensive_village_clear: {
    atmosphere: "Rubble and rifle cracks — a village that won't surrender quietly.",
    narrative:
      "Village clear — room by room, street by street, your gun too big for half the doors.\n\nObjective: {objective}. HE the strongpoints, infantry lead, or bypass and leave a problem behind.",
  },
  gen_offensive_bypass: {
    atmosphere: "Main road blocked — side trace full of maybe and mud.",
    narrative:
      "Bypass route around the fight — longer miles, softer ground, maybe fewer guns if luck holds.\n\nObjective: {objective}. Take the bypass, hold the main road, or split the column and risk both.",
  },
  gen_offensive_bypass_town: {
    atmosphere: "Church steeple to your left — orders say do not enter.",
    narrative:
      "Bypass the town — civilians, snipers, column discipline fighting the shortcut through the square.\n\nObjective: {objective}. Skirt wide, risk the center, or wait while infantry clears the rooftops.",
  },
  gen_offensive_hill_grab: {
    atmosphere: "High ground — every commander’s favorite word and your hardest climb.",
    narrative:
      "Hill grab — slope steep, reverse gear tempting, the crest maybe mined or maybe just watched.\n\nObjective: {objective}. Assault the crest, suppress and infantry, or hold the shoulder and deny them the view.",
  },
  gen2_offensive_orchard_push: {
    atmosphere: "Branches scrape paint — orchard lanes built for carts, not tanks.",
    narrative:
      "Orchard push — tight lanes, Faust corners, progress measured in trees and curses.\n\nObjective: {objective}. Inch forward, infantry on the flanks, or detour and lose the tempo.",
  },
  gen2_offensive_barn_assault: {
    atmosphere: "Barn doors open — something inside wants the road back.",
    narrative:
      "Barn assault on the push — MG nest, maybe assault gun, hay burning after the first HE.\n\nObjective: {objective}. Breach, bypass, or suppress while infantry clears the loft.",
  },
  gen2_offensive_ridge_charge: {
    atmosphere: "Slope and sky — crest fire waiting like a toll booth.",
    narrative:
      "Ridge charge — exposed climb, every gun on the far slope dialed to your silhouette.\n\nObjective: {objective}. Smoke, speed, or hull-down at the shoulder and fight for the crest.",
  },
  w19_t2_offensive_barn: {
    atmosphere: "Second-pass barn — char still warm from yesterday's fight.",
    narrative:
      "Barn objective again — reoccupied overnight, MG port patched, infantry that knows your approach.\n\nObjective: {objective}. HE the doors, infantry first, or flank the field and deny them the lane.",
  },
  elite_night_ambush_stub: {
    atmosphere: "Dark engine noise — armor you hear before you see.",
    narrative:
      "Elite night ambush — StuG or worse in the black, first shot free if you stay lit.\n\nObjective: {objective}. Blackout, reverse, or flash and shoot before they finish ranging.",
    stakesNote: "Night ambush — first shot goes to whoever sees first; hatches cost lives.",
  },
  elite_stug_nest: {
    atmosphere: "Low hull in the hedge — a gun with no turret to kill.",
    narrative:
      "Elite StuG nest — hull-down, pre-sighted, infantry tied to its flanks like a pit bull on a chain.\n\nObjective: {objective}. Flank, coordinated HE, or trade AP and accept the counter-shot.",
    stakesNote: "StuG nest — casemate gun, infantry screen; flank or pay in bow plate.",
  },
  elite_konkurs_column: {
    atmosphere: "Column smoke — Konkurs or Panzerfaust, close and professional.",
    narrative:
      "Elite ambush on the column — AT teams in sequence, each lane a separate kill zone.\n\nObjective: {objective}. Break column, smoke, or assault the teams before the third tube fires.",
    stakesNote: "Column ambush — sequential AT teams; break formation or bleed.",
  },
  elite_remagen: {
    atmosphere: "Bridge steel groaning — history holding on by rivets.",
    narrative:
      "Elite fight at Remagen — bridge under fire, engineers and armor sharing a span too narrow for comfort.\n\nObjective: {objective}. Cross, suppress the far bank, or hold while infantry secures the approaches.",
    stakesNote: "Remagen bridge — cross under fire or lose the war’s shortest route east.",
  },
  elite_tiger_wallendorf: {
    atmosphere: "Long gun at the village edge — a Tiger owns the morning.",
    narrative:
      "Tiger at Wallendorf — village choke point, sloped armor, crew that already ranged the main street.\n\nObjective: {objective}. Flank through the alleys, smoke and rush, or AP duel and hope.",
    stakesNote: "Wallendorf Tiger — village geometry favors the defender; flank or die frontal.",
  },
  elite_jagdpanther_hollow: {
    atmosphere: "Hollow ground — sound travels wrong, guns travel faster.",
    narrative:
      "Jagdpanther in the hollow — long eighty-eight, low profile, first sight at belly range.\n\nObjective: {objective}. Crest slow, smoke the hollow, or dismount scouts before you commit the hull.",
    stakesNote: "Jagdpanther hollow — defilade gun; cresting without smoke is suicide.",
  },
  elite_farm_strongpoint: {
    atmosphere: "Farm walls thick — every window a loophole.",
    narrative:
      "Farm strongpoint — AT gun in the barn, MG in the house, infantry in the pig pens.\n\nObjective: {objective}. Combined assault, bypass, or HE until the walls stop returning fire.",
    stakesNote: "Farm strongpoint — layered defense; bypass costs time, assault costs blood.",
  },
  elite_stug_hunt: {
    atmosphere: "Track marks in the mud — hunter and hunted share the same road.",
    narrative:
      "StuG hunt — you are the predator or the prey depending on who sees the dust first.\n\nObjective: {objective}. Flank, bait, or hold hull-down and make them come to you.",
    stakesNote: "StuG hunt — mobile ambush; whoever commits the hull first often loses.",
  },
  gen2_elite_night_tiger: {
    atmosphere: "Moon on sloped plate — a Tiger you almost miss until it fires.",
    narrative:
      "Night Tiger on the second pass — blackout discipline broken by one careless exhaust flash.\n\nObjective: {objective}. Kill the light, reverse, or AP the flash and pray the range is right.",
    stakesNote: "Night Tiger — one flash gives away the column; shoot or vanish.",
  },
  gen2_elite_jagdtiger_stub: {
    atmosphere: "Massive casemate fills the lane — a gun that should not exist this close.",
    narrative:
      "Jagdtiger hull-down at the bend — hundred-twenty-eight millimeter reasons to find another route.\n\nObjective: {objective}. Flank wide, smoke and displace, or accept that frontal is a confession.",
    stakesNote: "Jagdtiger — frontal engagement is last resort; flank or bypass.",
  },
  gen2_elite_king_tiger_close: {
    atmosphere: "Close-range King Tiger — the gun already covers your driver's face.",
    narrative:
      "King Tiger close — no time to flank, belly exposed, AP maybe not enough at this range.\n\nObjective: {objective}. Smoke, reverse, or shoot weak plate and hope physics agrees.",
    stakesNote: "King Tiger close — range favors him; smoke and displacement or die.",
  },
  gen2_elite_elefant: {
    atmosphere: "Elefant hull — no machine gun, no mercy, no easy angle.",
    narrative:
      "Elefant on the road — thick front, weak sides, infantry must peel to expose the flank.\n\nObjective: {objective}. Infantry hunt, flank through the mud, or bypass and let arty try.",
    stakesNote: "Elefant — frontal immune; infantry coordination or bypass required.",
  },
  w19_t2_elite_halftrack: {
    atmosphere: "Elite halftrack — MG42, panzerfaust racks, crew that knows the drill.",
    narrative:
      "Second-pass elite halftrack — mobile AT team, pre-sighted on the halt you always take here.\n\nObjective: {objective}. MG first, smoke and move, or charge before they dismount the tubes.",
    stakesNote: "Elite halftrack — faust and MG combo; kill mobility or eat both.",
  },
  anchor_cobra: {
    atmosphere: "Dust and velocity — Operation Cobra eats the map in chunks.",
    narrative:
      "Operation Cobra — columns compress and stretch through the corridor, bombs still settling ahead.\n\nObjective: {objective}. Stay with the push, flank parallel, or scavenge the wreckage and risk separation.",
  },
  anchor_bulge: {
    atmosphere: "Ardennes snow — cold that makes every sound sharper than it should.",
    narrative:
      "Battle of the Bulge — snow, wrong voices on the radio, Germans in American overcoats at the junction.\n\nObjective: {objective}. Hold the crossroads, fire first, or fall back one ridgeline and live.",
  },
  anchor_rhine: {
    atmosphere: "River wind — the Rhine smells like mud and final lines.",
    narrative:
      "Rhine crossing — engineers, smoke, boats, the far bank already shooting at the first hull.\n\nObjective: {objective}. Cross under cover, coordinate with engineers, or hold the near bank until the bridge holds.",
  },
  anchor_huertgen: {
    atmosphere: "Wet pine — the Hürtgen Forest keeps what it kills.",
    narrative:
      "Hürtgen Forest — roots trip tracks, tree bursts turn splinters to shrapnel, the map lies about distance.\n\nObjective: {objective}. Crawl, suppress the tree line, or dismount and clear what the tank cannot see.",
  },
  anchor_paris_skirt: {
    atmosphere: "Church bells through armor — Paris close enough to hurt.",
    narrative:
      "Skirting Paris — orders forbid the city, civilians watch from doorways, hope smells like bread and diesel.\n\nObjective: {objective}. Bypass north, take the long detour, or brief halt and pretend the war paused.",
  },
  anchor_siegfried: {
    atmosphere: "Concrete teeth — the Siegfried Line grins through the mist.",
    narrative:
      "Siegfried Line — dragon's teeth, bunkers, fields of fire measured in decades of German planning.\n\nObjective: {objective}. Breach with engineers, suppress the bunkers, or find a gap the map missed.",
  },
  anchor_push_germany: {
    atmosphere: "Road signs in Gothic script — Germany under the treads at last.",
    narrative:
      "Push into Germany — homeland soil, sharper resistance, civilians who look like the photos in your wallet.\n\nObjective: {objective}. Keep tempo, bypass strongpoints, or pause and let the column breathe before the next belt.",
  },
  anchor_seine_crossing: {
    atmosphere: "Seine mud on the ramps — another river, another argument with engineers.",
    narrative:
      "Seine crossing — pontoon queue, sniper on the far bluff, Paris glory already behind you.\n\nObjective: {objective}. Cross on schedule, suppress the bluff, or wait for darkness and pay in time.",
  },
  anchor_cologne: {
    atmosphere: "Cathedral spires over smoke — Cologne burns sideways.",
    narrative:
      "Cologne — rubble streets, cathedral still standing, panzerfaust teams in every cellar grate.\n\nObjective: {objective}. Clear block by block, bypass the center, or HE the strongpoint and drive.",
  },
  anchor_ve_day: {
    atmosphere: "Quiet engines — victory sounds like exhaustion, not cheering.",
    narrative:
      "VE Day approach — fighting still finds you, radios chatter surrender and rumor in the same breath.\n\nObjective: {objective}. Hold discipline, accept the last shot, or push to the final objective before the champagne.",
  },
  anchor_metz_siege: {
    atmosphere: "Fort belts — Metz concrete older than your grandfathers.",
    narrative:
      "Siege of Metz — fortifications, interlocking fields, infantry that knows every meter of rubble.\n\nObjective: {objective}. Reduce the forts, bypass the belt, or wait for supplies while the garrison digs in.",
  },
  anchor_remagen_bridge: {
    atmosphere: "Bridge deck vibrating — Ludendorff Bridge still holding by habit.",
    narrative:
      "Remagen Bridge — first span across the Rhine intact, Germans trying to drop it while you cross.\n\nObjective: {objective}. Rush the bridge, suppress the far bank, or hold near side while engineers reinforce.",
  },
  anchor_ardennes_fog: {
    atmosphere: "Fog and frost — the Ardennes hides armor until it is too close.",
    narrative:
      "Ardennes fog — visibility measured in meters, Bulge ghosts in every shadow, tracks the only road.\n\nObjective: {objective}. Creep forward, halt and listen, or reverse before the silhouette becomes a gun.",
  },
  anchor_maginot_skirt: {
    atmosphere: "Concrete casemates — the Maginot Line skirted, not broken.",
    narrative:
      "Skirting the Maginot — forts bypassed in 1940 still watch the road with empty guns and full minefields.\n\nObjective: {objective}. Mark mines, detour wide, or risk the trace the French never defended.",
  },
  anchor_liberation_parade: {
    atmosphere: "Flowers on the hull — liberation tastes like tears and exhaust.",
    narrative:
      "Liberation parade — town square, flags, children on the fenders, sniper maybe still in the steeple.\n\nObjective: {objective}. Accept the welcome, screen the rooftops, or roll through and keep {objective} on schedule.",
  },
  anchor_roer_crossing: {
    atmosphere: "Roer dams — water and timing owned by someone upstream.",
    narrative:
      "Roer crossing — dams may flood the valley, engineers argue with the weather and the enemy.\n\nObjective: {objective}. Cross before release, wait for the flood to pass, or assault the far bank under shellfire.",
  },
  anchor_elbe_meeting: {
    atmosphere: "Different uniforms — Russians across the river, war almost finished.",
    narrative:
      "Elbe meeting — forward elements sight Soviet troops, champagne and caution in the same breath.\n\nObjective: {objective}. Hold the line, coordinate contact, or push to the river before politics closes the road.",
  },
  anchor_final_push: {
    atmosphere: "Last miles — Germany thin but not harmless.",
    narrative:
      "Final push — resistance desperate, roads better, every delay a argument you will have after VE Day.\n\nObjective: {objective}. Maintain tempo, reduce bypassed pockets, or halt and let the column consolidate.",
  },
  anchor_ruhr_pocket: {
    atmosphere: "Pocket smoke — the Ruhr collapses inward like a fist closing.",
    narrative:
      "Ruhr pocket — trapped divisions still bite, civilian chaos, columns squeezing the noose tighter.\n\nObjective: {objective}. Seal the gap, push through resistance, or bypass and let the next unit mop up.",
  },
  anchor_wesel_assault: {
    atmosphere: "Rhine smoke — Wesel assault begins with airplanes and fear.",
    narrative:
      "Wesel assault — airborne already on the ground, river crossing under fire, engineers first, armor second.\n\nObjective: {objective}. Force the crossing, suppress the far bank, or hold the beach until the bridge is in.",
  },
  anchor_munster_rubble: {
    atmosphere: "Cathedral rubble — Münster fought street by broken street.",
    narrative:
      "Münster in rubble — medieval streets, modern craters, last defenders in cellars beneath the stones.\n\nObjective: {objective}. Clear with infantry, HE the strongpoints, or bypass the center and seal the exits.",
  },
};

function patchCombatAnchorEvent(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  const curated = CURATED_COMBAT_ANCHORS_PROSE[catalogId];
  if (!curated) return ev;

  return {
    ...ev,
    atmosphere: curated.atmosphere ?? ev.atmosphere,
    narrative: curated.narrative ?? ev.narrative,
    stakesNote: curated.stakesNote ?? ev.stakesNote,
    stakes: curated.stakes ?? ev.stakes,
  };
}

/** Curated STAR prose overrides for combat-family pool events and historical anchors. */
export function patchCombatAnchorsProse(catalog: Record<string, RuntimeEvent>): void {
  const patchIds = new Set<string>(Object.keys(CURATED_COMBAT_ANCHORS_PROSE));
  const combatKinds = ["combat", "infantry", "defensive", "offensive", "elite"] as const;
  for (const buckets of [getPoolKindBuckets(), getTier2PoolKindBuckets()]) {
    for (const kind of combatKinds) {
      for (const id of buckets[kind]) {
        patchIds.add(id);
      }
    }
  }
  for (const id of ANCHOR_IDS) {
    patchIds.add(id);
  }
  for (const id of patchIds) {
    const ev = catalog[id];
    if (ev) catalog[id] = patchCombatAnchorEvent(ev, id);
  }
}

export function combatPoolIds(): string[] {
  const t1 = getPoolKindBuckets();
  const t2 = getTier2PoolKindBuckets();
  const kinds = ["combat", "infantry", "defensive", "offensive", "elite"] as const;
  return kinds.flatMap((k) => [...t1[k], ...t2[k]]);
}

export function combatAnchorsPoolIds(): string[] {
  return [...combatPoolIds(), ...ANCHOR_IDS];
}
