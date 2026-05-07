import { getDatabase } from '../database/client';
import type { ExerciseVariation } from '../../domain/models';
import uuid from 'react-native-uuid';

interface VariationRow {
  id: string;
  exercise_id: string;
  name: string;
  icon_name: string;
  description: string | null;
  is_default: number;
  created_at: number;
}

function rowToVariation(row: VariationRow): ExerciseVariation {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    name: row.name,
    iconName: row.icon_name,
    description: row.description ?? undefined,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
  };
}

export const ExerciseVariationRepository = {
  async getByExercise(exerciseId: string): Promise<ExerciseVariation[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<VariationRow>(
      'SELECT * FROM exercise_variations WHERE exercise_id = ? ORDER BY is_default DESC, name ASC',
      [exerciseId]
    );
    return rows.map(rowToVariation);
  },

  async getById(id: string): Promise<ExerciseVariation | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<VariationRow>(
      'SELECT * FROM exercise_variations WHERE id = ?',
      [id]
    );
    return row ? rowToVariation(row) : null;
  },

  async create(data: Omit<ExerciseVariation, 'id' | 'createdAt'>): Promise<ExerciseVariation> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO exercise_variations (id, exercise_id, name, icon_name, description, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.exerciseId, data.name, data.iconName, data.description ?? null, data.isDefault ? 1 : 0, now]
    );
    return { ...data, id, createdAt: now };
  },

  async update(id: string, data: Partial<Pick<ExerciseVariation, 'name' | 'iconName' | 'description'>>): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE exercise_variations SET
         name        = COALESCE(?, name),
         icon_name   = COALESCE(?, icon_name),
         description = COALESCE(?, description)
       WHERE id = ?`,
      [data.name ?? null, data.iconName ?? null, data.description ?? null, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM exercise_variations WHERE id = ?', [id]);
  },

  // Crea las variaciones estándar de un ejercicio de golpe
  async bulkCreate(variations: Omit<ExerciseVariation, 'id' | 'createdAt'>[]): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    for (const v of variations) {
      const id = uuid.v4() as string;
      await db.runAsync(
        `INSERT OR IGNORE INTO exercise_variations (id, exercise_id, name, icon_name, description, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, v.exerciseId, v.name, v.iconName, v.description ?? null, v.isDefault ? 1 : 0, now]
      );
    }
  },
};
