/**
 * Field Journal discovery catalog (spec §15).
 * Resolved by discovery_stub / record_discovery effects.
 */

import type { FieldJournalEntry, GameState } from "../engine/types";

export interface DiscoveryDef {
  title: string;
  text: string;
}

/** Charm grant + archetype → discovery catalog id. */
export const CHARM_ARCHETYPE_DISCOVERIES: Record<string, string> = {
  "faithful:rosary": "faithful_rosary",
  "dark_comedian:last_cigarette": "comedian_cigarette",
};

export const DISCOVERY_CATALOG: Record<string, DiscoveryDef> = {
  cobra_corridor: {
    title: "Cobra corridor",
    text: "You rode the breakout's wake — dust, fire, and columns that moved like one animal. The map lied. You survived anyway.",
  },
  cologne_duel: {
    title: "Cologne",
    text: "Rubble turned every corner into a kill box. You traded angles for time and came out the far side with the hull still breathing.",
  },
  ve_day_witnessed: {
    title: "Final days",
    text: "Gunfire in the distance like an argument that wouldn't end. You were close enough to taste the end without believing it yet.",
  },
  tiger_wallendorf: {
    title: "Wallendorf",
    text: "A Tiger in a village road is geometry with malice. You met him and left with a story the crew will tell badly for years.",
  },
  dog_returns: {
    title: "The dog came back",
    text: "It found you again — mud on its paws, no owner, no explanation. For a minute the war forgot to be the only thing in the world.",
  },
  same_last_name: {
    title: "Same name",
    text: "Two men on the roster share a last name. Coincidence, family, or something nobody asks about aloud. The crew noticed.",
  },
  thunderbolt_abrams: {
    title: "Thunderbolt",
    text: "The tank's name carries weight. Someone in the column mutters about Abrams and distances and the kind of commanders who don't die young.",
  },
  fury_full_crew: {
    title: "The Fury crew",
    text: "The names line up wrong — too perfect, too cinematic. The Journal records it quietly. No fanfare. Just the names, the tank, and the date.",
  },
  lucky_survivor: {
    title: "Lucky's run",
    text: "Every crew has a Lucky. Not every Lucky makes it. This one's still here.",
  },
  cobra_king: {
    title: "Cobra King",
    text: "The name carries history. Those who know, know.",
  },
  faithful_rosary: {
    title: "He kept it the whole way",
    text: "A rosary with a missing bead — not luck, not superstition, just something held when the world got too loud.",
  },
  padre_irony: {
    title: "Wrong nickname",
    text: "The Dark Comedian answers to Padre. Nobody explains it. Nobody has to. The crew just smiles and moves on.",
  },
  comedian_cigarette: {
    title: "Last cigarette",
    text: "He keeps it in a tin like a punchline that hasn't landed yet. Near-death events will find out if it's funny.",
  },
  alvin_york_names: {
    title: "Names on the roster",
    text: "Alvin York on the loader's tag. Coincidence or providence — the column doesn't stop to decide.",
  },
  fury_commander_collier: {
    title: "Collier on Fury",
    text: "Tank named Fury. Commander's last name Collier. The war doesn't do references. You do.",
  },
  hellcat_tank: {
    title: "Hellcat",
    text: "The name sounds fast even standing still. Someone in the column mutters about luck and speed.",
  },
  iron_mary_tank: {
    title: "Iron Mary",
    text: "Feminine name on brutal steel. The crew treats her like both — machine and witness.",
  },
  campaign_lucky_survived: {
    title: "Lucky made it",
    text: "They called him Lucky. He was. The whole crew walked off the road alive. The Journal keeps the name.",
  },
};

/** Append a catalog discovery to journal if not already present. */
export function appendDiscoveryJournal(
  journal: FieldJournalEntry[],
  catalogId: string,
  logLines: string[],
): FieldJournalEntry[] {
  const discId = `disc_${catalogId}`;
  if (journal.some((j) => j.id === discId)) return journal;
  const disc = getDiscoveryText(catalogId);
  logLines.push(`${disc.title} — ${disc.text}`);
  return [
    ...journal,
    {
      id: discId,
      at: Date.now(),
      text: `${disc.title} — ${disc.text}`,
      kind: "discovery",
    },
  ];
}

export function applyCampaignEndDiscoveries(state: GameState): GameState {
  const living = state.crew.filter((c) => c.hp > 0);
  if (living.length !== 5) return state;
  if (!state.crew.some((c) => c.nickname === "Lucky")) return state;
  const log: string[] = [];
  const fieldJournal = appendDiscoveryJournal(state.fieldJournal, "campaign_lucky_survived", log);
  if (log.length === 0) return state;
  return {
    ...state,
    fieldJournal,
    narrativeLog: [...state.narrativeLog, ...log],
  };
}

export function getDiscoveryText(id: string): { title: string; text: string } {
  const d = DISCOVERY_CATALOG[id];
  if (d) return d;
  return {
    title: id.replaceAll("_", " "),
    text: `Something about this place or this crew will stay in the record: ${id}.`,
  };
}
