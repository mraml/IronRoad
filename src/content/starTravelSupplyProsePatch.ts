import type { RuntimeEvent } from "../engine/types";
import { getPoolKindBuckets, getTier2PoolKindBuckets } from "./poolKinds";

interface TravelSupplyOverride {
  atmosphere?: string;
  narrative?: string;
  stakesNote?: string;
  stakes?: RuntimeEvent["stakes"];
}

/** Hand-tuned STAR prose for travel/supply pool beats (Wave 24). */
export const CURATED_TRAVEL_SUPPLY_PROSE: Record<string, TravelSupplyOverride> = {
  gen_travel_mine: {
    atmosphere: "Fresh scrape in the dirt — the road listens back.",
    narrative:
      "A mine marker tilts wrong, too new and too clean. Wire runs to culverts the map never marked.\n\nObjective: {objective}. Probe, dismount, or detour — mines do not negotiate with schedules.",
  },
  gen_travel_bridge_down: {
    narrative:
      "Steel ribs hang over cold water. The charges still smoke at both ends.\n\nObjective: {objective}. Ford, wait for engineers, or gamble the span — time and hull trade places here.",
  },
  gen_travel_checkpoint_abandoned: {
    atmosphere: "Sandbags slump without hands to hold them.",
    narrative:
      "An abandoned checkpoint — barbed wire, empty tins, boots pointed the wrong way.\n\nObjective: {objective}. Search for intel, roll past, or assume the empty post is bait.",
  },
  gen_travel_convoy_pass: {
    atmosphere: "Dust that tastes like someone else's hurry.",
    narrative:
      "A convoy passes nose to tail — trucks, guns, men who won't look at you.\n\nObjective: {objective}. Merge, hold, or let them eat the road while you count fuel.",
  },
  gen_travel_bogged_soft: {
    atmosphere: "Mud pulls at treads with a wet, patient grip.",
    narrative:
      "Soft ground ahead — the column bunches because spreading out means sinking alone.\n\nObjective: {objective}. Winch, bypass, or accept the delay before dark finds you.",
  },
  gen_travel_crossroads_smoke: {
    atmosphere: "Smoke drifts across the crossroads without wind to explain it.",
    narrative:
      "Grid lines meet where three roads argue. Smoke means someone fired recently or wants you to think so.\n\nObjective: {objective}. Push through, scout, or wait for the air to clear.",
  },
  gen_travel_rubble_choke: {
    atmosphere: "Brick dust hangs in the air — taste of collapsed walls.",
    narrative:
      "Rubble chokes the trace to one lane. Civilians picked through it before you; soldiers will after.\n\nObjective: {objective}. Clear, squeeze, or find a longer way around the choke.",
  },
  gen_travel_night_halt: {
    atmosphere: "Engines tick as they cool — metal remembering heat.",
    narrative:
      "Night halt order — blacked out, intervals tight, nobody sleeps deep while the tree line listens.\n\nObjective: {objective}. Hold discipline, rotate watch, or move early and risk the dark.",
  },
  gen_officer_roadblock: {
    narrative:
      "A staff car blocks the center line. Clean boots, clipboard, time treated like yours is cheaper.\n\nObjective: {objective}. Comply, bypass, or let the main gun do the talking — the crew watches how you choose.",
    stakesNote: "Staff roadblock — paperwork, ditch, or turret stare; each costs something different.",
  },
  gen_supply_black_market: {
    narrative:
      "Crates behind a jeep — chocolate, cartridges, rumors with a price tag.\n\nObjective: {objective} still burns what you buy here. Trade salvage stories or keep rolling before MPs notice.",
    stakesNote: "Black market — food, ammo, or intel; every deal leaves a paper trail somewhere.",
  },
  gen_travel_ardennes_frost: {
    atmosphere: "Frost bites through glove seams before thought catches up.",
    narrative:
      "Ardennes frost — trees white, engines reluctant, breath that hurts in the open hatch.\n\nObjective: {objective}. Keep moving or freeze in place; cold kills slower than guns but just as dead.",
  },
  gen_travel_minefield_marker: {
    atmosphere: "Skull posts lean like bad teeth in the verge.",
    narrative:
      "Marked minefield — tape fluttering, safe path only as good as the last tread.\n\nObjective: {objective}. Follow tracks, probe slow, or detour wide and pay in miles.",
  },
  gen_travel_wire_gap: {
    atmosphere: "Concertina catches what light remains.",
    narrative:
      "Wire blocks the lane — gap maybe real, maybe bait for the impatient.\n\nObjective: {objective}. Hands find the gap or treads find the trap; choose before the column stacks up.",
  },
  gen_travel_smoke_column: {
    atmosphere: "A smoke column rises where the map shows nothing worth burning.",
    narrative:
      "Smoke on the horizon — fight, accident, or invitation to ambush on a road you need.\n\nObjective: {objective}. Investigate, mask movement, or steer clear and leave the question open.",
  },
  gen_travel_frozen_bridge: {
    atmosphere: "Ice skins the planks — each tread a small gamble.",
    narrative:
      "Frozen bridge — engineers marked it doubtful; the map marks it necessary.\n\nObjective: {objective}. Test weight, crawl, or find another crossing before the ice remembers spring.",
  },
  gen_travel_slit_trench: {
    atmosphere: "Fresh shovel work smells like wet clay and hurry.",
    narrative:
      "Slit trenches cut the verge — recent, empty for now, not for long.\n\nObjective: {objective}. Avoid the ditch line, overwatch it, or assume someone watches back.",
  },
  gen_supply_ammo_crate: {
    atmosphere: "Oil and brass — a crate that could save the next fight.",
    narrative:
      "Ammo crate off the road — maybe abandoned, maybe bait for greedy crews.\n\nObjective: {objective}. Strip, report, or pass; every round here is one you don't carry later.",
  },
  gen_supply_winter_coat: {
    atmosphere: "Wool and diesel — charity stacked on a tailgate.",
    narrative:
      "Winter coats piled for grabs — quartermaster surplus or somebody's mistake in the mud.\n\nObjective: {objective}. Outfit the crew, share coords, or leave them for men colder than you.",
  },
  gen_supply_fuel_cache: {
    atmosphere: "Jerry cans lined like soldiers waiting for orders.",
    narrative:
      "Division fuel cache — padlocked in theory, open in practice if you know who to ask.\n\nObjective: {objective}. Sign the ledger, siphon quiet, or keep rolling on fumes and nerve.",
  },
  gen_supply_track_pin: {
    atmosphere: "Cold steel pins rattle — the sound of mobility restored.",
    narrative:
      "Track pins in a salvage pile — right size, wrong unit stencil, good enough at 0300.\n\nObjective: {objective}. Swap now, trade later, or mark the grid for recovery teams.",
  },
  gen_supply_med_kit: {
    atmosphere: "Antiseptic cuts through diesel — clean smell in dirty country.",
    narrative:
      "Med kits stacked where a aid station used to be — labels still legible.\n\nObjective: {objective}. Load up, leave some, or radio the location before looters arrive.",
  },
  gen_supply_ration_swap: {
    atmosphere: "Flour dust and coffee grounds — barter currency of the line.",
    narrative:
      "Ration swap on the verge — K-rations for bread, insults for bad trades.\n\nObjective: {objective}. Balance bellies against schedule; hungry crews make loud mistakes.",
  },
  gen_travel_mud_supply: {
    narrative:
      "Supply trucks sunk to their axles — rations and fuel stuck with them.\n\nObjective: {objective}. Tow, pass, or hand-carry; hunger downstream does not wait for mud to dry.",
  },
  gen_travel_wrong_grid: {
    narrative:
      "Artillery falls on a crossroads you need — friendly grid, unfriendly math.\n\nObjective: {objective}. Cease fire, detour, or run the bracket and pray the next round is not yours.",
  },
  gen_travel_convoy_halt: {
    narrative:
      "Column frozen — radios busy, rumors faster than orders, nobody moving until someone decides.\n\nObjective: {objective}. Hold, scout ahead, or break discipline and move on your own hook.",
  },
  gen_supply_artillery_splash: {
    atmosphere: "Shrapnel ticks on the hull like hail that learned to kill.",
    narrative:
      "Supply point under sporadic splash — crates stacked, men ducking between loads.\n\nObjective: {objective}. Grab and go, wait it out, or help them shift stores under fire.",
  },
  gen_supply_water_shortage: {
    atmosphere: "Empty canteens clink — a sound like guilt.",
    narrative:
      "Water detail failed — creek foul, wells dry, throats already planning on ration.\n\nObjective: {objective}. Share, steal, or press on thirsty and pay in constitution.",
  },
  gen_travel_fuel_cache: {
    narrative:
      "Jerry cans in a ditch — unguarded fuel with no signature on the ledger.\n\nObjective: {objective}. Siphon, mark for MPs, or leave it for whoever needs it more than you.",
  },
  gen_travel_pontoon_delay: {
    narrative:
      "Pontoon queue — engineers swear the bridge will hold; the river disagrees quietly.\n\nObjective: {objective}. Wait your turn, scout a ford, or force the crossing and test faith.",
  },
  gen_travel_mine_marker: {
    narrative:
      "Tape and skull posts lean in the wind. Tread marks end in craters three vehicles back.\n\nObjective: {objective}. Follow the safe line, probe on foot, or detour and lose the clock.",
  },
  gen_supply_parts_crate: {
    narrative:
      "Knocked-out column left parts — pins, grease, maybe a sprocket that fits.\n\nObjective: {objective}. Strip quick, share the grid, or roll past; stopping is always a target.",
  },
  gen2_travel_orchard_lane: {
    narrative:
      "Orchard lane — branches scrape the hull like fingers testing paint on both cheeks.\n\nObjective: {objective}. Push, trim, or detour; the column behind you will not wait forever.",
  },
  gen2_travel_sunken_road: {
    narrative:
      "Sunken road — walls of mud, sky a ribbon, every window a gun port until proven otherwise.\n\nObjective: {objective}. Crawl, screen with infantry, or speed and accept the ambush tax.",
  },
  gen2_travel_pontoon_queue: {
    narrative:
      "Half the battalion waits on the bank while engineers swear at the current.\n\nObjective: {objective}. Demand priority, wait, or lend muscle for goodwill and a sooner slot.",
  },
  gen2_travel_signal_cabin: {
    narrative:
      "Rail signal cabin — sooty maps pinned where a phone died weeks ago.\n\nObjective: {objective}. Copy intel, scout the spur, or trust the main trace and save time.",
  },
  gen2_travel_cattle_on_road: {
    narrative:
      "Herd blocks the trace — farmers watch from a ditch, diplomacy measured in minutes.\n\nObjective: {objective}. Horn, herd them off, or bypass through soft ground that eats treads.",
  },
  gen2_travel_demolished_church: {
    narrative:
      "Church rubble cuts the shortest line — sacred ground, tactical ground, same math.\n\nObjective: {objective}. Drive through, go around the cemetery, or overwatch while the column passes.",
  },
  gen2_travel_forest_gap: {
    narrative:
      "Forest gap — timber tight enough to scrape paint off both sides.\n\nObjective: {objective}. Inch, dismount to guide, or reverse and find a wider trace.",
  },
  gen2_supply_river_ford: {
    narrative:
      "River ford marked doubtful — water brown, bottom unknown, bank soft under tread.\n\nObjective: {objective}. Probe, wait for engineers, or risk the wet lane and save an hour.",
  },
  gen2_supply_wire_roll: {
    narrative:
      "Concertina rolls abandoned — useful if you have time to carry them.\n\nObjective: {objective}. Load wire, mark the pile, or keep rolling; weight is also a cost.",
  },
  gen2_supply_oil_drum: {
    narrative:
      "Oil drums by a knocked-out truck — lubricant, fuel, maybe water if you are desperate.\n\nObjective: {objective}. Top off, share coords, or leave them for crews behind you.",
  },
  gen2_supply_field_phone: {
    narrative:
      "Field phone on a dead line — still clicks if the wire holds somewhere.\n\nObjective: {objective}. Test the net, strip cable, or ignore it and trust your own radio.",
  },
  gen2_supply_grave_markers: {
    narrative:
      "Wooden crosses stacked for graves not yet dug — quartermaster of the dead.\n\nObjective: {objective}. Take none, take some for your own, or mark the pile and move on.",
  },
  w19_t2_travel_wire: {
    narrative:
      "Second-pass wire — concertina new enough to gleam under moonlight on the trace.\n\nObjective: {objective}. Probe the gap, part it under tread, or wide detour into ground that may be mined.",
  },
  w19_t2_supply_oil: {
    narrative:
      "Abandoned oil drums at a crossroads — logistics someone else abandoned in a hurry.\n\nObjective: {objective}. Siphon, mark for recovery, or pass; every stop is a bet on snipers.",
  },
};

