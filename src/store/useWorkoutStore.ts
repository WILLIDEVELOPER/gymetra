import { create } from 'zustand';
import { WorkoutRepository } from '../infrastructure/repositories/WorkoutRepository';
import { PRRepository } from '../infrastructure/repositories/PRRepository';
import { RoutineRepository } from '../infrastructure/repositories/RoutineRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import type { Workout, WorkoutSummary, ExerciseSet, Routine } from '../domain/models';
import { XP_REWARDS } from '../domain/models';

interface WorkoutState {
  activeWorkout: Workout | null;
  history: WorkoutSummary[];
  isLoading: boolean;
  error: string | null;
  // Actions
  startWorkout: (name: string, routine?: Routine) => Promise<Workout>;
  addExerciseToWorkout: (exerciseId: string) => Promise<void>;
  addSet: (workoutExerciseId: string, set: Omit<ExerciseSet, 'id'>) => Promise<void>;
  updateSet: (setId: string, data: Partial<ExerciseSet>) => Promise<void>;
  completeWorkout: (opts?: { rating?: number; notes?: string }) => Promise<{ xpEarned: number; newPRs: number }>;
  cancelWorkout: () => Promise<void>;
  loadHistory: (limit?: number) => Promise<void>;
  resumeInProgress: () => Promise<void>;
}

function calcVolume(sets: ExerciseSet[]): number {
  return sets
    .filter((s) => s.completed && !s.isWarmup)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);
}

// Brzycki 1RM formula
function estimate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  history: [],
  isLoading: false,
  error: null,

  startWorkout: async (name, routine) => {
    const id = await WorkoutRepository.create({
      name,
      routineId: routine?.id,
      routineName: routine?.name,
      status: 'in_progress',
      startedAt: Date.now(),
      durationSeconds: 0,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      xpEarned: 0,
    });

    // Pre-cargar ejercicios de la rutina
    if (routine) {
      for (let i = 0; i < routine.exercises.length; i++) {
        await WorkoutRepository.addExercise(id, routine.exercises[i].exerciseId, i);
      }
    }

    const workout = await WorkoutRepository.getById(id);
    set({ activeWorkout: workout });
    return workout!;
  },

  addExerciseToWorkout: async (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    const idx = activeWorkout.exercises.length;
    const weId = await WorkoutRepository.addExercise(activeWorkout.id, exerciseId, idx);
    set((s) => ({
      activeWorkout: s.activeWorkout ? {
        ...s.activeWorkout,
        exercises: [...s.activeWorkout.exercises, {
          id: weId, workoutId: s.activeWorkout.id,
          exerciseId, orderIndex: idx, sets: [],
        }],
      } : null,
    }));
  },

  addSet: async (workoutExerciseId, setData) => {
    const setId = await WorkoutRepository.addSet({ ...setData, workoutExerciseId });
    set((s) => {
      if (!s.activeWorkout) return {};
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: s.activeWorkout.exercises.map((ex) =>
            ex.id === workoutExerciseId
              ? { ...ex, sets: [...ex.sets, { ...setData, id: setId, workoutExerciseId }] }
              : ex
          ),
        },
      };
    });
  },

  updateSet: async (setId, data) => {
    await WorkoutRepository.updateSet(setId, data);
    set((s) => {
      if (!s.activeWorkout) return {};
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: s.activeWorkout.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((ss) => ss.id === setId ? { ...ss, ...data } : ss),
          })),
        },
      };
    });
  },

  completeWorkout: async (opts) => {
    const { activeWorkout } = get();
    if (!activeWorkout) throw new Error('No hay workout activo');

    const now = Date.now();
    const durationSeconds = Math.floor((now - activeWorkout.startedAt) / 1000);
    const allSets = activeWorkout.exercises.flatMap((e) => e.sets);
    const completedSets = allSets.filter((s) => s.completed && !s.isWarmup);

    const totalVolume = calcVolume(allSets);
    const totalSets = completedSets.length;
    const totalReps = completedSets.reduce((s, set) => s + set.reps, 0);

    let xpEarned = XP_REWARDS.WORKOUT_COMPLETE;
    let newPRs = 0;

    // Detectar PRs por ejercicio
    for (const we of activeWorkout.exercises) {
      const exerciseSets = we.sets.filter((s) => s.completed && !s.isWarmup);
      if (exerciseSets.length === 0) continue;

      const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
      const maxReps   = Math.max(...exerciseSets.map((s) => s.reps));
      const exerciseVolume = calcVolume(exerciseSets);
      const best1rm = Math.max(...exerciseSets.map((s) => estimate1RM(s.weight, s.reps)));

      const exerciseName = we.exercise?.name ?? we.exerciseId;

      const isPR1 = await PRRepository.upsertPR({
        exerciseId: we.exerciseId, exerciseName,
        type: 'weight', value: maxWeight,
        weight: maxWeight, workoutId: activeWorkout.id, achievedAt: now,
      });
      const isPR2 = await PRRepository.upsertPR({
        exerciseId: we.exerciseId, exerciseName,
        type: '1rm', value: best1rm,
        weight: maxWeight, reps: maxReps,
        workoutId: activeWorkout.id, achievedAt: now,
      });

      if (isPR1 || isPR2) {
        newPRs++;
        xpEarned += XP_REWARDS.NEW_PR;
      }
    }

    await WorkoutRepository.completeWorkout(activeWorkout.id, {
      durationSeconds, totalVolume, totalSets, totalReps,
      xpEarned, rating: opts?.rating, notes: opts?.notes,
    });

    // Actualizar stats del usuario
    await UserRepository.update({
      totalWorkouts: undefined, // se incrementará vía DB
      totalVolume: undefined,
      totalDuration: undefined,
    });
    const updatedUser = await UserRepository.getOrCreate();
    await UserRepository.update({
      totalWorkouts: updatedUser.totalWorkouts + 1,
      totalVolume: updatedUser.totalVolume + totalVolume,
      totalDuration: updatedUser.totalDuration + durationSeconds,
      lastWorkoutDate: now,
    });

    if (activeWorkout.routineId) {
      await RoutineRepository.incrementTimesCompleted(activeWorkout.routineId);
    }

    await UserRepository.addXp(xpEarned);

    set({ activeWorkout: null });
    return { xpEarned, newPRs };
  },

  cancelWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    await WorkoutRepository.completeWorkout(activeWorkout.id, {
      durationSeconds: 0, totalVolume: 0, totalSets: 0,
      totalReps: 0, xpEarned: 0,
    });
    set({ activeWorkout: null });
  },

  loadHistory: async (limit = 20) => {
    set({ isLoading: true });
    try {
      const history = await WorkoutRepository.getRecent(limit);
      set({ history, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  resumeInProgress: async () => {
    const workout = await WorkoutRepository.getInProgress();
    if (workout) set({ activeWorkout: workout });
  },
}));
