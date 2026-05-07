export type AchievementCode =
  | 'FIRST_WORKOUT'
  | 'STREAK_3' | 'STREAK_7' | 'STREAK_30'
  | 'WORKOUTS_5' | 'WORKOUTS_10' | 'WORKOUTS_50' | 'WORKOUTS_100'
  | 'FIRST_PR' | 'PRS_10'
  | 'VOLUME_1T' | 'VOLUME_TOTAL_100T'
  | 'LEVEL_5' | 'LEVEL_10'
  | 'FIRST_LEGS'
  | 'EARLY_BIRD' | 'NIGHT_OWL'
  | 'LONG_SESSION' | 'PERFECT_WEEK' | 'VARIETY';

export interface Achievement {
  id: string;
  code: AchievementCode;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

// Contexto que se pasa al verificar logros tras completar un workout
export interface AchievementCheckContext {
  totalWorkouts: number;
  currentStreak: number;
  totalPRsEver: number;         // PRs acumulados en toda la carrera
  newPRsThisSession: number;
  sessionVolume: number;        // kg levantados en esta sesión
  totalVolumeCareer: number;    // kg totales en toda la carrera
  currentLevel: number;
  sessionDurationSeconds: number;
  sessionStartHour: number;     // 0-23
  muscleGroupsThisSession: string[];
  workoutsThisWeek: number;
  muscleGroupsCareer: string[]; // grupos entrenados en toda la carrera (distintos)
}
