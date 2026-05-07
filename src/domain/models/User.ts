export type FitnessGoal = 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export interface UserStats {
  strength: number;      // 0-100
  discipline: number;    // 0-100
  consistency: number;   // 0-100
  volume: number;        // Volumen acumulado en toneladas
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  bodyWeight?: number;
  height?: number;
  age?: number;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  // RPG
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  stats: UserStats;
  // Racha
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: number;
  // Totales
  totalWorkouts: number;
  totalVolume: number;    // kg totales levantados en toda la vida
  totalDuration: number;  // segundos totales entrenados
  createdAt: number;
  updatedAt: number;
}

// XP por acción
export const XP_REWARDS = {
  WORKOUT_COMPLETE:   100,
  NEW_PR:             50,
  STREAK_BONUS:       25,
  FIRST_WORKOUT:      200,
  CONSECUTIVE_WEEK:   75,
} as const;

// XP necesaria para cada nivel (fórmula: nivel * 200 + nivel^2 * 50)
export function xpForLevel(level: number): number {
  return level * 200 + level * level * 50;
}

export function getLevelTitle(level: number): string {
  if (level <= 5)  return 'Novato';
  if (level <= 10) return 'Atleta';
  if (level <= 20) return 'Guerrero';
  if (level <= 30) return 'Élite';
  if (level <= 50) return 'Leyenda';
  return 'Mítico';
}
