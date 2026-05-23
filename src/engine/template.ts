import { resolveVoiceLeader } from "../content/ranks";
import type { CrewMember, Role, RuntimeEvent } from "./types";

function nickByRole(crew: CrewMember[], role: Role): string {
  return crew.find((c) => c.role === role)?.nickname ?? role;
}

function nickByArchetype(crew: CrewMember[], archetypeId: string): string {
  return crew.find((c) => c.archetypeId === archetypeId)?.nickname ?? archetypeId;
}

export function narrativeVars(
  crew: CrewMember[],
  tankName: string,
  objective: string,
): Record<string, string> {
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
  };
}

export function formatEventStrings(
  ev: RuntimeEvent,
  vars: Record<string, string>,
): RuntimeEvent {
  const f = (s: string) =>
    s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
  return {
    ...ev,
    narrative: f(ev.narrative),
    quote: ev.quote ? f(ev.quote) : undefined,
    postQuote: ev.postQuote ? f(ev.postQuote) : undefined,
    choices: ev.choices.map((ch) => ({
      ...ch,
      label: f(ch.label),
      outcomeText: f(ch.outcomeText),
    })),
  };
}
