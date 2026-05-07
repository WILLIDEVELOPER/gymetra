export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes'
  | 'calves' | 'full_body' | 'cardio' | 'other';

export type EquipmentType =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'bands' | 'other';

export type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'stretch';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  category: ExerciseCategory;
  isCustom: boolean;
  instructions?: string;
  videoUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;         // kg
  reps: number;
  rir: number;            // Reps In Reserve
  rpe?: number;           // Rate of Perceived Exertion
  tempo?: string;         // e.g. "3-1-2-0" (exc-pause-conc-top)
  tut?: number;           // Time Under Tension en segundos
  restSeconds: number;
  isWarmup: boolean;
  isDropset: boolean;
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise?: Exercise;
  orderIndex: number;
  sets: ExerciseSet[];
  notes?: string;
}
