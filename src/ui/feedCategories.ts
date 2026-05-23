export type FeedCategory = "discovery" | "crew" | "tank" | "supply" | "general";

export function categorizeFeedLine(line: string): FeedCategory {
  const lower = line.toLowerCase();
  if (
    lower.includes("food") ||
    lower.includes("water") ||
    lower.includes("ration") ||
    lower.includes("starving") ||
    lower.includes("dehydrat") ||
    (lower.includes("spend") && (lower.includes("ap") || lower.includes("he")))
  ) {
    return "supply";
  }
  if (
    lower.includes("discovery") ||
    (lower.includes(" — ") && /^[A-Z]/.test(line.split(" — ")[0] ?? "")) ||
    lower.includes("journal")
  ) {
    return "discovery";
  }
  if (
    lower.includes("kia") ||
    lower.includes("is gone") ||
    lower.includes("has the net now") ||
    lower.includes("hp") ||
    lower.includes("constitution") ||
    lower.includes("medkit") ||
    lower.includes("covering")
  ) {
    return "crew";
  }
  if (
    lower.includes("hull") ||
    lower.includes("brews up") ||
    lower.includes("component") ||
    lower.includes("track")
  ) {
    return "tank";
  }
  return "general";
}

export interface FeedEntry {
  id: string;
  text: string;
  category: FeedCategory;
}

export function buildFeedEntries(
  narrativeLog: string[],
  journalDiscoveries: { id: string; text: string }[],
  max = 14,
): FeedEntry[] {
  const entries: FeedEntry[] = [];
  for (const j of journalDiscoveries) {
    entries.push({
      id: j.id,
      text: j.text,
      category: "discovery",
    });
  }
  narrativeLog.forEach((text, i) => {
    entries.push({
      id: `log_${i}_${text.slice(0, 24)}`,
      text,
      category: categorizeFeedLine(text),
    });
  });
  const seen = new Set<string>();
  const deduped: FeedEntry[] = [];
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]!;
    if (seen.has(e.text)) continue;
    seen.add(e.text);
    deduped.unshift(e);
  }
  return deduped.slice(-max);
}
