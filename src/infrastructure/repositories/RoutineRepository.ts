import { getDatabase } from '../database/client';
import type { Routine, RoutineCategory, RoutineExercise, DayOfWeek } from '../../domain/models';
import uuid from 'react-native-uuid';

interface RoutineRow {
  id: string; name: string; description: string | null;
  category: string; scheduled_days: string;
  estimated_duration: number; color: string;
  is_active: number; times_completed: number;
  last_used_at: number | null; created_at: number; updated_at: number;
}

interface RoutineExerciseRow {
  id: string; routine_id: string; exercise_id: string;
  order_index: number; target_sets: number; target_reps: number;
  target_weight: number | null; target_rir: number | null;
  rest_seconds: number; notes: string | null;
}

function rowToRoutine(row: RoutineRow, exercises: RoutineExercise[] = []): Routine {
  return {
    id: row.id, name: row.name,
    description: row.description ?? undefined,
    category: row.category as RoutineCategory,
    scheduledDays: JSON.parse(row.scheduled_days || '[]') as DayOfWeek[],
    exercises,
    estimatedDuration: row.estimated_duration,
    color: row.color,
    isActive: row.is_active === 1,
    timesCompleted: row.times_completed,
    lastUsedAt: row.last_used_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToRoutineExercise(row: RoutineExerciseRow): RoutineExercise {
  return {
    id: row.id, routineId: row.routine_id, exerciseId: row.exercise_id,
    orderIndex: row.order_index,
    targetSets: row.target_sets, targetReps: row.target_reps,
    targetWeight: row.target_weight ?? undefined,
    targetRir: row.target_rir ?? undefined,
    restSeconds: row.rest_seconds,
    notes: row.notes ?? undefined,
  };
}

export const RoutineRepository = {
  async getAll(): Promise<Routine[]> {
    const db = await getDatabase();
    const routineRows = await db.getAllAsync<RoutineRow>(
      'SELECT * FROM routines ORDER BY updated_at DESC'
    );
    const routines: Routine[] = [];
    for (const row of routineRows) {
      const exRows = await db.getAllAsync<RoutineExerciseRow>(
        'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC',
        [row.id]
      );
      routines.push(rowToRoutine(row, exRows.map(rowToRoutineExercise)));
    }
    return routines;
  },

  async getById(id: string): Promise<Routine | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<RoutineRow>(
      'SELECT * FROM routines WHERE id = ?', [id]
    );
    if (!row) return null;
    const exRows = await db.getAllAsync<RoutineExerciseRow>(
      'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC',
      [id]
    );
    return rowToRoutine(row, exRows.map(rowToRoutineExercise));
  },

  async create(data: Omit<Routine, 'id' | 'createdAt' | 'updatedAt' | 'timesCompleted'>): Promise<Routine> {
    const db = await getDatabase();
    const now = Date.now();
    const id = uuid.v4() as string;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO routines
          (id, name, description, category, scheduled_days, estimated_duration,
           color, is_active, times_completed, last_used_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, data.name, data.description ?? null,
          data.category, JSON.stringify(data.scheduledDays),
          data.estimatedDuration, data.color,
          data.isActive ? 1 : 0, 0,
          data.lastUsedAt ?? null, now, now,
        ]
      );

      for (const ex of data.exercises) {
        const exId = uuid.v4() as string;
        await db.runAsync(
          `INSERT INTO routine_exercises
            (id, routine_id, exercise_id, order_index, target_sets, target_reps,
             target_weight, target_rir, rest_seconds, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            exId, id, ex.exerciseId, ex.orderIndex,
            ex.targetSets, ex.targetReps,
            ex.targetWeight ?? null, ex.targetRir ?? null,
            ex.restSeconds, ex.notes ?? null,
          ]
        );
      }
    });

    return { ...data, id, timesCompleted: 0, createdAt: now, updatedAt: now };
  },

  async update(id: string, data: Partial<Omit<Routine, 'id' | 'createdAt'>>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE routines SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          scheduled_days = COALESCE(?, scheduled_days),
          estimated_duration = COALESCE(?, estimated_duration),
          color = COALESCE(?, color),
          is_active = COALESCE(?, is_active),
          updated_at = ?
         WHERE id = ?`,
        [
          data.name ?? null,
          data.description ?? null,
          data.category ?? null,
          data.scheduledDays ? JSON.stringify(data.scheduledDays) : null,
          data.estimatedDuration ?? null,
          data.color ?? null,
          data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
          now, id,
        ]
      );

      if (data.exercises) {
        await db.runAsync('DELETE FROM routine_exercises WHERE routine_id = ?', [id]);
        for (const ex of data.exercises) {
          const exId = uuid.v4() as string;
          await db.runAsync(
            `INSERT INTO routine_exercises
              (id, routine_id, exercise_id, order_index, target_sets, target_reps,
               target_weight, target_rir, rest_seconds, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              exId, id, ex.exerciseId, ex.orderIndex,
              ex.targetSets, ex.targetReps,
              ex.targetWeight ?? null, ex.targetRir ?? null,
              ex.restSeconds, ex.notes ?? null,
            ]
          );
        }
      }
    });
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM routines WHERE id = ?', [id]);
  },

  async duplicate(id: string): Promise<Routine> {
    const original = await this.getById(id);
    if (!original) throw new Error('Rutina no encontrada');
    return this.create({
      ...original,
      name: `${original.name} (copia)`,
      isActive: true,
      lastUsedAt: undefined,
    });
  },

  async incrementTimesCompleted(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE routines SET times_completed = times_completed + 1, last_used_at = ?, updated_at = ? WHERE id = ?',
      [Date.now(), Date.now(), id]
    );
  },
};
