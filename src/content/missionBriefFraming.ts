import type { NarrativeSlide, SeasonPhase } from "../engine/types";

/** NPC-led situational opener prepended to every mission brief (Wave 27). */
export function framingSlideForMission(
  _missionIndex: number,
  _totalMissions: number,
  _season: SeasonPhase,
): NarrativeSlide {
  return {
    sensoryFocus: "sight",
    atmosphere: "Rain on canvas and a map that smells like chalk dust and cold coffee.",
    narrative:
      "{briefer} — soil on his cuffs, shoulders like a man who has been awake since the crossing — meets you at {briefingPlace} on this {weekday} morning in {season}. {tank} idles behind you with the column; he does not waste time on ceremony.\n\nHe tells {cmd} what the battalion needs and why the road east of here still matters: {objective}. The fight does not wait for paperwork, and someone already paid for the grid square you are standing on.",
    quote: '{cmd}: "Copy. The crew\'s listening."',
  };
}
