import { getDatabase } from '../database/client';
import type {
  Workout, WorkoutSummary, WorkoutExercise, ExerciseSet,
} from '../../domain/models';
import uuid from 'react-native-uuid';

interface WorkoutRow {
  id: string; routine_id: string | null; routine_name: string | null;
  name: string; status: string; started_at: number;
  completed_at: number | null; duration_seconds: number;
  total_volume: number; total_sets: number; total_reps: number;
  notes: string | null; rating: number | null;
  body_weight: number | null; xp_earned: number;
}

interface WorkoutExerciseRow {
  id: string; workout_id: string; exercise_id: string;
  order_index: number; notes: string | null;
  variation_id: string | null;
}

interface ExerciseSetRow {
  id: string; workout_exercise_id: string; set_number: number;
  weight: number; reps: number; rir: number;
  rpe: number | null; tempo: string | null; tut: number | null;
  rest_seconds: number; is_warmup: number; is_dropset: number;
  completed: number; notes: string | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  calories: number | null;
}

function rowToWorkout(row: WorkoutRow, exercises: WorkoutExercise[] = []): Workout {
  return {
    id: row.id, routineId: row.routine_id ?? undefined,
    routineName: row.routine_name ?? undefined,
    name: row.name, status: row.status as Workout['status'],
    startedAt: row.started_at, completedAt: row.completed_at ?? undefined,
    durationSeconds: row.duration_seconds,
    totalVolume: row.total_volume, totalSets: row.total_sets,
    totalReps: row.total_reps, exercises,
    notes: row.notes ?? undefined, rating: row.rating ?? undefined,
    bodyWeight: row.body_weight ?? undefined, xpEarned: row.xp_earned,
  };
}

function rowToSet(row: ExerciseSetRow): ExerciseSet {
  return {
    id: row.id, workoutExerciseId: row.workout_exercise_id,
    setNumber: row.set_number, weight: row.weight, reps: row.reps,
    rir: row.rir, rpe: row.rpe ?? undefined, tempo: row.tempo ?? undefined,
    tut: row.tut ?? undefined, restSeconds: row.rest_seconds,
    isWarmup: row.is_warmup === 1, isDropset: row.is_dropset === 1,
    completed: row.completed === 1, notes: row.notes ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    distanceMeters: row.distance_meters ?? undefined,
    calories: row.calories ?? undefined,
  };
}

