import type { GameState } from "../engine/types";

/** Lightweight shape check for persisted game snapshots (local trust model). */
export function isValidPersistedGame(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<GameState>;
  if (typeof v.version !== "number" || v.version < 1) return false;
  if (typeof v.meta !== "object" || v.meta === null) return false;
  if (!Array.isArray(v.crew) || !Array.isArray(v.missions)) return false;
  if (typeof v.runSeed !== "string" || typeof v.difficulty !== "string") return false;
  return true;
}
