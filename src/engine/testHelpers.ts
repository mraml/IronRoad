import { resolveCampaignOpenerPages } from "../content/campaignOpeners";
import { EVENT_CATALOG } from "../content/eventsCatalog";
import { getEncounterStep, choicesForEncounterStep } from "./encounterFlow";
import { bookendVars } from "./bookendVars";
import { reduceGame } from "./reducer";
import { formatEventStrings, narrativeVars } from "./template";
import type {
  ActiveMission,
  DebriefAction,
  EnvironmentId,
  GameState,
  PlaySub,
  RuntimeEvent,
} from "./types";

/** Test helper: one-day mission preserving areaEntry from generated campaign. */
export function singleDayMission(
  mission: ActiveMission,
  events: RuntimeEvent[],
  environment: EnvironmentId = "clear",
): ActiveMission {
  const day = mission.days[0]!;
  return {
    ...mission,
    days: [{ ...day, environment, events }],
  };
}

/** Install a catalog event as the only event on mission 0 day 0 at choose step. */
export function installEvent(
  s: GameState,
  evId: string,
  step: "choose" | "narrative" = "choose",
): GameState {
  const m0 = s.missions[0]!;
  const vars = narrativeVars(s.crew, s.tank.name, m0.objective);
  const ev = formatEventStrings(structuredClone(EVENT_CATALOG[evId]!), vars);
  const slimMission = singleDayMission(m0, [ev]);
  return {
    ...s,
    missions: [slimMission, ...s.missions.slice(1)],
    meta: { t: "play", sub: { t: "event", day: 0, eventIndex: 0, step } },
  };
}

function eventForSub(s: GameState, sub: PlaySub): RuntimeEvent | undefined {
  if (s.meta.t !== "play") return undefined;
  const m = s.missions[s.missionIndex];
  if (!m) return undefined;
  if (sub.t === "event") return m.days[sub.day]?.events[sub.eventIndex];
  if (sub.t === "foot") return s.footEvents?.[sub.index];
  if (sub.t === "briefing") return m.briefingEvent;
  return undefined;
}

export function advanceCampaignOpener(s: GameState): GameState {
  if (s.meta.t !== "play" || s.meta.sub.t !== "campaign_opener") return s;
  const pages = resolveCampaignOpenerPages(s.openerVariant ?? 0, bookendVars(s, 0));
  let state = s;
  for (let i = 0; i < pages.length; i++) {
    if (state.meta.t !== "play" || state.meta.sub.t !== "campaign_opener") break;
    state = reduceGame(state, { type: "CAMPAIGN_OPENER_CONTINUE" });
  }
  return state;
}

export function advanceMilestoneBeat(s: GameState): GameState {
  let state = s;
  for (let guard = 0; guard < 4; guard++) {
    if (state.meta.t !== "play" || state.meta.sub.t !== "milestone_beat") break;
    state = reduceGame(state, { type: "MILESTONE_CONTINUE" });
  }
  return state;
}

export function advanceMissionBriefToBriefing(s: GameState): GameState {
  if (s.meta.t !== "play" || s.meta.sub.t !== "mission_brief") return s;
  const pages = s.missions[s.missionIndex]!.missionBriefPages.length;
  let state = s;
  for (let i = 0; i < pages; i++) {
    if (state.meta.t !== "play" || state.meta.sub.t !== "mission_brief") break;
    state = reduceGame(state, { type: "MISSION_BRIEF_CONTINUE" });
  }
  return state;
}

/** Briefing narrative → first ack choice → outcome (handles react/follow-up when present). */
export function advanceThroughBriefing(s: GameState): GameState {
  let state = s;
  if (state.meta.t !== "play" || state.meta.sub.t !== "briefing") return state;

  state = reduceGame(state, { type: "EVENT_CONTINUE" });
  const ack = state.missions[state.missionIndex]!.briefingEvent.choices[0]!.id;
  state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: ack });

  if (
    state.meta.t === "play" &&
    state.meta.sub.t === "briefing" &&
    state.meta.sub.step === "react"
  ) {
    state = reduceGame(state, { type: "EVENT_CONTINUE" });
    const fu = state.missions[state.missionIndex]!.briefingEvent.choices[0]!.followUpChoices?.find(
      (c) => !c.returnToPrimary,
    );
    if (fu) state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: fu.id });
  }

  if (state.meta.t === "play" && state.meta.sub.t === "briefing") {
    state = reduceGame(state, { type: "OUTCOME_CONTINUE" });
  }
  return state;
}

