import type { Role } from "../engine/types";
import { pick } from "./pools";

/** Enlisted and junior officer ranks appropriate to a Sherman tank crew (1944–45). */
export type CrewRank = "Pvt." | "PFC" | "Cpl." | "Sgt." | "SSgt." | "2nd Lt.";

/** Lowest → highest; used for future commander succession and journal unlock tiers. */
export const CREW_RANK_ORDER: readonly CrewRank[] = [
  "Pvt.",
  "PFC",
  "Cpl.",
  "Sgt.",
  "SSgt.",
  "2nd Lt.",
];

const ROLE_RANK_POOLS: Record<Role, readonly CrewRank[]> = {
  commander: ["Sgt.", "Sgt.", "SSgt.", "2nd Lt."],
  gunner: ["Cpl.", "Cpl.", "Sgt."],
  driver: ["PFC", "Cpl."],
  asst_driver: ["Pvt.", "PFC", "PFC"],
  loader: ["Pvt.", "Pvt.", "PFC"],
};

export function defaultRankForRole(role: Role): CrewRank {
  switch (role) {
    case "commander":
      return "Sgt.";
    case "gunner":
      return "Cpl.";
    case "driver":
      return "PFC";
    case "asst_driver":
    case "loader":
      return "Pvt.";
  }
}

export function assignRank(seed: string, counter: number, role: Role): CrewRank {
  return pick(seed, counter, ROLE_RANK_POOLS[role]);
}

export function formatRank(rank: CrewRank | undefined): string {
  return rank ?? "—";
}

export function compareRank(a: CrewRank, b: CrewRank): number {
  return CREW_RANK_ORDER.indexOf(a) - CREW_RANK_ORDER.indexOf(b);
}

/** Highest rank among living crew — future field commander when commander seat is empty. */
export function highestRankMember<T extends { rank: CrewRank; hp: number }>(
  crew: T[],
): T | undefined {
  const living = crew.filter((c) => c.hp > 0);
  if (living.length === 0) return undefined;
  return living.reduce((best, c) => (compareRank(c.rank, best.rank) > 0 ? c : best));
}