function patchTravelSupplyEvent(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  const curated = CURATED_TRAVEL_SUPPLY_PROSE[catalogId];
  if (!curated) return ev;

  return {
    ...ev,
    atmosphere: curated.atmosphere ?? ev.atmosphere,
    narrative: curated.narrative ?? ev.narrative,
    stakesNote: curated.stakesNote ?? ev.stakesNote,
    stakes: curated.stakes ?? ev.stakes,
  };
}

/** Curated STAR prose overrides for travel/supply pool events (Wave 24). */
export function patchTravelSupplyProse(catalog: Record<string, RuntimeEvent>): void {
  const patchIds = new Set<string>(Object.keys(CURATED_TRAVEL_SUPPLY_PROSE));
  for (const buckets of [getPoolKindBuckets(), getTier2PoolKindBuckets()]) {
    for (const id of [...buckets.travel, ...buckets.supply]) {
      patchIds.add(id);
    }
  }
  for (const id of patchIds) {
    const ev = catalog[id];
    if (ev) catalog[id] = patchTravelSupplyEvent(ev, id);
  }
}

export function travelSupplyPoolIds(): string[] {
  const t1 = getPoolKindBuckets();
  const t2 = getTier2PoolKindBuckets();
  return [...t1.travel, ...t1.supply, ...t2.travel, ...t2.supply];
}
