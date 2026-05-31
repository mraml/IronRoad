import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialTitleState } from "../engine/generator";
import { reduceGame } from "../engine/reducer";
import type { GameAction, GameState } from "../engine/types";
import { isValidPersistedGame } from "./saveValidation";

const STORAGE_KEY = "iron-road-save-v1";

interface GameStore {
  game: GameState;
  dispatch: (a: GameAction) => void;
  hardReset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: initialTitleState(),
      dispatch: (a) => set((s) => ({ game: reduceGame(s.game, a) })),
      hardReset: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ game: initialTitleState() });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ game: s.game }),
      merge: (persisted, current) => {
        const snapshot = persisted as { game?: unknown } | undefined;
        if (!snapshot?.game || !isValidPersistedGame(snapshot.game)) {
          if (snapshot?.game) {
            console.warn("Iron Road: discarding invalid save snapshot");
          }
          return current;
        }
        return {
          ...current,
          game: reduceGame(current.game, { type: "LOAD_STATE", state: snapshot.game }),
        };
      },
    },
  ),
);
