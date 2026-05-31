import type { MissionBriefArchetype, NarrativeSlide, SeasonPhase } from "../engine/types";

/** Archetype slides — continue the framing scene; no second briefer intro or {briefingPlace}. */
export const MISSION_BRIEF_SLIDES: Record<MissionBriefArchetype, readonly NarrativeSlide[]> = {
  generic: [
    {
      sensoryFocus: "sound",
      atmosphere: "Static hisses on the net before he speaks.",
      narrative:
        "He names the job plain: {objective}. Corrections cover corrections on the paper in front of him — yesterday's plan is already wrong.\n\n{tank} is fueled and staged. The column needs you moving before someone else spends your grid square.",
      quote: '{cmd}: "Same war. New line. We hear you."',
    },
    {
      sensoryFocus: "sight",
      narrative:
        "He taps where arrows and phase lines overlap — you can see where the last try bled out before you arrived.\n\nFive names still answer on {tank}. That is the arithmetic until the road argues back, and the road always argues back.",
    },
  ],
  attack: [
    {
      sensoryFocus: "sight",
      atmosphere:
        "Smoke markers hang over the far treeline — grey ribbons from someone else's failed push.",
      narrative:
        "Artillery rolls in the distance while he points at fortified ground and the gullies that swallow treads. The column needs momentum before the enemy finishes rearranging.\n\nHe orders {tank} to lead the breach: {objective}. Infantry follows through the gap you make or nobody follows at all.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Track squeal and drivers swearing at mud that was not there yesterday. He does not raise his voice; he does not need to.\n\nWhen the whistle goes, {tank} moves — attack briefings end with movement or graves.",
      quote: '{gnr}: "First shot wins. After that we argue with physics."',
    },
  ],
  defense: [
    {
      sensoryFocus: "touch",
      atmosphere: "Cold metal through the hatch rim — {tank} still holds yesterday's night.",
      narrative:
        "Engineers scratch at wire while your crew sleeps badly in the background. Hold is the word he uses twice.\n\n{objective} — you become geometry the enemy spends ammunition to move. {tank} holds the junction until division artillery arrives or until you are told otherwise.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "He walks you through fields of fire marked in chalk on a glacis sketch. Dead space in red. Bare trees tell you where probes will come if you read them honestly.\n\nDefend is patience with triggers. {tank} stays hull-down until the math turns ugly for them — not before.",
    },
  ],
  pursuit: [
    {
      sensoryFocus: "smell",
      atmosphere: "Diesel and wet ash — a column that has been running for days.",
      narrative:
        "He speaks faster, lighter in the voice — the enemy is moving, and moving men make mistakes. Two escape routes show on the paper; both need cutting.\n\nHe orders {tank} to take the road ahead: {objective}. If they get around you, they regroup somewhere worse.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Retreating engines when the wind shifts — or nothing, which teaches you to distrust both. He watches your crew's faces while he talks.\n\nPursuit is hunger with discipline. {tank} pushes until someone ahead proves they still have teeth.",
    },
  ],
  patrol: [
    {
      sensoryFocus: "sight",
      atmosphere: "Low sun turns every hedge into a gun port until proven otherwise.",
      narrative:
        "No grand arrow on the paper — just a route, a time window, and grids that need eyes because paper lies.\n\nHe tells {cmd} the column needs {objective} — reconnaissance dressed as routine. {tank} leads the screen. You are eyes, not a battering ram.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Birds stop when engines near. He pauses until the column noise fades, as if listening for honesty in that silence.\n\nPatrol means return with answers, not heroics. {tank} rolls quiet as thirty-five tons allows — boring is what he wants.",
    },
  ],
  withdrawal: [
    {
      sensoryFocus: "smell",
      atmosphere: "Burnt powder in the rain — someone else's fight dying down the road.",
      narrative:
        "Ground given on purpose, he says; the line is bending, not breaking, and clerks are the only ones who confuse the two.\n\n{tank} is rear guard until the column jumps. He names the corridor you keep open: {objective}. One bad halt and the road home closes behind you.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "Mud pulls at treads in both directions. He does not pretend withdrawal feels like victory.\n\nWithdrawal is violence in reverse. {tank} covers angles until the last friendly hull clears — then panic is a weapon the enemy does not have to fire.",
      quote: '{cmd}: "We leave in order. Nobody runs."',
    },
  ],
  night_move: [
    {
      sensoryFocus: "sight",
      atmosphere: "Red lens light inside the turret — the world outside reduced to shapes.",
      narrative:
        "Night compresses distance and lies about depth; drivers will read memory more than terrain. He orders {objective} before dawn — blackout drive, interval discipline, no headlights unless hell breaks loose.\n\n{tank} leads the second section. If you light up, you die; if you fall behind, you die slower.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Every track squeal carries in the dark. He speaks just above a whisper until he is sure the net is clear.\n\n{cmd} will speak in whispers until metal finds metal. {tank} moves on faith in the man in the left seat — and on the clock he taps with one finger.",
    },
  ],
  ammo_hold: [
    {
      sensoryFocus: "touch",
      atmosphere:
        "HE rounds still warm from the rack — the gunner's hands remember the last fight.",
      narrative:
        "Hold orders and supply tallies say the same thing: spend carefully. He tells {cmd} {tank} anchors the junction for {objective}.\n\nEvery round is a loan — one bad engagement and the next day is bayonets and nerve.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Canvas flaps open on crates stacked like prayer candles behind the line. He lets you see how thin the pile is before he closes the flap again.\n\nHold fire until the target is worth the subtraction. {tank} is a ledger with treads.",
    },
  ],
  final_push: [
    {
      sensoryFocus: "sound",
      atmosphere: "Multiple nets crackle at once — voices finishing each other's sentences.",
      narrative:
        "Reserves are thin on the board. He names {objective} and skips poetry.\n\nOne more corridor, he says, then someone goes home — if you hold speed and do not stop for souvenirs.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Staged hulls stretch down the trace — friend, enemy, and smoke that will not declare itself. He watches {tank} with the rest and does not soften the words.\n\nSpend what you kept for later, he tells {cmd}. Stopping now costs more than moving.",
      quote: "{cmd}: \"Tray's full enough. We'll spend it like we mean to finish.\"",
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
        atmosphere:
          "Engine exhaust hangs in cold air — white plumes marking every staged tank before he speaks.",
      },
      base[1]!,
    ];
  }
  return base;
}
