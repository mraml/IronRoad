import { missionNarrativeVars } from "./missionNarrativeVars";
import { archetypeFromBriefingId } from "../content/missionBriefs";
import type { GameState } from "./types";

/** Template vars for campaign bookend slides (opener, milestone, epilogue). */
export function bookendVars(s: GameState, missionIndex = s.missionIndex) {
  const m = s.missions[missionIndex];
  const archetype = m?.briefingArchetype ?? archetypeFromBriefingId(m?.briefingEvent.id ?? "briefing_generic");
  return missionNarrativeVars({
    runSeed: s.runSeed,
    missionIndex,
    totalMissions: s.missions.length,
    archetype,
    crew: s.crew,
    tankName: s.tank.name,
    objective: m?.objective ?? "",
  });
}
