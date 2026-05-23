import { describe, expect, it } from "vitest";
import { formatEventStrings, narrativeVars } from "./template";
import type { CrewMember, RuntimeEvent } from "./types";

function stubCrew(overrides: Partial<CrewMember> & { role: CrewMember["role"] }): CrewMember {
  return {
    id: "x",
    firstName: "A",
    lastName: "B",
    nickname: "Nick",
    archetypeId: "veteran",
    constitution: 80,
    traumaStates: [],
    scars: [],
    hp: 100,
    rank: "Sgt.",
    ...overrides,
  };
}

describe("narrativeVars", () => {
  it("{cmd} uses acting voice when commander is KIA", () => {
    const crew: CrewMember[] = [
      stubCrew({ role: "commander", nickname: "DeadBoss", hp: 0, rank: "Sgt." }),
      stubCrew({ role: "gunner", nickname: "Top", hp: 80, rank: "SSgt." }),
    ];
    const vars = narrativeVars(crew, "Iron Mary", "Hold the crossroads");
    expect(vars.cmd).toBe("Top");
    const ev: RuntimeEvent = {
      id: "test",
      kind: "travel",
      narrative: "{cmd} says move.",
      choices: [
        { id: "a", label: "Go", role: "driver", outcomeText: "{cmd} nods.", effects: [] },
        { id: "b", label: "Wait", role: "gunner", outcomeText: "Hold.", effects: [] },
        { id: "c", label: "Back", role: "loader", outcomeText: "Fine.", effects: [] },
      ],
    };
    const formatted = formatEventStrings(ev, vars);
    expect(formatted.narrative).toContain("Top says move");
    expect(formatted.choices[0]!.outcomeText).toContain("Top nods");
  });
});
