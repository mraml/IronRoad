import { describe, expect, it } from "vitest";
import { buildFeedEntries, categorizeFeedLine } from "./feedCategories";

describe("categorizeFeedLine", () => {
  it("classifies discovery and supply lines", () => {
    expect(categorizeFeedLine("Discovery — Lucky survivor")).toBe("discovery");
    expect(categorizeFeedLine("No food, no water — crew losing health")).toBe("supply");
    expect(categorizeFeedLine("Hull dropped to 40%")).toBe("tank");
    expect(categorizeFeedLine("Gunner is gone.")).toBe("crew");
  });
});

describe("buildFeedEntries", () => {
  it("dedupes and caps recent entries", () => {
    const entries = buildFeedEntries(
      ["Line A", "Line B", "Line A"],
      [{ id: "d1", text: "Discovery — Test" }],
      3,
    );
    expect(entries.length).toBeLessThanOrEqual(3);
    expect(entries.filter((e) => e.text === "Line A").length).toBe(1);
  });
});
