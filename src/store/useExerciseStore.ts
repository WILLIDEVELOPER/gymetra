import { create } from 'zustand';
import { ExerciseRepository } from '../infrastructure/repositories/ExerciseRepository';
import type { Exercise, MuscleGroup } from '../domain/models';

interface ExerciseState {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterMuscle: MuscleGroup | null;
  // Computed
  filtered: Exercise[];
  // Actions
  loadExercises: () => Promise<void>;
  createExercise: (data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Exercise>;
  deleteExercise: (id: string) => Promise<void>;
  setSearch: (q: string) => void;
  setFilter: (muscle: MuscleGroup | null) => void;
}

function applyFilters(
  exercises: Exercise[],
  query: string,
  muscle: MuscleGroup | null
): Exercise[] {
  return exercises.filter((ex) => {
    const matchName = query === '' ||
      ex.name.toLowerCase().includes(query.toLowerCase());
    const matchMuscle = muscle === null || ex.muscleGroup === muscle;
    return matchName && matchMuscle;
  });
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filterMuscle: null,
  filtered: [],

  loadExercises: async () => {
    set({ isLoading: true, error: null });
    try {
      const exercises = await ExerciseRepository.getAll();
      const { searchQuery, filterMuscle } = get();
      set({
        exercises,
        filtered: applyFilters(exercises, searchQuery, filterMuscle),
        isLoading: false,
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  createExercise: async (data) => {
    const ex = await ExerciseRepository.create(data);
    set((s) => {
      const exercises = [...s.exercises, ex];
      return {
        exercises,
        filtered: applyFilters(exercises, s.searchQuery, s.filterMuscle),
      };
    });
    return ex;
  },

  deleteExercise: async (id) => {
    await ExerciseRepository.delete(id);
    set((s) => {
      const exercises = s.exercises.filter((e) => e.id !== id);
      return {
        exercises,
        filtered: applyFilters(exercises, s.searchQuery, s.filterMuscle),
      };
    });
  },

  setSearch: (query) => {
    set((s) => ({
      searchQuery: query,
      filtered: applyFilters(s.exercises, query, s.filterMuscle),
    }));
  },

  setFilter: (muscle) => {
    set((s) => ({
      filterMuscle: muscle,
      filtered: applyFilters(s.exercises, s.searchQuery, muscle),
    }));
  },
}));