/** Opener → milestone (if any) → mission brief → briefing ack → area entry. */
export function advanceMissionBookends(s: GameState): GameState {
  let state = reduceGame(s, { type: "CONTINUE_AFTER_CREW" });
  state = advanceCampaignOpener(state);
  state = advanceMilestoneBeat(state);
  state = advanceMissionBriefToBriefing(state);
  state = advanceThroughBriefing(state);
  return state;
}

/** Full bookend stack through day intro to first event beat. */
export function reachFirstEventNarrative(s: GameState): GameState {
  let state = advanceMissionBookends(s);
  if (state.meta.t !== "play") return state;
  if (state.meta.sub.t === "area_entry") {
    state = reduceGame(state, { type: "AREA_ENTRY_CONTINUE" });
  }
  if (state.meta.t === "play" && state.meta.sub.t === "day_intro") {
    state = reduceGame(state, { type: "DAY_INTRO_CONTINUE" });
  }
  return state;
}

/** Advance reducer until predicate matches or guard exhausted. */
export function playUntil(
  s: GameState,
  matches: (state: GameState) => boolean,
  maxSteps = 80,
): GameState {
  let state = s;
  for (let i = 0; i < maxSteps; i++) {
    if (matches(state)) return state;
    if (state.meta.t !== "play") break;

    const sub = state.meta.sub;
    const step = getEncounterStep(sub);

    if (sub.t === "campaign_opener") {
      state = reduceGame(state, { type: "CAMPAIGN_OPENER_CONTINUE" });
      continue;
    }
    if (sub.t === "milestone_beat") {
      state = reduceGame(state, { type: "MILESTONE_CONTINUE" });
      continue;
    }
    if (sub.t === "mission_brief") {
      state = reduceGame(state, { type: "MISSION_BRIEF_CONTINUE" });
      continue;
    }
    if (sub.t === "area_entry") {
      state = reduceGame(state, { type: "AREA_ENTRY_CONTINUE" });
      continue;
    }
    if (sub.t === "day_intro") {
      state = reduceGame(state, { type: "DAY_INTRO_CONTINUE" });
      continue;
    }
    if (sub.t === "between_missions") {
      if (sub.socialStep) {
        const step = sub.socialStep;
        if (step === "narrative") {
          state = reduceGame(state, { type: "EVENT_CONTINUE" });
          continue;
        }
        if (step === "outcome") {
          state = reduceGame(state, { type: "OUTCOME_CONTINUE" });
          continue;
        }
        if (step === "choose" || step === "react") {
          const ev = state.socialBeat;
          if (ev && step === "choose") {
            const pick = ev.choices.find((c) => !c.flavorOnly) ?? ev.choices[0];
            if (pick) state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: pick.id });
          } else if (step === "react") {
            state = reduceGame(state, { type: "EVENT_CONTINUE" });
          }
          continue;
        }
      }
      state = reduceGame(state, { type: "BETWEEN_MISSIONS_CONTINUE" });
      continue;
    }
    if (sub.t === "foot" || sub.t === "tank_replacement") {
      const step = getEncounterStep(sub);
      if (step === "narrative") {
        state = reduceGame(state, { type: "EVENT_CONTINUE" });
        continue;
      }
      if (step === "outcome") {
        state = reduceGame(state, { type: "OUTCOME_CONTINUE" });
        continue;
      }
      if (step === "choose") {
        const ev = sub.t === "foot" ? state.footEvents?.[sub.index] : state.tankReplacementBeat;
        const pick = ev?.choices.find((c) => !c.flavorOnly) ?? ev?.choices[0];
        if (pick) state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: pick.id });
        continue;
      }
    }
    if (sub.t === "debrief") {
      state = reduceGame(state, { type: "DEBRIEF_ACTION", action: "rest" satisfies DebriefAction });
      continue;
    }
    if (step === "narrative") {
      state = reduceGame(state, { type: "EVENT_CONTINUE" });
      continue;
    }
    if (step === "stance") {
      state = reduceGame(state, { type: "CHOOSE_STANCE", stance: "push" });
      continue;
    }
    if (step === "react") {
      state = reduceGame(state, { type: "EVENT_CONTINUE" });
      continue;
    }
    if (step === "outcome") {
      state = reduceGame(state, { type: "OUTCOME_CONTINUE" });
      continue;
    }
    if (step === "choose" || step === "followup_choose") {
      const ev = eventForSub(state, sub);
      if (!ev) break;
      const choices = choicesForEncounterStep(state, ev);
      const pick = choices.find((c) => !c.flavorOnly && !c.returnToPrimary) ?? choices[0];
      if (!pick) break;
      state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: pick.id });
      continue;
    }
    break;
  }
  return state;
}

