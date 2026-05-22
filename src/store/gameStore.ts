import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialTitleState } from "../engine/generator";
import { reduceGame } from "../engine/reducer";
import type { GameAction, GameState } from "../engine/types";

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
    },
  ),
);
