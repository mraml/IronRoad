import { memo } from "react";
import type { FieldJournalEntry, GameState } from "../engine/types";
import { buildFeedEntries } from "./feedCategories";

export const ActivityFeed = memo(function ActivityFeed({
  game,
}: {
  game: GameState;
}) {
  const discoveries = game.fieldJournal
    .filter((e): e is FieldJournalEntry & { kind: "discovery" } => e.kind === "discovery")
    .slice(-4)
    .map((e) => ({ id: e.id, text: e.text }));

  const entries = buildFeedEntries(game.narrativeLog, discoveries, 14);

  if (entries.length === 0) {
    return (
      <aside className="activity-feed panel panel--compact play-top-panel">
        <h3 className="panel-heading">Situation log</h3>
        <p className="muted activity-feed__empty">No reports yet this run.</p>
      </aside>
    );
  }

  return (
    <aside className="activity-feed panel panel--compact play-top-panel">
      <h3 className="panel-heading">Situation log</h3>
      <div className="activity-feed__scroll">
        <ul className="feed-list">
          {entries.map((e) => (
            <li key={e.id} className={`feed-item feed-item--${e.category}`}>
              {e.category === "discovery" ? (
                <span className="feed-item__badge">Discovery</span>
              ) : null}
              <span className="feed-item__text">{e.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
});
