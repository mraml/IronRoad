import { useEffect, useRef, useState } from "react";
import { evaluateAchievements, getAchievement } from "../content/achievements";
import type { GameState } from "../engine/types";
import { useJournalStore } from "../store/journalStore";

const TOAST_MS = 5000;

export function AchievementToastStack({ game }: { game: GameState }) {
  const journal = useJournalStore((s) => s.journal);
  const unlockAchievements = useJournalStore((s) => s.unlockAchievements);
  const recordCharmDiscovered = useJournalStore((s) => s.recordCharmDiscovered);
  const [toasts, setToasts] = useState<{ id: string; title: string; key: number }[]>([]);
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    for (const c of game.crew) {
      if (c.charmId) recordCharmDiscovered(c.charmId);
    }

    const already = new Set([
      ...journal.unlockedAchievements,
      ...(game.sessionAchievementUnlocks ?? []),
      ...seenRef.current,
    ]);
    const newly = evaluateAchievements(game, journal, [...already]);
    if (newly.length === 0) return;

    unlockAchievements(newly);
    setToasts((prev) => {
      const next = [...prev];
      for (const id of newly) {
        seenRef.current.add(id);
        const def = getAchievement(id);
        if (def) next.push({ id, title: def.title, key: Date.now() + next.length });
      }
      return next;
    });
  }, [
    game.fieldJournal,
    game.meta,
    game.crew,
    game.difficulty,
    game.commanderEverKia,
    game.everBreakingTrauma,
    game.seededFlags,
    journal.unlockedAchievements,
    journal.discoveredCharmIds,
    journal.moments,
    recordCharmDiscovered,
    unlockAchievements,
  ]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const t = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="achievement-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.key} className="achievement-toast panel panel--compact">
          <span className="achievement-toast__label">Achievement</span>
          <strong>{t.title}</strong>
        </div>
      ))}
    </div>
  );
}
