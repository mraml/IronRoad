import { describe, expect, it } from "vitest";
import type { EnvironmentId } from "../engine/types";
import { deriveEnvironmentProse } from "./environmentProse";

const ALL_ENVS: EnvironmentId[] = [
  "clear",
  "scorching_heat",
  "dust_storm",
  "heavy_rain",
  "deep_mud",
  "thick_fog",
  "light_snow",
  "blizzard",
  "hard_freeze",
  "ice",
  "thaw_mud",
  "overcast",
];

describe("environmentProse", () => {
  it("every environment has weather, light, temp, and activity prose", () => {
    for (const env of ALL_ENVS) {
      const prose = deriveEnvironmentProse(env, "Morning");
      expect(prose.weather.length).toBeGreaterThan(10);
      expect(prose.light.length).toBeGreaterThan(10);
      expect(prose.temp.length).toBeGreaterThan(10);
      expect(prose.activity.length).toBeGreaterThan(10);
    }
  });

  it("blizzard and clear read differently", () => {
    const blizzard = deriveEnvironmentProse("blizzard", "Midday");
    const clear = deriveEnvironmentProse("clear", "Midday");
    expect(blizzard.weather).not.toBe(clear.weather);
  });
});
