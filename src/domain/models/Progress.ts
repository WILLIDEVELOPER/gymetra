export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume' | '1rm';
  value: number;
  weight?: number;
  reps?: number;
  workoutId: string;
  achievedAt: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  entries: ExerciseProgressEntry[];
  pr: PersonalRecord | null;
}

export interface ExerciseProgressEntry {
  date: number;
  workoutId: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  bestSet: {
    weight: number;
    reps: number;
    estimated1rm: number;
  };
}

export interface WeeklyStats {
  weekStart: number;
  workoutCount: number;
  totalVolume: number;
  totalDuration: number;
  totalSets: number;
  muscleGroups: Record<string, number>;
  xpEarned: number;
}

export interface MuscleFrequency {
  muscleGroup: string;
  setsThisWeek: number;
  setsLastWeek: number;
  totalSets: number;
}
