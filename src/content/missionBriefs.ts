import type { MissionBriefArchetype, NarrativeSlide, SeasonPhase } from "../engine/types";

/** Static mission brief slides — NPC-led briefing scenes (Wave 27). */
export const MISSION_BRIEF_SLIDES: Record<MissionBriefArchetype, readonly NarrativeSlide[]> = {
  generic: [
    {
      sensoryFocus: "sound",
      atmosphere: "Static hisses on the net before {briefer} speaks.",
      narrative:
        "{briefer} spreads a grease-pencil map across a table that used to be a school desk at {briefingPlace}. Corrections cover corrections; yesterday's plan is already wrong.\n\nHe looks at {cmd} and names the job plain: {objective}. {tank} is fueled and staged — the column needs you moving before someone else spends your grid square.",
      quote: '{cmd}: "Same war. New line on the map. We hear you."',
    },
    {
      sensoryFocus: "sight",
      narrative:
        "{briefer} taps the trace where arrows and phase lines overlap. You can see where the last try bled out before you arrived.\n\nFive names still answer on {tank}. He tells you that is the arithmetic until the road argues back — and the road always argues back.",
    },
  ],
  attack: [
    {
      sensoryFocus: "sight",
      atmosphere: "Smoke markers hang over the far treeline — grey ribbons from someone else's failed push.",
      narrative:
        "{briefer} — jaw set, boots still wet — briefs you at {briefingPlace} while artillery rolls in the distance. He points at fortified ground and the gullies that swallow treads.\n\nThe column needs momentum before the enemy finishes rearranging. He orders {tank} to lead the breach: {objective}. Infantry follows through the gap you make or nobody follows at all.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Closer, track squeal and drivers swearing at mud that was not there yesterday. {briefer} does not raise his voice; he does not need to.\n\nWhen the whistle goes, {tank} moves — attack briefings end with movement or graves, and he expects you to know which one you are buying today.",
      quote: '{gnr}: "First shot wins. After that we argue with physics."',
    },
  ],
  defense: [
    {
      sensoryFocus: "touch",
      atmosphere: "Cold metal through the hatch rim — {tank} still holds yesterday's night.",
      narrative:
        "{briefer} meets you at {briefingPlace} where the road narrows to a bridge that matters more than it looks on paper. Engineers scratch at wire while your crew sleeps badly in the background.\n\nHold is the word he uses twice. {objective} — you become geometry the enemy spends ammunition to move. {tank} holds the junction until division artillery arrives or until you are told otherwise.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "He walks you through fields of fire marked in chalk on a glacis sketch. Dead space in red. Bare trees tell you where probes will come if you read them honestly.\n\nDefend is patience with triggers, he says. {tank} stays hull-down until the math turns ugly for them — not before.",
    },
  ],
  pursuit: [
    {
      sensoryFocus: "smell",
      atmosphere: "Diesel and wet ash — a column that has been running for days.",
      narrative:
        "{briefer} speaks faster at {briefingPlace}, lighter in the voice — the enemy is moving, and moving men make mistakes. His map shows a retreating column with two escape routes.\n\nHe orders {tank} to cut the road ahead: {objective}. If they get around you, they regroup somewhere worse and this almost-winning feeling turns into a bill.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Retreating engines when the wind shifts — or nothing, which teaches you to distrust both. {briefer} watches your crew's faces while he talks.\n\nPursuit is hunger with discipline, he says. {tank} pushes until the map says stop or someone ahead proves they still have teeth.",
    },
  ],
  patrol: [
    {
      sensoryFocus: "sight",
      atmosphere: "Low sun turns every hedge into a gun port until proven otherwise.",
      narrative:
        "{briefer} keeps his voice low at {briefingPlace}. No grand arrow on his map — just a route, a time window, and grids that need eyes because paper lies.\n\nHe tells {cmd} the column needs {objective} — reconnaissance dressed as routine. {tank} leads the screen. You are eyes, not a battering ram; see it, report it, come back.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Birds stop when engines near. {briefer} pauses until the column noise fades, as if listening for the honesty in that silence.\n\nPatrol means return with answers, not heroics, he says. {tank} rolls quiet as thirty-five tons allows — boring is what he wants from you.",
    },
  ],
  withdrawal: [
    {
      sensoryFocus: "smell",
      atmosphere: "Burnt powder in the rain — someone else's fight dying down the road.",
      narrative:
        "{briefer} — road-stained scarf, watch in his hand like scripture — spreads withdrawal maps at {briefingPlace}. Ground given on purpose, he says; the line is bending, not breaking, and clerks are the only ones who confuse the two.\n\n{tank} is rear guard until the column jumps. He names the corridor you keep open: {objective}. One bad halt and the road home closes behind you.",
    },
    {
      sensoryFocus: "touch",
      narrative:
        "Mud pulls at treads in both directions. {briefer} does not pretend withdrawal feels like victory.\n\nWithdrawal is violence in reverse, he tells {cmd}. {tank} covers angles until the last friendly hull clears the bridge — then you are the last treads on this road, and panic is a weapon the enemy does not have to fire.",
      quote: '{cmd}: "We leave in order. Nobody runs."',
    },
  ],
  night_move: [
    {
      sensoryFocus: "sight",
      atmosphere: "Red lens light inside the turret — the world outside reduced to shapes.",
      narrative:
        "{briefer} briefs under red light at {briefingPlace}. Night compresses distance and lies about depth; drivers will read map memory more than terrain.\n\nHe orders {objective} before dawn — blackout drive, interval discipline, no headlights unless hell breaks loose. {tank} leads the second section. If you light up, you die; if you fall behind, you die slower.",
    },
    {
      sensoryFocus: "sound",
      narrative:
        "Every track squeal carries in the dark. {briefer} speaks in a voice just above a whisper until he is sure the net is clear.\n\n{cmd} will speak in whispers until metal finds metal, he says. {tank} moves on faith in the man on the left seat — and on the clock he taps with one finger.",
    },
  ],
  ammo_hold: [
    {
      sensoryFocus: "touch",
      atmosphere: "HE rounds still warm from the rack — the gunner's hands remember the last fight.",
      narrative:
        "{briefer} counts ammo on a board at {briefingPlace} and does not like what he sees. Hold orders and supply tallies say the same thing: spend carefully.\n\nHe tells {cmd} {tank} anchors the junction for {objective}. Every round is a loan — one bad engagement and the next day is bayonets and nerve.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Canvas flaps open on crates stacked like prayer candles behind the line. {briefer} lets you see how thin the pile is before he closes the flap again.\n\nHold fire until the target is worth the subtraction, he says. {tank} is a ledger with treads, and he will know if you spend like tourists.",
    },
  ],
  final_push: [
    {
      sensoryFocus: "sound",
      atmosphere: "Multiple nets crackle at once — voices finishing each other's sentences.",
      narrative:
        "{briefer} — polished boots at {briefingPlace}, voice carrying the weight of a revised order — spreads a map that is mostly arrows now. Town names on the paper are towns that stopped being towns.\n\nHe names {objective} on the grease pencil and skips poetry. Reserves are thin on the board. One more line on the map, he says, then someone goes home.",
    },
    {
      sensoryFocus: "sight",
      narrative:
        "Columns move on three horizons — friend, enemy, smoke that will not declare itself. {briefer} watches {tank} staged with the rest and does not soften the words.\n\nFinal push means spend what you kept for later. Hold speed, hold intervals, do not stop for souvenirs. Stopping now costs more than moving.",
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
        atmosphere: "Engine exhaust hangs in cold air — white plumes marking every staged tank before {briefer} speaks.",
      },
      base[1]!,
    ];
  }
  return base;
}
