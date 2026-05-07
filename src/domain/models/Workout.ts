import type { WorkoutExercise } from './Exercise';

export type WorkoutStatus = 'in_progress' | 'completed' | 'cancelled';

export interface Workout {
  id: string;
  routineId?: string;
  routineName?: string;
  name: string;
  status: WorkoutStatus;
  startedAt: number;
  completedAt?: number;
  durationSeconds: number;
  totalVolume: number;   // kg totales levantados
  totalSets: number;
  totalReps: number;
  exercises: WorkoutExercise[];
  notes?: string;
  rating?: number;       // 1-5 estrellas
  bodyWeight?: number;   // kg del usuario ese día
  xpEarned: number;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  routineName?: string;
  startedAt: number;
  durationSeconds: number;
  totalVolume: number;
  totalSets: number;
  exerciseCount: number;
  xpEarned: number;
}
