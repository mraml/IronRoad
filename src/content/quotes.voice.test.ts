import { describe, expect, it } from "vitest";
import { formatOutcomeQuoteLine, pickQuoteSpeaker } from "./quotes";
import type { CrewMember } from "../engine/types";

function stub(overrides: Partial<CrewMember> & { role: CrewMember["role"] }): CrewMember {
  return {
    id: "1",
    firstName: "A",
    lastName: "B",
    nickname: "Boss",
    archetypeId: "veteran",
    constitution: 80,
    traumaStates: [],
    scars: [],
    hp: 100,
    rank: "Sgt.",
    ...overrides,
  };
}

describe("voice leader quotes", () => {
  it("pickQuoteSpeaker uses senior survivor when commander KIA", () => {
    const crew = [
      stub({ role: "commander", hp: 0, nickname: "DeadBoss" }),
      stub({ role: "gunner", hp: 80, nickname: "Top", rank: "SSgt." }),
      stub({ role: "loader", hp: 60, nickname: "Kid", rank: "Pvt." }),
    ];
    expect(pickQuoteSpeaker(crew, "win", 0)?.nickname).toBe("Top");
    expect(pickQuoteSpeaker(crew, "start", 99)?.nickname).toBe("Top");
  });

  it("formatOutcomeQuoteLine attributes quote to voice leader after cmd KIA", () => {
    const crew = [
      stub({ role: "commander", hp: 0, nickname: "DeadBoss" }),
      stub({ role: "gunner", hp: 80, nickname: "Top", rank: "SSgt." }),
    ];
    const line = formatOutcomeQuoteLine(
      { crew, runSeed: "quote-voice", rngCounter: 3 },
      "win",
    );
    expect(line?.startsWith("Top:")).toBe(true);
  });
});
