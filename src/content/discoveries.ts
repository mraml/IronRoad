/**
 * Field Journal discovery catalog (spec §15).
 * Resolved by discovery_stub / record_discovery effects.
 */

export interface DiscoveryDef {
  title: string;
  text: string;
}

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
};

export function getDiscoveryText(id: string): { title: string; text: string } {
  const d = DISCOVERY_CATALOG[id];
  if (d) return d;
  return {
    title: id.replaceAll("_", " "),
    text: `Something about this place or this crew will stay in the record: ${id}.`,
  };
}
