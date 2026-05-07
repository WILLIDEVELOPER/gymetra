import { getDatabase } from '../database/client';
import type { UserProfile, UserStats, FitnessGoal, ExperienceLevel } from '../../domain/models';
import { xpForLevel } from '../../domain/models';
import uuid from 'react-native-uuid';

const DEFAULT_ID = 'local-user';

interface UserRow {
  id: string; name: string; body_weight: number | null;
  height: number | null; age: number | null;
  goal: string; exp_level: string; level: number; xp: number;
  total_xp: number; stat_strength: number; stat_discipline: number;
  stat_consistency: number; stat_volume: number;
  current_streak: number; longest_streak: number;
  last_workout_date: number | null; total_workouts: number;
  total_volume: number; total_duration: number;
  created_at: number; updated_at: number;
}

function rowToUser(row: UserRow): UserProfile {
  return {
    id: row.id, name: row.name,
    bodyWeight: row.body_weight ?? undefined,
    height: row.height ?? undefined,
    age: row.age ?? undefined,
    goal: row.goal as FitnessGoal,
    experienceLevel: row.exp_level as ExperienceLevel,
    level: row.level, xp: row.xp, totalXp: row.total_xp,
    xpToNextLevel: xpForLevel(row.level + 1),
    stats: {
      strength:    row.stat_strength,
      discipline:  row.stat_discipline,
      consistency: row.stat_consistency,
      volume:      row.stat_volume,
    },
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastWorkoutDate: row.last_workout_date ?? undefined,
    totalWorkouts: row.total_workouts,
    totalVolume: row.total_volume,
    totalDuration: row.total_duration,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export const UserRepository = {
  async getOrCreate(): Promise<UserProfile> {
    const db = await getDatabase();
    let row = await db.getFirstAsync<UserRow>(
      'SELECT * FROM user_profile WHERE id = ?', [DEFAULT_ID]
    );

    if (!row) {
      const now = Date.now();
      await db.runAsync(
        `INSERT INTO user_profile
          (id, name, goal, exp_level, level, xp, total_xp,
           stat_strength, stat_discipline, stat_consistency, stat_volume,
           current_streak, longest_streak, total_workouts,
           total_volume, total_duration, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [DEFAULT_ID, 'Atleta', 'hypertrophy', 'beginner',
         1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, now, now]
      );
      row = await db.getFirstAsync<UserRow>(
        'SELECT * FROM user_profile WHERE id = ?', [DEFAULT_ID]
      );
    }

    return rowToUser(row!);
  },

  async update(data: Partial<UserProfile>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      `UPDATE user_profile SET
        name          = COALESCE(?, name),
        body_weight   = COALESCE(?, body_weight),
        height        = COALESCE(?, height),
        age           = COALESCE(?, age),
        goal          = COALESCE(?, goal),
        exp_level     = COALESCE(?, exp_level),
        level         = COALESCE(?, level),
        xp            = COALESCE(?, xp),
        total_xp      = COALESCE(?, total_xp),
        stat_strength    = COALESCE(?, stat_strength),
        stat_discipline  = COALESCE(?, stat_discipline),
        stat_consistency = COALESCE(?, stat_consistency),
        stat_volume      = COALESCE(?, stat_volume),
        current_streak   = COALESCE(?, current_streak),
        longest_streak   = COALESCE(?, longest_streak),
        last_workout_date = COALESCE(?, last_workout_date),
        total_workouts   = COALESCE(?, total_workouts),
        total_volume     = COALESCE(?, total_volume),
        total_duration   = COALESCE(?, total_duration),
        updated_at       = ?
       WHERE id = ?`,
      [
        data.name ?? null,
        data.bodyWeight ?? null,
        data.height ?? null,
        data.age ?? null,
        data.goal ?? null,
        data.experienceLevel ?? null,
        data.level ?? null,
        data.xp ?? null,
        data.totalXp ?? null,
        data.stats?.strength ?? null,
        data.stats?.discipline ?? null,
        data.stats?.consistency ?? null,
        data.stats?.volume ?? null,
        data.currentStreak ?? null,
        data.longestStreak ?? null,
        data.lastWorkoutDate ?? null,
        data.totalWorkouts ?? null,
        data.totalVolume ?? null,
        data.totalDuration ?? null,
        now, DEFAULT_ID,
      ]
    );
  },

  async addXp(amount: number): Promise<{ newLevel: number; leveledUp: boolean }> {
    const profile = await this.getOrCreate();
    const newTotalXp = profile.totalXp + amount;
    let newLevel = profile.level;
    let currentXp = profile.xp + amount;

    let leveledUp = false;
    while (currentXp >= xpForLevel(newLevel + 1)) {
      currentXp -= xpForLevel(newLevel + 1);
      newLevel++;
      leveledUp = true;
    }

    await this.update({
      xp: currentXp, totalXp: newTotalXp, level: newLevel,
    });
    return { newLevel, leveledUp };
  },
};
