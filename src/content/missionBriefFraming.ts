import type { NarrativeSlide, SeasonPhase } from "../engine/types";

/** Situational header slide prepended to every mission brief (Wave 26). */
export function framingSlideForMission(
  missionIndex: number,
  _totalMissions: number,
  _season: SeasonPhase,
): NarrativeSlide {
  return {
    sensoryFocus: "sight",
    atmosphere: "Battalion CP — grease pencil on a map that still smells like chalk dust.",
    narrative:
      "{weekday}, {dateLabel} · grid {placeGrid} · {theater}. The objective is written twice: once on paper, once in {cmd}'s face.\n\n{tank} is staged with the column. S-2 says {objective} before the coffee goes cold — {season} does not wait on paperwork.",
    quote: 'Battalion S-2: "{objective}. You have until {season} argues otherwise."',
  };
}