export const WorkoutRepository = {
  async create(data: Omit<Workout, 'id' | 'exercises'>): Promise<string> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    await db.runAsync(
      `INSERT INTO workouts
        (id, routine_id, routine_name, name, status, started_at,
         completed_at, duration_seconds, total_volume, total_sets,
         total_reps, notes, rating, body_weight, xp_earned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.routineId ?? null, data.routineName ?? null,
        data.name, data.status, data.startedAt,
        data.completedAt ?? null, data.durationSeconds,
        data.totalVolume, data.totalSets, data.totalReps,
        data.notes ?? null, data.rating ?? null,
        data.bodyWeight ?? null, data.xpEarned,
      ]
    );
    return id;
  },

  async addExercise(
    workoutId: string,
    exerciseId: string,
    orderIndex: number,
    variationId?: string
  ): Promise<string> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    await db.runAsync(
      'INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, variation_id) VALUES (?, ?, ?, ?, ?)',
      [id, workoutId, exerciseId, orderIndex, variationId ?? null]
    );
    return id;
  },

  async addSet(data: Omit<ExerciseSet, 'id'>): Promise<string> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    await db.runAsync(
      `INSERT INTO exercise_sets
        (id, workout_exercise_id, set_number, weight, reps, rir, rpe,
         tempo, tut, rest_seconds, is_warmup, is_dropset, completed, notes,
         duration_seconds, distance_meters, calories)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.workoutExerciseId, data.setNumber,
        data.weight, data.reps, data.rir,
        data.rpe ?? null, data.tempo ?? null, data.tut ?? null,
        data.restSeconds, data.isWarmup ? 1 : 0,
        data.isDropset ? 1 : 0, data.completed ? 1 : 0,
        data.notes ?? null,
        data.durationSeconds ?? null,
        data.distanceMeters ?? null,
        data.calories ?? null,
      ]
    );
    return id;
  },

  async updateSet(id: string, data: Partial<ExerciseSet>): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE exercise_sets SET
        weight           = COALESCE(?, weight),
        reps             = COALESCE(?, reps),
        rir              = COALESCE(?, rir),
        rpe              = COALESCE(?, rpe),
        completed        = COALESCE(?, completed),
        notes            = COALESCE(?, notes),
        duration_seconds = COALESCE(?, duration_seconds),
        distance_meters  = COALESCE(?, distance_meters),
        calories         = COALESCE(?, calories)
       WHERE id = ?`,
      [
        data.weight ?? null,
        data.reps ?? null,
        data.rir ?? null,
        data.rpe ?? null,
        data.completed !== undefined ? (data.completed ? 1 : 0) : null,
        data.notes ?? null,
        data.durationSeconds ?? null,
        data.distanceMeters ?? null,
        data.calories ?? null,
        id,
      ]
    );
  },

  async completeWorkout(id: string, summary: {
    durationSeconds: number; totalVolume: number;
    totalSets: number; totalReps: number; xpEarned: number;
    rating?: number; notes?: string;
  }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE workouts SET
        status = 'completed', completed_at = ?,
        duration_seconds = ?, total_volume = ?,
        total_sets = ?, total_reps = ?,
        xp_earned = ?, rating = ?, notes = ?
       WHERE id = ?`,
      [
        Date.now(), summary.durationSeconds, summary.totalVolume,
        summary.totalSets, summary.totalReps, summary.xpEarned,
        summary.rating ?? null, summary.notes ?? null, id,
      ]
    );
  },

  async getById(id: string): Promise<Workout | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WorkoutRow>('SELECT * FROM workouts WHERE id = ?', [id]);
    if (!row) return null;

    const weRows = await db.getAllAsync<WorkoutExerciseRow>(
      'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index', [id]
    );

    const exercises: WorkoutExercise[] = await Promise.all(
      weRows.map(async (we) => {
        const sets = await db.getAllAsync<ExerciseSetRow>(
          'SELECT * FROM exercise_sets WHERE workout_exercise_id = ? ORDER BY set_number', [we.id]
        );
        return {
          id: we.id, workoutId: we.workout_id, exerciseId: we.exercise_id,
          variationId: we.variation_id ?? undefined,
          orderIndex: we.order_index, notes: we.notes ?? undefined,
          sets: sets.map(rowToSet),
        };
      })
    );

    return rowToWorkout(row, exercises);
  },

  async getRecent(limit = 20, offset = 0): Promise<WorkoutSummary[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<WorkoutRow & { exercise_count: number }>(
      `SELECT w.*, COUNT(DISTINCT we.id) as exercise_count
       FROM workouts w
       LEFT JOIN workout_exercises we ON we.workout_id = w.id
       WHERE w.status = 'completed'
       GROUP BY w.id
       ORDER BY w.started_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map((r) => ({
      id: r.id, name: r.name, routineName: r.routine_name ?? undefined,
      startedAt: r.started_at, durationSeconds: r.duration_seconds,
      totalVolume: r.total_volume, totalSets: r.total_sets,
      exerciseCount: r.exercise_count, xpEarned: r.xp_earned,
    }));
  },

  async getInProgress(): Promise<Workout | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WorkoutRow>(
      "SELECT * FROM workouts WHERE status = 'in_progress' ORDER BY started_at DESC LIMIT 1"
    );
    if (!row) return null;
    return this.getById(row.id);
  },

  async getExerciseSetsHistory(exerciseId: string, limit = 30): Promise<{
    workoutId: string; date: number; sets: ExerciseSet[];
  }[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      workout_id: string; started_at: number;
      set_id: string; weight: number; reps: number; rir: number;
      is_warmup: number; completed: number; set_number: number;
      workout_exercise_id: string; rpe: number | null;
      tempo: string | null; tut: number | null; rest_seconds: number;
      is_dropset: number; notes: string | null;
      duration_seconds: number | null;
      distance_meters: number | null;
      calories: number | null;
    }>(
      `SELECT w.id as workout_id, w.started_at,
              s.id as set_id, s.weight, s.reps, s.rir, s.is_warmup,
              s.completed, s.set_number, s.workout_exercise_id,
              s.rpe, s.tempo, s.tut, s.rest_seconds, s.is_dropset, s.notes,
              s.duration_seconds, s.distance_meters, s.calories
       FROM workouts w
       JOIN workout_exercises we ON we.workout_id = w.id
       JOIN exercise_sets s ON s.workout_exercise_id = we.id
       WHERE we.exercise_id = ? AND w.status = 'completed' AND s.is_warmup = 0
       ORDER BY w.started_at DESC
       LIMIT ?`,
      [exerciseId, limit]
    );

    const grouped = new Map<string, { workoutId: string; date: number; sets: ExerciseSet[] }>();
    for (const r of rows) {
      if (!grouped.has(r.workout_id)) {
        grouped.set(r.workout_id, { workoutId: r.workout_id, date: r.started_at, sets: [] });
      }
      grouped.get(r.workout_id)!.sets.push({
        id: r.set_id, workoutExerciseId: r.workout_exercise_id,
        setNumber: r.set_number, weight: r.weight, reps: r.reps,
        rir: r.rir, rpe: r.rpe ?? undefined, tempo: r.tempo ?? undefined,
        tut: r.tut ?? undefined, restSeconds: r.rest_seconds,
        isWarmup: r.is_warmup === 1, isDropset: r.is_dropset === 1,
        completed: r.completed === 1, notes: r.notes ?? undefined,
        durationSeconds: r.duration_seconds ?? undefined,
        distanceMeters: r.distance_meters ?? undefined,
        calories: r.calories ?? undefined,
      });
    }
    return Array.from(grouped.values());
  },

  async getWeeklyStats(weekStart: number): Promise<{
    workoutCount: number; totalVolume: number;
    totalDuration: number; xpEarned: number;
  }> {
    const db = await getDatabase();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    const row = await db.getFirstAsync<{
      workout_count: number; total_volume: number;
      total_duration: number; xp_earned: number;
    }>(
      `SELECT COUNT(*) as workout_count,
              COALESCE(SUM(total_volume), 0) as total_volume,
              COALESCE(SUM(duration_seconds), 0) as total_duration,
              COALESCE(SUM(xp_earned), 0) as xp_earned
       FROM workouts
       WHERE status = 'completed' AND started_at >= ? AND started_at < ?`,
      [weekStart, weekEnd]
    );
    return {
      workoutCount: row?.workout_count ?? 0,
      totalVolume: row?.total_volume ?? 0,
      totalDuration: row?.total_duration ?? 0,
      xpEarned: row?.xp_earned ?? 0,
    };
  },

  // Obtiene el volumen por grupo muscular en el período dado
  async getMuscleGroupVolume(since: number): Promise<Record<string, number>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ muscle_group: string; volume: number }>(
      `SELECT e.muscle_group, COALESCE(SUM(s.weight * s.reps), 0) as volume
       FROM workouts w
       JOIN workout_exercises we ON we.workout_id = w.id
       JOIN exercises e ON e.id = we.exercise_id
       JOIN exercise_sets s ON s.workout_exercise_id = we.id
       WHERE w.status = 'completed' AND w.started_at >= ? AND s.is_warmup = 0 AND s.completed = 1
       GROUP BY e.muscle_group`,
      [since]
    );
    return Object.fromEntries(rows.map((r) => [r.muscle_group, r.volume]));
  },

  // Historial de workouts para heatmap (últimos N días)
  async getWorkoutDates(daysBack = 90): Promise<number[]> {
    const db = await getDatabase();
    const since = Date.now() - daysBack * 24 * 60 * 60 * 1000;
    const rows = await db.getAllAsync<{ started_at: number }>(
      `SELECT started_at FROM workouts WHERE status = 'completed' AND started_at >= ? ORDER BY started_at ASC`,
      [since]
    );
    return rows.map((r) => r.started_at);
  },

  // Estadísticas de las últimas 8 semanas para gráfica de barras
  async getLast8WeeksStats(): Promise<Array<{ weekStart: number; count: number; volume: number }>> {
    const db = await getDatabase();
    const results = [];
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      const weekStart = now - i * 7 * 24 * 60 * 60 * 1000;
      const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
      const row = await db.getFirstAsync<{ count: number; volume: number }>(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_volume), 0) as volume
         FROM workouts WHERE status = 'completed' AND started_at >= ? AND started_at < ?`,
        [weekStart, weekEnd]
      );
      results.push({ weekStart, count: row?.count ?? 0, volume: row?.volume ?? 0 });
    }
    return results;
  },
};
