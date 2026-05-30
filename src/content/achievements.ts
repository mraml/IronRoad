/**
 * Cross-campaign milestone achievements (Wave 19).
 */
import type { CrossCampaignJournal } from "../store/journalStore";
import type { GameState } from "../engine/types";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
}

/** Discovery journal entries unlocked alongside milestone achievements. */
export const ACHIEVEMENT_DISCOVERY_IDS: Record<string, string> = {
  five_objectives_met: "five_objectives_met",
};

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  {
    id: "first_campaign_win",
    title: "Road home",
    description: "Complete a campaign with at least one crew member alive.",
  },
  {
    id: "fury_complete",
    title: "Fury run",
    description: "Complete a Fury difficulty campaign.",
  },
  {
    id: "full_crew_end",
    title: "All five",
    description: "Finish a campaign with the full original crew alive.",
  },
  {
    id: "ten_discoveries",
    title: "Archivist",
    description: "Unlock ten discoveries in the Field Journal.",
  },
  {
    id: "five_objectives_met",
    title: "Quiet promises",
    description: "Meet five personal objectives across campaigns.",
  },
  {
    id: "lucky_survived",
    title: "Lucky's ledger",
    description: "Complete a campaign with a crew member nicknamed Lucky still alive.",
  },
  {
    id: "no_commander_kia",
    title: "Command intact",
    description: "Complete a campaign without the commander ever being KIA.",
  },
  {
    id: "charm_collector",
    title: "Tokens",
    description: "Discover fifteen unique charms in the codex.",
  },
  {
    id: "veteran_complete",
    title: "Seasoned road",
    description: "Complete a Veteran difficulty campaign.",
  },
  {
    id: "no_breaking_trauma",
    title: "Nerves held",
    description: "Complete a campaign without any crew member ever breaking.",
  },
  {
    id: "objective_met_mission",
    title: "Secret kept",
    description: "Meet a personal hidden objective in a mission.",
  },
  {
    id: "three_objectives_campaign",
    title: "Three vows",
    description: "Meet three personal objectives in one campaign.",
  },
  {
    id: "twenty_discoveries",
    title: "Deep archive",
    description: "Unlock twenty discoveries in the Field Journal.",
  },
  {
    id: "munster_survivor",
    title: "Münster walked",
    description: "Complete a campaign after fighting through Münster.",
  },
];

const BY_ID = new Map(ACHIEVEMENT_CATALOG.map((a) => [a.id, a]));

export function getAchievement(id: string): AchievementDef | undefined {
  return BY_ID.get(id);
}

export function countDiscoveries(
  journal: CrossCampaignJournal,
  game?: Pick<GameState, "fieldJournal">,
): number {
  const ids = new Set<string>();
  for (const m of journal.moments) {
    if (m.kind === "discovery") ids.add(m.id);
  }
  for (const e of game?.fieldJournal ?? []) {
    if (e.kind === "discovery") ids.add(e.id);
  }
  return ids.size;
}

export function countObjectivesMet(
  journal: CrossCampaignJournal,
  game?: Pick<GameState, "fieldJournal">,
): number {
  let n = 0;
  for (const m of journal.moments) {
    if (m.kind === "moment" && m.text.startsWith("Objective met")) n++;
  }
  for (const e of game?.fieldJournal ?? []) {
    if (e.kind === "moment" && e.text.startsWith("Objective met")) n++;
  }
  return n;
}

function countObjectivesMetThisCampaign(game: Pick<GameState, "fieldJournal">): number {
  let n = 0;
  for (const e of game.fieldJournal) {
    if (e.kind === "moment" && e.text.startsWith("Objective met")) n++;
  }
  return n;
}

function countDiscoveredCharms(
  journal: CrossCampaignJournal,
  game?: Pick<GameState, "crew">,
): number {
  const ids = new Set(journal.discoveredCharmIds ?? []);
  for (const c of game?.crew ?? []) {
    if (c.charmId) ids.add(c.charmId);
  }
  return ids.size;
}

/** Returns newly unlockable achievement ids not yet in `alreadyUnlocked`. */
export function evaluateAchievements(
  game: GameState,
  journal: CrossCampaignJournal,
  alreadyUnlocked: string[],
): string[] {
  const have = new Set(alreadyUnlocked);
  const out: string[] = [];

  const add = (id: string, cond: boolean) => {
    if (cond && !have.has(id) && !out.includes(id)) out.push(id);
  };

  if (game.meta.t === "end" && game.meta.won) {
    add("first_campaign_win", true);
    if (game.difficulty === "fury") add("fury_complete", true);
    if (game.difficulty === "veteran") add("veteran_complete", true);
    const living = game.crew.filter((c) => c.hp > 0);
    if (living.length === 5) add("full_crew_end", true);
    if (living.some((c) => c.nickname === "Lucky")) add("lucky_survived", true);
    if (!game.commanderEverKia) add("no_commander_kia", true);
    if (!game.everBreakingTrauma) add("no_breaking_trauma", true);
    if (countObjectivesMetThisCampaign(game) >= 3) add("three_objectives_campaign", true);
    if (game.seededFlags.includes("munster_anchor_seen")) add("munster_survivor", true);
  }

  add("ten_discoveries", countDiscoveries(journal, game) >= 10);
  add("twenty_discoveries", countDiscoveries(journal, game) >= 20);
  add("five_objectives_met", countObjectivesMet(journal, game) >= 5);
  add("objective_met_mission", countObjectivesMetThisCampaign(game) >= 1);
  add("charm_collector", countDiscoveredCharms(journal, game) >= 15);

  return out;
}
