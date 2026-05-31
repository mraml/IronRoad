import type { NarrativeSlide, SeasonPhase } from "../engine/types";

/** One-time briefer + place intro prepended to every mission brief. Task/orders come on later slides. */
export function framingSlideForMission(
  _missionIndex: number,
  _totalMissions: number,
  _season: SeasonPhase,
): NarrativeSlide {
  return {
    sensoryFocus: "sight",
    atmosphere: "Rain on canvas and a map that smells like chalk dust and cold coffee.",
    narrative:
      "{briefer} — soil on his cuffs, shoulders like a man who has been awake since the crossing — meets you at {briefingPlace} on this {weekday} morning in {season}. {tank} idles behind the column; he does not waste time on ceremony.",
    quote: '{cmd}: "Copy. The crew\'s listening."',
  };
}
