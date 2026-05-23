import { describe, expect, it } from "vitest";
import { buildOutcomeSummary } from "./outcomeSummary";

describe("buildOutcomeSummary", () => {
  it("summarizes hull, ammo spend, and crew HP deltas", () => {
    const summary = buildOutcomeSummary({
      tankHealthBefore: 80,
      tankHealthAfter: 72,
      resourcesBefore: {
        ammoAP: 10,
        ammoHE: 5,
        ammoWP: 0,
        ammoHEAT: 0,
        smallArmsMags: 20,
        medkits: 2,
        foodDays: 4,
        waterCanteens: 3,
      },
      resourcesAfter: {
        ammoAP: 10,
        ammoHE: 4,
        ammoWP: 0,
        ammoHEAT: 0,
        smallArmsMags: 20,
        medkits: 2,
        foodDays: 4,
        waterCanteens: 3,
      },
      crewBefore: [{ id: "1", role: "gunner", nickname: "Tex", hp: 70 }],
      crewAfter: [
        {
          id: "1",
          role: "gunner",
          nickname: "Tex",
          hp: 55,
          firstName: "T",
          lastName: "X",
          rank: "Cpl.",
          archetypeId: "steady",
          constitution: 50,
          traumaStates: [],
          scars: [],
          charmUsedThisMission: false,
          roleAbilityUsed: false,
        },
      ],
      effectLines: ["Hull took a beating."],
    });

    expect(summary.lines.some((l) => l.text === "Hull -8%")).toBe(true);
    expect(summary.lines.some((l) => l.text === "Spend 1 HE")).toBe(true);
    expect(summary.lines.some((l) => l.text.includes("Tex") && l.text.includes("HP"))).toBe(true);
  });
});
