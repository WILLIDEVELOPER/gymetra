import { getDatabase } from '../database/client';
import type { Achievement, AchievementCode, AchievementCheckContext } from '../../domain/models';

interface AchievementRow {
  id: string;
  code: string;
  title: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  unlocked: number;
  unlocked_at: number | null;
  progress: number;
  max_progress: number;
}

function rowToAchievement(row: AchievementRow): Achievement {
  return {
    id: row.id,
    code: row.code as AchievementCode,
    title: row.title,
    description: row.description,
    iconName: row.icon_name,
    xpReward: row.xp_reward,
    unlocked: row.unlocked === 1,
    unlockedAt: row.unlocked_at ?? undefined,
    progress: row.progress,
    maxProgress: row.max_progress,
  };
}

export const AchievementRepository = {
  async getAll(): Promise<Achievement[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AchievementRow>(
      'SELECT * FROM achievements ORDER BY unlocked DESC, xp_reward DESC'
    );
    return rows.map(rowToAchievement);
  },

  async getUnlocked(): Promise<Achievement[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AchievementRow>(
      'SELECT * FROM achievements WHERE unlocked = 1 ORDER BY unlocked_at DESC'
    );
    return rows.map(rowToAchievement);
  },

  async updateProgress(code: AchievementCode, progress: number): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AchievementRow>(
      'SELECT * FROM achievements WHERE code = ?',
      [code]
    );
    if (!row || row.unlocked === 1) return false;

    const newProgress = Math.min(progress, row.max_progress);
    const shouldUnlock = newProgress >= row.max_progress;

    await db.runAsync(
      `UPDATE achievements SET
         progress    = ?,
         unlocked    = ?,
         unlocked_at = CASE WHEN ? = 1 THEN ? ELSE unlocked_at END
       WHERE code = ?`,
      [newProgress, shouldUnlock ? 1 : 0, shouldUnlock ? 1 : 0, Date.now(), code]
    );

    return shouldUnlock;
  },

  // Evalúa todos los logros pendientes con el contexto del workout completado.
  // Devuelve la lista de logros recién desbloqueados.
  async checkAndUnlock(ctx: AchievementCheckContext): Promise<Achievement[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AchievementRow>(
      'SELECT * FROM achievements WHERE unlocked = 0'
    );

    const newlyUnlocked: Achievement[] = [];

    for (const row of rows) {
      let newProgress = row.progress;

      switch (row.code as AchievementCode) {
        case 'FIRST_WORKOUT':
          newProgress = Math.min(ctx.totalWorkouts, 1);
          break;
        case 'STREAK_3':
          newProgress = Math.min(ctx.currentStreak, 3);
          break;
        case 'STREAK_7':
          newProgress = Math.min(ctx.currentStreak, 7);
          break;
        case 'STREAK_30':
          newProgress = Math.min(ctx.currentStreak, 30);
          break;
        case 'WORKOUTS_5':
          newProgress = Math.min(ctx.totalWorkouts, 5);
          break;
        case 'WORKOUTS_10':
          newProgress = Math.min(ctx.totalWorkouts, 10);
          break;
        case 'WORKOUTS_50':
          newProgress = Math.min(ctx.totalWorkouts, 50);
          break;
        case 'WORKOUTS_100':
          newProgress = Math.min(ctx.totalWorkouts, 100);
          break;
        case 'FIRST_PR':
          newProgress = ctx.totalPRsEver >= 1 ? 1 : 0;
          break;
        case 'PRS_10':
          newProgress = Math.min(ctx.totalPRsEver, 10);
          break;
        case 'VOLUME_1T':
          newProgress = ctx.sessionVolume >= 1000 ? 1 : 0;
          break;
        case 'VOLUME_TOTAL_100T':
          newProgress = ctx.totalVolumeCareer >= 100000 ? 1 : 0;
          break;
        case 'LEVEL_5':
          newProgress = ctx.currentLevel >= 5 ? 1 : 0;
          break;
        case 'LEVEL_10':
          newProgress = ctx.currentLevel >= 10 ? 1 : 0;
          break;
        case 'FIRST_LEGS':
          newProgress = ctx.muscleGroupsThisSession.some(
            (m) => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m)
          ) ? 1 : 0;
          break;
        case 'EARLY_BIRD':
          newProgress = ctx.sessionStartHour < 7 ? 1 : 0;
          break;
        case 'NIGHT_OWL':
          newProgress = ctx.sessionStartHour >= 22 ? 1 : 0;
          break;
        case 'LONG_SESSION':
          newProgress = ctx.sessionDurationSeconds >= 90 * 60 ? 1 : 0;
          break;
        case 'PERFECT_WEEK':
          newProgress = Math.min(ctx.workoutsThisWeek, 5);
          break;
        case 'VARIETY':
          newProgress = Math.min(new Set(ctx.muscleGroupsCareer).size, 5);
          break;
      }

      // Solo actualizar si hay progreso nuevo
      if (newProgress > row.progress) {
        const shouldUnlock = newProgress >= row.max_progress;
        await db.runAsync(
          `UPDATE achievements SET
             progress    = ?,
             unlocked    = ?,
             unlocked_at = CASE WHEN ? = 1 THEN ? ELSE unlocked_at END
           WHERE id = ?`,
          [newProgress, shouldUnlock ? 1 : 0, shouldUnlock ? 1 : 0, Date.now(), row.id]
        );
        if (shouldUnlock) {
          newlyUnlocked.push(rowToAchievement({ ...row, progress: newProgress, unlocked: 1, unlocked_at: Date.now() }));
        }
      }
    }

    return newlyUnlocked;
  },

  async getTotalPRs(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM personal_records'
    );
    return row?.count ?? 0;
  },

  async getDistinctMuscleGroupsCareer(): Promise<string[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ muscle_group: string }>(
      `SELECT DISTINCT e.muscle_group
       FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
       JOIN workouts w ON w.id = we.workout_id
       WHERE w.status = 'completed'`
    );
    return rows.map((r) => r.muscle_group);
  },

  async getWorkoutsThisWeek(weekStart: number): Promise<number> {
    const db = await getDatabase();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM workouts
       WHERE status = 'completed' AND started_at >= ? AND started_at < ?`,
      [weekStart, weekEnd]
    );
    return row?.count ?? 0;
  },
};
