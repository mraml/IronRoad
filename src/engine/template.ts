import { resolveVoiceLeader } from "../content/ranks";
import { seasonProseTag } from "../content/areaEntries";
import type {
  AreaEntryBeat,
  CrewMember,
  EventChoice,
  NarrativeSlide,
  Role,
  RuntimeEvent,
  SeasonPhase,
} from "./types";

function nickByRole(crew: CrewMember[], role: Role): string {
  return crew.find((c) => c.role === role)?.nickname ?? role;
}

function nickByArchetype(crew: CrewMember[], archetypeId: string): string {
  return crew.find((c) => c.archetypeId === archetypeId)?.nickname ?? archetypeId;
}

export interface NarrativeTemplateVars extends Record<string, string> {
  tank: string;
  objective: string;
  cmd: string;
  gnr: string;
  drv: string;
  asst: string;
  ldr: string;
  kid: string;
  cyn: string;
  place: string;
  placeGrid: string;
  season: string;
  weekday: string;
  dateLabel: string;
  theater: string;
  missionNum: string;
  missionsTotal: string;
}

export function narrativeVars(
  crew: CrewMember[],
  tankName: string,
  objective: string,
  extras: Partial<NarrativeTemplateVars> = {},
): NarrativeTemplateVars {
  return {
    tank: tankName,
    objective,
    cmd: resolveVoiceLeader(crew)?.nickname ?? nickByRole(crew, "commander"),
    gnr: nickByRole(crew, "gunner"),
    drv: nickByRole(crew, "driver"),
    asst: nickByRole(crew, "asst_driver"),
    ldr: nickByRole(crew, "loader"),
    kid: nickByArchetype(crew, "kid"),
    cyn: nickByArchetype(crew, "cynical_one"),
    place: extras.place ?? "the sector",
    placeGrid: extras.placeGrid ?? "441",
    season: extras.season ?? "autumn",
    weekday: extras.weekday ?? "Wed",
    dateLabel: extras.dateLabel ?? "12 Jun",
    theater: extras.theater ?? "ETO 1944–45",
    missionNum: extras.missionNum ?? "1",
    missionsTotal: extras.missionsTotal ?? "4",
    ...extras,
  };
}

export function substituteTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

function formatChoice(ch: EventChoice, vars: Record<string, string>): EventChoice {
  return {
    ...ch,
    label: substituteTemplate(ch.label, vars),
    outcomeText: substituteTemplate(ch.outcomeText, vars),
    dialogueLine: ch.dialogueLine ? substituteTemplate(ch.dialogueLine, vars) : undefined,
    npcReply: ch.npcReply ? substituteTemplate(ch.npcReply, vars) : undefined,
    reactionBeat: ch.reactionBeat ? substituteTemplate(ch.reactionBeat, vars) : undefined,
    choiceHint: ch.choiceHint ? substituteTemplate(ch.choiceHint, vars) : undefined,
    followUpChoices: ch.followUpChoices?.map((fu) => formatChoice(fu, vars)),
  };
}

export function formatNarrativeSlide(
  slide: NarrativeSlide,
  vars: Record<string, string>,
): NarrativeSlide {
  return {
    ...slide,
    atmosphere: slide.atmosphere ? substituteTemplate(slide.atmosphere, vars) : undefined,
    narrative: substituteTemplate(slide.narrative, vars),
    quote: slide.quote ? substituteTemplate(slide.quote, vars) : undefined,
  };
}

export function formatAreaEntry(
  entry: AreaEntryBeat,
  vars: Record<string, string>,
): AreaEntryBeat {
  return {
    ...entry,
    placeName: substituteTemplate(entry.placeName, vars),
    atmosphere: substituteTemplate(entry.atmosphere, vars),
    narrative: substituteTemplate(entry.narrative, vars),
  };
}

export function formatEventStrings(
  ev: RuntimeEvent,
  vars: Record<string, string>,
): RuntimeEvent {
  const tierFlavor = ev.tierFlavor
    ? (Object.fromEntries(
        Object.entries(ev.tierFlavor).map(([k, v]) => [
          k,
          v ? substituteTemplate(v, vars) : undefined,
        ]),
      ) as RuntimeEvent["tierFlavor"])
    : undefined;

  return {
    ...ev,
    narrative: substituteTemplate(ev.narrative, vars),
    atmosphere: ev.atmosphere ? substituteTemplate(ev.atmosphere, vars) : undefined,
    presenceNote: ev.presenceNote ? substituteTemplate(ev.presenceNote, vars) : undefined,
    stakesNote: ev.stakesNote ? substituteTemplate(ev.stakesNote, vars) : undefined,
    quote: ev.quote ? substituteTemplate(ev.quote, vars) : undefined,
    postQuote: ev.postQuote ? substituteTemplate(ev.postQuote, vars) : undefined,
    preChoiceNpc: ev.preChoiceNpc
      ? {
          speaker: ev.preChoiceNpc.speaker,
          line: substituteTemplate(ev.preChoiceNpc.line, vars),
        }
      : undefined,
    tierFlavor,
    choices: ev.choices.map((ch) => formatChoice(ch, vars)),
  };
}

export function buildSlideVars(
  crew: CrewMember[],
  tankName: string,
  objective: string,
  season: SeasonPhase,
  weekday: string,
  placeGrid: string,
  extras: Partial<NarrativeTemplateVars> = {},
): NarrativeTemplateVars {
  return narrativeVars(crew, tankName, objective, {
    season: seasonProseTag(season),
    weekday,
    placeGrid,
    place: `grid ${placeGrid}`,
    ...extras,
  });
}
