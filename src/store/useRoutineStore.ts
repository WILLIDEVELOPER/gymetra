import { create } from 'zustand';
import { RoutineRepository } from '../infrastructure/repositories/RoutineRepository';
import type { Routine } from '../domain/models';

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  // Actions
  loadRoutines: () => Promise<void>;
  createRoutine: (data: Omit<Routine, 'id' | 'createdAt' | 'updatedAt' | 'timesCompleted'>) => Promise<Routine>;
  updateRoutine: (id: string, data: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<Routine>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  isLoading: false,
  error: null,

  loadRoutines: async () => {
    set({ isLoading: true, error: null });
    try {
      const routines = await RoutineRepository.getAll();
      set({ routines, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  createRoutine: async (data) => {
    const routine = await RoutineRepository.create(data);
    set((s) => ({ routines: [routine, ...s.routines] }));
    return routine;
  },

  updateRoutine: async (id, data) => {
    set((s) => ({
      routines: s.routines.map((r) => r.id === id ? { ...r, ...data } : r),
    }));
    try {
      await RoutineRepository.update(id, data);
    } catch (e) {
      await get().loadRoutines(); // revert
      set({ error: String(e) });
    }
  },

  deleteRoutine: async (id) => {
    const prev = get().routines;
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
    try {
      await RoutineRepository.delete(id);
    } catch (e) {
      set({ routines: prev, error: String(e) });
    }
  },

  duplicateRoutine: async (id) => {
    const dup = await RoutineRepository.duplicate(id);
    set((s) => ({ routines: [dup, ...s.routines] }));
    return dup;
  },
}));
