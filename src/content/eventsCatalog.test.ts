import { describe, expect, it } from "vitest";
import { RuntimeEventSchema } from "../engine/schema";
import { EVENT_CATALOG } from "./eventsCatalog";

describe("eventsCatalog", () => {
  it("every catalog entry validates against RuntimeEventSchema", () => {
    for (const ev of Object.values(EVENT_CATALOG)) {
      RuntimeEventSchema.parse(ev);
    }
    expect(Object.keys(EVENT_CATALOG).length).toBeGreaterThanOrEqual(40);
  });
});
