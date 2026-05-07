export type RoutineCategory =
  | 'push' | 'pull' | 'legs' | 'full_body'
  | 'upper' | 'lower' | 'custom';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom, 6=Sab

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  targetRir?: number;
  restSeconds: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  category: RoutineCategory;
  scheduledDays: DayOfWeek[];
  exercises: RoutineExercise[];
  estimatedDuration: number; // minutos
  color: string;
  isActive: boolean;
  timesCompleted: number;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
}
