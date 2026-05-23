import type { CrewMember, Resources } from "./types";

export interface OutcomeSummaryLine {
  category: "hull" | "crew" | "ammo" | "supply" | "salvage" | "discovery" | "other";
  text: string;
}

export interface OutcomeSummary {
  lines: OutcomeSummaryLine[];
}

export function buildOutcomeSummary(args: {
  tankHealthBefore?: number;
  tankHealthAfter: number;
  resourcesBefore?: Resources;
  resourcesAfter: Resources;
  crewBefore: { id: string; role: string; nickname: string; hp: number }[];
  crewAfter: CrewMember[];
  effectLines: string[];
}): OutcomeSummary {
  const lines: OutcomeSummaryLine[] = [];

  if (args.tankHealthBefore != null) {
    const d = args.tankHealthAfter - args.tankHealthBefore;
    if (d !== 0) {
      lines.push({
        category: "hull",
        text: d > 0 ? `Hull +${d}%` : `Hull ${d}%`,
      });
    }
  }

  if (args.resourcesBefore) {
    const rb = args.resourcesBefore;
    const ra = args.resourcesAfter;
    const ammoKeys = [
      ["ammoAP", "AP"],
      ["ammoHE", "HE"],
      ["ammoWP", "WP"],
      ["ammoHEAT", "HEAT"],
    ] as const;
    for (const [key, label] of ammoKeys) {
      const d = ra[key] - rb[key];
      if (d < 0) lines.push({ category: "ammo", text: `Spend ${-d} ${label}` });
      if (d > 0) lines.push({ category: "ammo", text: `+${d} ${label}` });
    }
    if (ra.medkits !== rb.medkits) {
      const d = ra.medkits - rb.medkits;
      lines.push({
        category: "supply",
        text: d > 0 ? `+${d} medkit${d === 1 ? "" : "s"}` : `${d} medkit${d === -1 ? "" : "s"}`,
      });
    }
    if (ra.foodDays !== rb.foodDays) {
      const d = ra.foodDays - rb.foodDays;
      lines.push({ category: "supply", text: `Food ${d > 0 ? "+" : ""}${d} day${Math.abs(d) === 1 ? "" : "s"}` });
    }
    if (ra.waterCanteens !== rb.waterCanteens) {
      const d = ra.waterCanteens - rb.waterCanteens;
      lines.push({
        category: "supply",
        text: `Water ${d > 0 ? "+" : ""}${d} canteen${Math.abs(d) === 1 ? "" : "s"}`,
      });
    }
  }

  for (const cm of args.crewAfter) {
    const prev = args.crewBefore.find((c) => c.id === cm.id);
    if (!prev || prev.hp === cm.hp) continue;
    const d = cm.hp - prev.hp;
    lines.push({
      category: "crew",
      text: `${cm.nickname} ${d > 0 ? "+" : ""}${d} HP`,
    });
  }

  for (const line of args.effectLines) {
    if (line.includes("discovery") || line.includes(" — ") && line.match(/^[A-Z]/)) {
      if (line.includes(" — ")) {
        lines.push({ category: "discovery", text: line });
        continue;
      }
    }
    if (
      lines.some((l) => l.text === line) ||
      line.includes("is covering") ||
      line.includes("has the net now")
    ) {
      continue;
    }
    const lower = line.toLowerCase();
    if (lower.includes("spend") && (lower.includes("ap") || lower.includes("he"))) {
      if (!lines.some((l) => l.text === line)) {
        lines.push({ category: "ammo", text: line });
      }
      continue;
    }
    if (lower.includes("hull") || lower.includes("track") || lower.includes("component")) {
      if (!lines.some((l) => l.category === "hull" && l.text.includes("%"))) {
        lines.push({ category: "hull", text: line });
      }
      continue;
    }
    if (lower.includes("hp") || lower.includes("is gone")) {
      lines.push({ category: "crew", text: line });
      continue;
    }
    if (lower.includes("food") || lower.includes("water") || lower.includes("ration")) {
      lines.push({ category: "supply", text: line });
      continue;
    }
    if (lower.includes("salvage")) {
      lines.push({ category: "salvage", text: line });
      continue;
    }
  }

  return { lines };
}