/** @deprecated Prefer playUntil with state predicate */
export function playUntilStep(
  s: GameState,
  matches: (sub: PlaySub) => boolean,
  maxSteps = 80,
): GameState {
  return playUntil(s, (state) => state.meta.t === "play" && matches(state.meta.sub), maxSteps);
}

/** Advance through narrative and stance when present. */
export function advanceToChoose(s: GameState): GameState {
  let state = s;
  for (let guard = 0; guard < 6; guard++) {
    if (state.meta.t !== "play") break;
    const step = getEncounterStep(state.meta.sub);
    if (step === "narrative") {
      state = reduceGame(state, { type: "EVENT_CONTINUE" });
      continue;
    }
    if (step === "stance") {
      state = reduceGame(state, { type: "CHOOSE_STANCE", stance: "push" });
      continue;
    }
    break;
  }
  return state;
}

/** Resolve a primary choice through react/follow-up or tactical turns until outcome (for tests). */
export function resolveChoiceToOutcome(s: GameState, choiceId: string): GameState {
  let state = advanceToChoose(s);
  for (let guard = 0; guard < 12; guard++) {
    if (state.meta.t !== "play") break;
    const sub = state.meta.sub;
    const step = getEncounterStep(sub);
    if (step === "outcome" || step === undefined) break;
    if (step === "react") {
      state = reduceGame(state, { type: "EVENT_CONTINUE" });
      continue;
    }
    if (step === "followup_choose") {
      const ev = eventForSub(state, sub);
      const primaryId = state.pendingEncounter?.primaryChoiceId;
      const primary = ev?.choices.find((c) => c.id === primaryId);
      const follow =
        primary?.followUpChoices?.find((c) => !c.returnToPrimary && !c.flavorOnly) ??
        primary?.followUpChoices?.find((c) => !c.returnToPrimary) ??
        primary?.followUpChoices?.[0];
      if (!follow) break;
      state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: follow.id });
      continue;
    }
    if (step === "choose") {
      const ev = eventForSub(state, sub);
      if (!ev) break;
      const choices = choicesForEncounterStep(state, ev);
      const pick =
        choices.find((c) => c.id === choiceId) ??
        choices.find((c) => !c.flavorOnly && !c.returnToPrimary) ??
        choices[0];
      if (!pick) break;
      state = reduceGame(state, { type: "CHOOSE_OPTION", choiceId: pick.id });
      continue;
    }
    break;
  }
  return state;
}

const VALID_PLAY_SUB_TYPES = new Set<PlaySub["t"]>([
  "campaign_opener",
  "milestone_beat",
  "campaign_epilogue",
  "mission_brief",
  "briefing",
  "area_entry",
  "day_intro",
  "event",
  "debrief",
  "between_missions",
  "tank_replacement",
  "foot",
  "end",
]);

/** Smoke-test invariants on current play state. */
export function assertPlayInvariants(state: GameState, context: string): void {
  if (state.meta.t !== "play") return;
  if (!VALID_PLAY_SUB_TYPES.has(state.meta.sub.t)) {
    throw new Error(`${context}: invalid playSub ${JSON.stringify(state.meta.sub)}`);
  }
}

/** Collect formatted strings visible in current beat for token leak checks. */
export function visibleBeatStrings(state: GameState): string[] {
  if (state.meta.t !== "play") return [];
  const m = state.missions[state.missionIndex];
  if (!m) return [];
  const sub = state.meta.sub;
  const out: string[] = [];

  if (sub.t === "mission_brief") {
    const slide = m.missionBriefPages[sub.page];
    if (slide) out.push(slide.atmosphere ?? "", slide.narrative, slide.quote ?? "");
  }
  if (sub.t === "briefing") {
    out.push(
      m.briefingEvent.narrative,
      m.briefingEvent.atmosphere ?? "",
      m.briefingEvent.quote ?? "",
    );
  }
  if (sub.t === "area_entry" && m.days[sub.day]?.areaEntry) {
    const ae = m.days[sub.day]!.areaEntry!;
    out.push(ae.atmosphere ?? "", ae.narrative);
  }
  if (sub.t === "event") {
    const ev = m.days[sub.day]?.events[sub.eventIndex];
    if (ev) out.push(ev.narrative, ev.atmosphere ?? "");
  }
  return out.filter(Boolean);
}
