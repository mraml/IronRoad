import { describe, expect, it } from "vitest";
import {
  assignRank,
  compareRank,
  CREW_RANK_ORDER,
  defaultRankForRole,
  highestRankMember,
} from "./ranks";
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
});
