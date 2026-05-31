import { describe, expect, it } from "vitest";
import {
  assignRank,
  compareRank,
  commanderIsAlive,
  CREW_RANK_ORDER,
  defaultRankForRole,
  highestRankMember,
  isActingCommander,
  resolveVoiceLeader,
} from "./ranks";
import type { CrewMember } from "../engine/types";
import { generateCrew } from "./pools";
import type { CrewRank } from "./ranks";

describe("ranks", () => {
  it("assigns role-appropriate ranks at crew generation", () => {
    const { crew } = generateCrew("rank-seed", 0);
    expect(crew).toHaveLength(5);
    for (const c of crew) {
      expect(CREW_RANK_ORDER).toContain(c.rank);
    }
    const commander = crew.find((c) => c.role === "commander")!;
    expect(["Sgt.", "SSgt.", "2nd Lt."]).toContain(commander.rank);
  });

  it("defaultRankForRole returns a valid rank per seat", () => {
    expect(defaultRankForRole("commander")).toBe("Sgt.");
    expect(defaultRankForRole("loader")).toBe("Pvt.");
  });

  it("compareRank orders Pvt through 2nd Lt.", () => {
    expect(compareRank("Sgt.", "Cpl.")).toBeGreaterThan(0);
    expect(compareRank("2nd Lt.", "SSgt.")).toBeGreaterThan(0);
    expect(compareRank("Pvt.", "Pvt.")).toBe(0);
  });

  it("highestRankMember picks senior surviving crew", () => {
    const crew = [
      { rank: "Cpl." as CrewRank, hp: 80 },
      { rank: "SSgt." as CrewRank, hp: 0 },
      { rank: "Sgt." as CrewRank, hp: 50 },
    ];
    expect(highestRankMember(crew)?.rank).toBe("Sgt.");
  });

  it("assignRank is deterministic for fixed seed", () => {
    expect(assignRank("fixed", 3, "gunner")).toBe(assignRank("fixed", 3, "gunner"));
  });

  it("resolveVoiceLeader returns commander when alive", () => {
    const crew: CrewMember[] = [
      {
        id: "1",
        role: "commander",
        rank: "Sgt.",
        hp: 50,
        firstName: "A",
        lastName: "B",
        nickname: "Boss",
        archetypeId: "veteran",
        constitution: 80,
        traumaStates: [],
        scars: [],
      },
      {
        id: "2",
        role: "gunner",
        rank: "SSgt.",
        hp: 80,
        firstName: "C",
        lastName: "D",
        nickname: "Top",
        archetypeId: "veteran",
        constitution: 80,
        traumaStates: [],
        scars: [],
      },
    ];
    expect(resolveVoiceLeader(crew)?.nickname).toBe("Boss");
    expect(commanderIsAlive(crew)).toBe(true);
  });

  it("resolveVoiceLeader picks senior survivor when commander KIA", () => {
    const crew: CrewMember[] = [
      {
        id: "1",
        role: "commander",
        rank: "Sgt.",
        hp: 0,
        firstName: "A",
        lastName: "B",
        nickname: "Boss",
        archetypeId: "veteran",
        constitution: 0,
        traumaStates: [],
        scars: [],
      },
      {
        id: "2",
        role: "gunner",
        rank: "SSgt.",
        hp: 80,
        firstName: "C",
        lastName: "D",
        nickname: "Top",
        archetypeId: "veteran",
        constitution: 80,
        traumaStates: [],
        scars: [],
      },
      {
        id: "3",
        role: "loader",
        rank: "Pvt.",
        hp: 60,
        firstName: "E",
        lastName: "F",
        nickname: "Kid",
        archetypeId: "kid",
        constitution: 70,
        traumaStates: [],
        scars: [],
      },
    ];
    expect(resolveVoiceLeader(crew)?.nickname).toBe("Top");
    expect(isActingCommander(crew, crew[1]!)).toBe(true);
    expect(isActingCommander(crew, crew[2]!)).toBe(false);
  });

  it("resolveVoiceLeader returns undefined when all dead", () => {
    const crew: CrewMember[] = [
      {
        id: "1",
        role: "commander",
        rank: "Sgt.",
        hp: 0,
        firstName: "A",
        lastName: "B",
        nickname: "Boss",
        archetypeId: "veteran",
        constitution: 0,
        traumaStates: [],
        scars: [],
      },
    ];
    expect(resolveVoiceLeader(crew)).toBeUndefined();
  });
});
