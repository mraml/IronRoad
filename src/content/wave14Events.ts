import type { RuntimeEvent } from "../engine/types";
import type { PoolKindBuckets } from "./poolKinds";
import { registerPoolKindsAndRebuildPool } from "./poolKinds";

/** Wave 14 — rank friction NPC beats (§3.2a). */
export const WAVE14_EVENTS: Record<string, RuntimeEvent> = {
  npc_mp_rank_check: {
    id: "npc_mp_rank_check",
    kind: "npc_conversation",
    atmosphere: "Brassard and clipboard. The war's paperwork catches up in the mud.",
    narrative:
      "MPs at a crossroads — one corporal with a list, one with a carbine that never points at the ground.\n\nThey're comparing ranks on the roster to the men in the hatch. Your loader's chevrons outrank whoever {cmd} is today on paper.",
    preChoiceNpc: {
      speaker: "MP Corporal",
      line: "Who's in command of this vehicle? I need a name that matches the stripes I see.",
    },
    choices: [
      {
        id: "straight",
        label: "Commander states the chain — voice leader speaks.",
        role: "commander",
        dialogueLine: "{cmd} on the net. Ask your questions.",
        outcomeText: "The MP listens. The roster gets a correction in pencil. Nobody gets arrested. Small victory.",
        npcReply: "\"Fine. Move. And keep your NCOs where I can see them.\"",
        effects: [{ op: "mod_constitution", role: "commander", delta: 4 }],
      },
      {
        id: "deflect",
        label: "Loader plays dumb — stripes are laundry mistake.",
        role: "loader",
        dialogueLine: "Must've grabbed the wrong jacket, Sergeant. Happens.",
        outcomeText: "The MP snorts. Not friendly, not hostile. You roll before he decides which.",
        npcReply: "\"Get it fixed at the next halt. I'm not writing you up today.\"",
        effects: [
          { op: "mod_constitution", role: "loader", delta: -3 },
          { op: "mod_all_constitution", delta: 2 },
        ],
      },
      {
        id: "humor",
        label: "Gunner cracks wise — tension breaker.",
        role: "gunner",
        dialogueLine: "Sir, in this tank rank is measured in who still has dry socks.",
        outcomeText: "The corporal almost smiles. Almost. The checkpoint opens.",
        npcReply: "\"Dry socks. Christ. Go on.\"",
        effects: [{ op: "mod_all_constitution", delta: 6 }],
      },
    ],
  },
  npc_officer_lt_tank: {
    id: "npc_officer_lt_tank",
    kind: "npc_conversation",
    atmosphere: "Polished boots beside a hull that still smells like burning oil.",
    narrative:
      "A 2nd Lt. from Battalion — clean map case, younger than your loader — wants {objective} done his way, on his clock.\n\nYour Sherman looks like what it is: a machine that has been arguing with Europe for months.",
    preChoiceNpc: {
      speaker: "2nd Lt. Harmon",
      line: "You're the tank? My orders supersede whatever local nonsense you've been running. Understood?",
    },
    choices: [
      {
        id: "defer",
        label: "Commander defers on the radio — live to fight.",
        role: "commander",
        dialogueLine: "Understood, Lieutenant. We'll be on your line.",
        outcomeText: "He leaves satisfied. The crew exhales when the jeep dust settles.",
        npcReply: "\"See that you are. And try to look like soldiers, not refugees.\"",
        effects: [{ op: "mod_all_constitution", delta: 3 }],
      },
      {
        id: "insist",
        label: "Commander insists on crew experience — quiet steel.",
        role: "commander",
        dialogueLine: "We'll read your map, sir. We won't read it blind.",
        outcomeText: "A stare. Then a nod. Officers need wins more than arguments.",
        npcReply: "\"…Fine. But I'm on your frequency. Don't make me regret it.\"",
        effects: [
          { op: "mod_constitution", role: "commander", delta: 6 },
          { op: "mod_constitution", role: "gunner", delta: -2 },
        ],
      },
      {
        id: "humor",
        label: "Driver mutters loud enough — beat-up tank truth.",
        role: "driver",
        dialogueLine: "Yes sir. We'll polish the mud after we survive the crossing.",
        outcomeText: "Harmon's mouth twitches. He leaves without a comeback.",
        npcReply: "\"…Just be there at H-hour.\"",
        effects: [{ op: "mod_constitution", role: "driver", delta: 5 }],
      },
    ],
  },
  npc_correspondent_rank: {
    id: "npc_correspondent_rank",
    kind: "npc_conversation",
    atmosphere: "Flash powder and notebook. History written at the wrong angle.",
    narrative:
      "A war correspondent with a Speed Graphic and no weapon — he photographs the tank and asks who commands.\n\nHe aims the lens at the loader first. The stripes lie. {cmd} is off to the side, tired and very much in charge.",
    preChoiceNpc: {
      speaker: "Mr. Klein (Stars & Stripes)",
      line: "Who's the lieutenant here? I need a hero angle for the home edition.",
    },
    choices: [
      {
        id: "correct",
        label: "Commander steps into frame — correct the record.",
        role: "commander",
        dialogueLine: "Wrong man. I'm {cmd}. Take the picture or don't.",
        outcomeText: "Klein shrugs, shoots anyway. The caption will be wrong in Ohio. You tried.",
        npcReply: "\"Thanks. Honesty doesn't sell papers, but it's refreshing.\"",
        effects: [{ op: "journal", text: "Corrected a correspondent on command.", kind: "moment" }],
      },
      {
        id: "refuse",
        label: "Loader waves him off — no photos today.",
        role: "loader",
        dialogueLine: "Not today. We aren't a monument yet.",
        outcomeText: "Klein pockets the camera. Respects the refusal more than the pose.",
        npcReply: "\"Fair. The war's ugly enough without me making it worse.\"",
        effects: [{ op: "mod_all_constitution", delta: 4 }],
      },
      {
        id: "pose",
        label: "Let him shoot — crew humor as armor.",
        role: "gunner",
        dialogueLine: "Snap it. We'll mail him a better rank later.",
        outcomeText: "Flash pops. The crew blinks. Morale oddly up.",
        npcReply: "\"You'll make the late edition. Try to look alive.\"",
        effects: [
          { op: "mod_all_constitution", delta: 8 },
          { op: "mod_constitution", role: "gunner", delta: -3 },
        ],
      },
    ],
  },
};

export const WAVE14_NPC_IDS = [
  "npc_mp_rank_check",
  "npc_officer_lt_tank",
  "npc_correspondent_rank",
] as const;

export const WAVE14_POOL_KIND_BUCKETS: Partial<PoolKindBuckets> = {
  npc: [...WAVE14_NPC_IDS],
};

export function applyWave14PoolRegistration(): string[] {
  return registerPoolKindsAndRebuildPool(WAVE14_POOL_KIND_BUCKETS);
}
