import type { MissionBriefArchetype, NarrativeSlide, SeasonPhase } from "../engine/types";

/** Static mission brief slides keyed by archetype (Wave 22 — tight STAR prose). */
export const MISSION_BRIEF_SLIDES: Record<MissionBriefArchetype, readonly NarrativeSlide[]> = {
  generic: [
    {
      sensoryFocus: "sound",
      atmosphere: "Static hisses on the net before anyone speaks.",
      narrative:
        "Another grease-pencil map on a table that used to be a school desk. Division has drawn {objective} over yesterday's mistake.\n\n{tank} is fueled and staged. The crew waits on ten words that cost someone tomorrow.",
      quote: '{cmd}: "Same war. New grid square. Listen close."',
    },
    {
      sensoryFocus: "sight",
      narrative:
        "The objective is blunt on the map: {objective}. Arrows, phase lines, and silence where someone already died proving the last plan.\n\nYou have fuel, ammo, and five names that still answer. That is the arithmetic until the road argues back.",
    },
  ],
  attack: [
    {
      sensoryFocus: "sight",
      atmosphere: "Smoke markers hang over the far treeline — grey ribbons from someone else's try.",
      narrative:
        "Dead ground and shell-scarred fields. You can see the high ground they want and the gullies that swallow treads.\n\nDivision wants momentum before the enemy finishes rearranging. {objective} is the line that keeps the column from stalling in the open.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Artillery rolls in the distance. Closer, track squeal and drivers swearing at mud that wasn't there yesterday.\n\nWhen the whistle goes, {tank} leads or follows — but you do not sit. Attack briefings end with movement or graves.",
      quote: '{gnr}: "First shot wins. After that we argue with physics."',
    },
  ],
  defense: [
    {
      sensoryFocus: "touch",
      atmosphere: "Cold metal through the hatch rim — the tank still holds yesterday's night.",
      narrative:
        "The road narrows to a bridge, a crossroads, or a fold that matters more than it looks. Engineers scratch at wire while you sleep badly.\n\nHold is the word. {objective} means you become geometry — something the enemy spends ammunition to move.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Fields of fire marked in chalk on the glacis. Dead space in red. You can see where probes will come if you read bare trees.\n\nDefend is patience with triggers. {tank} stays hull-down until the math turns ugly for them.",
    },
  ],
  pursuit: [
    {
      sensoryFocus: "smell",
      atmosphere: "Diesel and wet ash — a column that has been running for days.",
      narrative:
        "The enemy moves before they are beaten. The oldest trick on the road: leave traps for men who think victory means speed.\n\n{objective} keeps you on their heels without outrunning fuel or nerve.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Retreating engines when the wind shifts — or nothing, which teaches you to distrust both.\n\nPursuit is hunger with discipline. {tank} pushes until the map says stop or someone ahead proves they still have teeth.",
    },
  ],
  patrol: [
    {
      sensoryFocus: "sight",
      atmosphere: "Low sun turns every hedge into a gun port until proven otherwise.",
      narrative:
        "No grand arrow — just a route, a time window, and grids that need eyes because paper lies.\n\n{objective} is reconnaissance dressed as routine. The column pretends boredom. The crew does not.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Birds stop when engines near. That silence is the only honest intel you get for free.\n\nPatrol means come back with answers, not heroics. {tank} rolls quiet as thirty-five tons allows.",
    },
  ],
  withdrawal: [
    {
      sensoryFocus: "smell",
      atmosphere: "Burnt powder in the rain — someone else's fight dying down the road.",
      narrative:
        "The line is bending, not breaking — a difference only clerks ignore.\n\n{objective} is the corridor you keep open so the column behind you still has a road home.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "Mud pulls at treads in both directions. Every halt feels like surrender until you move again.\n\nWithdrawal is violence in reverse. {tank} covers angles until the last friendly hull clears the bridge.",
    },
  ],
  night_move: [
    {
      sensoryFocus: "sight",
      atmosphere: "Red lens light inside the turret — the world outside reduced to shapes.",
      narrative:
        "Night compresses distance and lies about depth. Drivers read map memory more than terrain.\n\n{objective} must land before dawn or you fight the sun blind. Blackout discipline is not optional.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Every track squeal carries. Every cough in the column sounds like a betrayal.\n\n{cmd} speaks in whispers until metal finds metal. {tank} moves on faith in the man on the left seat.",
    },
  ],
  ammo_hold: [
    {
      sensoryFocus: "touch",
      atmosphere: "HE rounds still warm from the rack — the gunner's hands remember the last fight.",
      narrative:
        "The tray is not empty, but empty is relative on this road. Quartermaster counts twice and still flinches.\n\n{objective} depends on spending metal wisely — one bad engagement and the next day is bayonets and nerve.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Ammo crates stack like prayer candles behind the line. You see how thin the pile is when the canvas flaps open.\n\nHold fire until the target is worth the subtraction. {tank} is a ledger with treads.",
    },
  ],
  final_push: [
    {
      sensoryFocus: "sound",
      atmosphere: "Multiple nets crackle at once — voices overlapping like the war is finishing its sentences.",
      narrative:
        "The map is mostly arrows now. Names on the paper are towns that stopped being towns.\n\n{objective} is one of the last lines before someone declares the road done.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Columns move on three horizons — friend, enemy, and smoke that will not declare itself.\n\nFinal push means spend what you kept for later. {tank} rolls because stopping now costs more than moving.",
      quote: '{cmd}: "One more mission. Then we argue about who goes home first."',
    },
  ],
};

export function archetypeFromBriefingId(briefingId: string): MissionBriefArchetype {
  const suffix = briefingId.replace(/^briefing_/, "");
  const valid: MissionBriefArchetype[] = [
    "generic",
    "attack",
    "defense",
    "pursuit",
    "patrol",
    "withdrawal",
    "night_move",
    "ammo_hold",
    "final_push",
  ];
  if (valid.includes(suffix as MissionBriefArchetype)) return suffix as MissionBriefArchetype;
  return "generic";
}

export function slidesForArchetype(
  archetype: MissionBriefArchetype,
  season: SeasonPhase,
): readonly NarrativeSlide[] {
  const base = MISSION_BRIEF_SLIDES[archetype];
  if (season === "winter" && archetype === "generic") {
    return [
      {
        ...base[0]!,
        atmosphere: "Engine exhaust hangs in cold air — white plumes marking every staged tank.",
      },
      base[1]!,
    ];
  }
  return base;
}
