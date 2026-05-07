import { getDatabase } from '../database/client';
import type { PersonalRecord } from '../../domain/models';
import uuid from 'react-native-uuid';

interface PRRow {
  id: string; exercise_id: string; exercise_name: string;
  type: string; value: number; weight: number | null;
  reps: number | null; workout_id: string; achieved_at: number;
}

function rowToPR(row: PRRow): PersonalRecord {
  return {
    id: row.id, exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    type: row.type as PersonalRecord['type'],
    value: row.value, weight: row.weight ?? undefined,
    reps: row.reps ?? undefined, workoutId: row.workout_id,
    achievedAt: row.achieved_at,
  };
}

export const PRRepository = {
  async getAll(): Promise<PersonalRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PRRow>(
      'SELECT * FROM personal_records ORDER BY achieved_at DESC'
    );
    return rows.map(rowToPR);
  },

  async getByExercise(exerciseId: string): Promise<PersonalRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PRRow>(
      'SELECT * FROM personal_records WHERE exercise_id = ? ORDER BY achieved_at DESC',
      [exerciseId]
    );
    return rows.map(rowToPR);
  },

  async upsertPR(data: Omit<PersonalRecord, 'id'>): Promise<boolean> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<PRRow>(
      'SELECT * FROM personal_records WHERE exercise_id = ? AND type = ?',
      [data.exerciseId, data.type]
    );

    if (!existing || data.value > existing.value) {
      if (existing) {
        await db.runAsync(
          `UPDATE personal_records SET
            value = ?, weight = ?, reps = ?,
            workout_id = ?, achieved_at = ?
           WHERE id = ?`,
          [data.value, data.weight ?? null, data.reps ?? null,
           data.workoutId, data.achievedAt, existing.id]
        );
      } else {
        const id = uuid.v4() as string;
        await db.runAsync(
          `INSERT INTO personal_records
            (id, exercise_id, exercise_name, type, value, weight, reps, workout_id, achieved_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, data.exerciseId, data.exerciseName, data.type,
           data.value, data.weight ?? null, data.reps ?? null,
           data.workoutId, data.achievedAt]
        );
      }
      return true; // Es nuevo PR
    }
    return false;
  },
};
