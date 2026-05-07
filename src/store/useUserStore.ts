import { create } from 'zustand';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import type { UserProfile } from '../domain/models';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addXp: (amount: number) => Promise<{ leveledUp: boolean; newLevel: number }>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await UserRepository.getOrCreate();
      set({ profile, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  updateProfile: async (data) => {
    const current = get().profile;
    if (!current) return;
    const optimistic = { ...current, ...data };
    set({ profile: optimistic });
    try {
      await UserRepository.update(data);
    } catch (e) {
      set({ profile: current, error: String(e) });
    }
  },

  addXp: async (amount) => {
    const result = await UserRepository.addXp(amount);
    await get().loadProfile();
    return result;
  },
}));
