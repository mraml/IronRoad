import type { EventChoice, RiskDomain, RiskSeverity, RiskTag, RuntimeEvent } from "./types";

export type { RiskDomain, RiskSeverity, RiskTag } from "./types";

const HULL_LABELS: Record<RiskSeverity, string> = {
  low: "Risk hull scrape",
  moderate: "Risk hull damage",
  high: "Risk serious hull damage",
  extreme: "Risk catastrophic hull damage",
};

const CREW_LABELS: Record<RiskSeverity, string> = {
  low: "May cost the crew",
  moderate: "Possible enemy contact",
  high: "Possible brutal encounter",
  extreme: "Loss of life likely",
};

const SUPPLY_LABELS: Record<RiskSeverity, string> = {
  low: "May cost rations",
  moderate: "Supplies at risk",
  high: "Risk severe food loss",
  extreme: "Supplies critically low",
};

const AMMO_LABELS: Record<RiskSeverity, string> = {
  low: "May spend main-gun rounds",
  moderate: "Ammo cost likely",
  high: "Heavy ammo cost",
  extreme: "Heavy ammo expenditure",
};

function severityFromMagnitude(abs: number, t1: number, t2: number, t3: number): RiskSeverity {
  if (abs >= t3) return "extreme";
  if (abs >= t2) return "high";
  if (abs >= t1) return "moderate";
  return "low";
}

function mergeSeverity(a: RiskSeverity, b: RiskSeverity): RiskSeverity {
  const order: RiskSeverity[] = ["low", "moderate", "high", "extreme"];
  return order[Math.max(order.indexOf(a), order.indexOf(b))]!;
}

function tag(
  domain: RiskDomain,
  severity: RiskSeverity,
  labels: Record<RiskSeverity, string>,
): RiskTag {
  return { domain, severity, label: labels[severity] };
}

/** True if hint looks like legacy numeric telegraph (banned on choose UI). */
export function isNumericChoiceHint(hint: string | undefined): boolean {
  if (!hint) return false;
  return (
    /\d+\s*%/.test(hint) ||
    /\bHP\b/i.test(hint) ||
    /Nerve\s*[−-]?\d/i.test(hint) ||
    /Costs?\s+\d/i.test(hint) ||
    /[−-]\d+\s*(AP|HE|WP|HEAT)/i.test(hint) ||
    /Salvage\s*[−-]\d/i.test(hint) ||
    /foodDays|waterCanteens/i.test(hint) ||
    /All nerve/i.test(hint)
  );
}

export function deriveRiskTags(choice: EventChoice, event: RuntimeEvent): RiskTag[] {
  if (choice.flavorOnly || choice.effects.length === 0) return [];

  const byDomain = new Map<RiskDomain, RiskSeverity>();

  const bump = (domain: RiskDomain, severity: RiskSeverity) => {
    const prev = byDomain.get(domain);
    byDomain.set(domain, prev ? mergeSeverity(prev, severity) : severity);
  };

  for (const e of choice.effects) {
    switch (e.op) {
      case "mod_tank_health":
        if (e.delta < 0) bump("hull", severityFromMagnitude(-e.delta, 3, 8, 15));
        break;
      case "mod_hp":
        if (e.delta < 0) bump("crew", severityFromMagnitude(-e.delta, 5, 15, 40));
        break;
      case "mod_constitution":
        if (e.delta < 0) bump("crew", severityFromMagnitude(-e.delta, 4, 8, 12));
        break;
      case "mod_all_constitution":
        if (e.delta < 0) bump("crew", severityFromMagnitude(-e.delta, 3, 6, 10));
        break;
      case "mod_resource": {
        if (e.delta >= 0) break;
        if (e.key === "foodDays" || e.key === "waterCanteens") {
          bump("supply", severityFromMagnitude(-e.delta, 1, 2, 4));
        } else if (e.key === "smallArmsMags") {
          bump("ammo", severityFromMagnitude(-e.delta, 1, 3, 6));
        } else {
          bump("general", "low");
        }
        break;
      }
      case "spend_ammo":
        bump("ammo", severityFromMagnitude(e.amount, 1, 2, 4));
        break;
      case "spend_salvage":
        bump("salvage", severityFromMagnitude(e.amount, 2, 4, 6));
        break;
      default:
        break;
    }
  }

  if (event.useDice && choice.modifierBonus != null) {
    if (choice.modifierBonus <= -1) {
      bump("crew", mergeSeverity(byDomain.get("crew") ?? "low", "moderate"));
    }
  }

  const combatKinds = new Set([
    "tank_combat",
    "infantry_combat",
    "defensive_stand",
    "offensive_assault",
    "elite_encounter",
  ]);
  if (combatKinds.has(event.kind) && event.useDice) {
    const crewSev = byDomain.get("crew") ?? "low";
    if (crewSev === "low") bump("crew", "moderate");
  }

  const tags: RiskTag[] = [];
  const hull = byDomain.get("hull");
  if (hull) tags.push(tag("hull", hull, HULL_LABELS));
  const crew = byDomain.get("crew");
  if (crew) tags.push(tag("crew", crew, CREW_LABELS));
  const supply = byDomain.get("supply");
  if (supply) tags.push(tag("supply", supply, SUPPLY_LABELS));
  const ammo = byDomain.get("ammo");
  if (ammo) tags.push(tag("ammo", ammo, AMMO_LABELS));
  const salvage = byDomain.get("salvage");
  if (salvage) {
    tags.push({
      domain: "salvage",
      severity: salvage,
      label: salvage === "extreme" ? "Heavy salvage cost" : "Costs salvage",
    });
  }
  const general = byDomain.get("general");
  if (general) tags.push({ domain: "general", severity: general, label: "May cost supplies" });

  return tags;
}

export function riskTagsToHint(tags: RiskTag[]): string | undefined {
  if (tags.length === 0) return undefined;
  return tags.map((t) => t.label).join(" · ");
}

/** Qualitative dice band for combat — no integers on choose UI. */
export function diceOddsLabel(modifierBonus: number | undefined): string | null {
  if (modifierBonus == null) return null;
  if (modifierBonus >= 2) return "Better odds";
  if (modifierBonus >= 1) return "Fair odds";
  if (modifierBonus <= -2) return "Hard fight";
  if (modifierBonus <= -1) return "Tougher fight";
  return null;
}
