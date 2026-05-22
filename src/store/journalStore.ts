/**
 * Cross-campaign Field Journal store (spec §13).
 * Persisted separately from the run save so it survives "New Campaign".
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CrewRank } from "../content/ranks";

export interface JournalCrew {
  nickname: string;
  firstName: string;
  lastName: string;
  role: string;
  rank?: CrewRank;
  archetypeId: string;
  fate: "survived" | "kia" | "unknown";
  scars: string[];
  campaignSeed: string;
}

export interface JournalTank {
  name: string;
  fate: "operational" | "lost" | "unknown";
  campaignSeed: string;
}

export interface JournalMoment {
  id: string;
  at: number;
  text: string;
  kind: "moment" | "crew" | "tank" | "discovery";
  campaignSeed: string;
}

export interface CrossCampaignJournal {
  version: 1;
  crew: JournalCrew[];
  tanks: JournalTank[];
  moments: JournalMoment[];
}

interface JournalStore {
  journal: CrossCampaignJournal;
  recordCrewFates: (
    crew: {
      nickname: string;
      firstName: string;
      lastName: string;
      role: string;
      rank?: CrewRank;
      archetypeId: string;
      hp: number;
      scars: { text: string }[];
    }[],
    campaignSeed: string,
  ) => void;
  recordTankFate: (name: string, fate: JournalTank["fate"], campaignSeed: string) => void;
  recordMoment: (moment: Omit<JournalMoment, "campaignSeed">, campaignSeed: string) => void;
  importMoments: (moments: { id: string; at: number; text: string; kind: "moment" | "crew" | "tank" | "discovery" }[], campaignSeed: string) => void;
  clearJournal: () => void;
}

const EMPTY: CrossCampaignJournal = { version: 1, crew: [], tanks: [], moments: [] };

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      journal: EMPTY,

      recordCrewFates: (crew, campaignSeed) =>
        set((s) => {
          const existing = new Set(s.journal.crew.map((c) => `${campaignSeed}_${c.nickname}`));
          const newCrew: JournalCrew[] = crew
            .filter((c) => !existing.has(`${campaignSeed}_${c.nickname}`))
            .map((c) => ({
              nickname: c.nickname,
              firstName: c.firstName,
              lastName: c.lastName,
              role: c.role,
              rank: c.rank,
              archetypeId: c.archetypeId,
              fate: c.hp > 0 ? "survived" : "kia",
              scars: c.scars.map((sc) => sc.text),
              campaignSeed,
            }));
          return { journal: { ...s.journal, crew: [...s.journal.crew, ...newCrew] } };
        }),

      recordTankFate: (name, fate, campaignSeed) =>
        set((s) => {
          const key = `${campaignSeed}_${name}`;
          const filtered = s.journal.tanks.filter((t) => `${t.campaignSeed}_${t.name}` !== key);
          return {
            journal: {
              ...s.journal,
              tanks: [...filtered, { name, fate, campaignSeed }],
            },
          };
        }),

      recordMoment: (moment, campaignSeed) =>
        set((s) => {
          if (s.journal.moments.some((m) => m.id === moment.id)) return s;
          return {
            journal: {
              ...s.journal,
              moments: [...s.journal.moments, { ...moment, campaignSeed }],
            },
          };
        }),

      importMoments: (moments, campaignSeed) =>
        set((s) => {
          const existing = new Set(s.journal.moments.map((m) => m.id));
          const newOnes = moments
            .filter((m) => !existing.has(m.id))
            .map((m) => ({ ...m, campaignSeed }));
          return {
            journal: { ...s.journal, moments: [...s.journal.moments, ...newOnes] },
          };
        }),

      clearJournal: () => set({ journal: EMPTY }),
    }),
    {
      name: "iron_road_journal",
      version: 1,
    },
  ),
);
