export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes'
  | 'calves' | 'full_body' | 'cardio' | 'other';

export type EquipmentType =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'bands' | 'other';

export type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'stretch';

// Determina cómo se registran las series de este ejercicio
export type ExerciseType = 'weight' | 'duration' | 'bodyweight';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  category: ExerciseCategory;
  exerciseType: ExerciseType;
  isCustom: boolean;
  instructions?: string;
  videoUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// Variación de un ejercicio (agarre abierto, cerrado, martillo, etc.)
export interface ExerciseVariation {
  id: string;
  exerciseId: string;
  name: string;
  iconName: string;
  description?: string;
  isDefault: boolean;
  createdAt: number;
}

export interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  rpe?: number;
  tempo?: string;
  tut?: number;
  restSeconds: number;
  isWarmup: boolean;
  isDropset: boolean;
  completed: boolean;
  notes?: string;
  // Campos para ejercicios de duración/cardio
  durationSeconds?: number;
  distanceMeters?: number;
  calories?: number;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise?: Exercise;
  variationId?: string;
  variation?: ExerciseVariation;
  orderIndex: number;
  sets: ExerciseSet[];
  notes?: string;
}
