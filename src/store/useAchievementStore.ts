import { create } from 'zustand';
import { AchievementRepository } from '../infrastructure/repositories/AchievementRepository';
import type { Achievement, AchievementCheckContext } from '../domain/models';

interface AchievementState {
  achievements: Achievement[];
  recentlyUnlocked: Achievement[];   // para mostrar toast/animación
  isLoading: boolean;
  // Actions
  loadAchievements: () => Promise<void>;
  checkAchievements: (ctx: AchievementCheckContext) => Promise<Achievement[]>;
  clearRecentlyUnlocked: () => void;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  recentlyUnlocked: [],
  isLoading: false,

  loadAchievements: async () => {
    set({ isLoading: true });
    try {
      const achievements = await AchievementRepository.getAll();
      set({ achievements, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  checkAchievements: async (ctx) => {
    const newlyUnlocked = await AchievementRepository.checkAndUnlock(ctx);
    if (newlyUnlocked.length > 0) {
      await get().loadAchievements();
      set((s) => ({ recentlyUnlocked: [...s.recentlyUnlocked, ...newlyUnlocked] }));
    }
    return newlyUnlocked;
  },

  clearRecentlyUnlocked: () => set({ recentlyUnlocked: [] }),
}));
