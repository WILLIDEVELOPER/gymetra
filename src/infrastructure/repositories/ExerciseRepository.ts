import { getDatabase } from '../database/client';
import type { Exercise, MuscleGroup, EquipmentType, ExerciseCategory } from '../../domain/models';
import uuid from 'react-native-uuid';

interface ExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string;
  equipment: string;
  category: string;
  is_custom: number;
  instructions: string | null;
  video_url: string | null;
  created_at: number;
  updated_at: number;
}

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group as MuscleGroup,
    secondaryMuscles: JSON.parse(row.secondary_muscles || '[]'),
    equipment: row.equipment as EquipmentType,
    category: row.category as ExerciseCategory,
    isCustom: row.is_custom === 1,
    instructions: row.instructions ?? undefined,
    videoUrl: row.video_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const ExerciseRepository = {
  async getAll(): Promise<Exercise[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises ORDER BY name ASC'
    );
    return rows.map(rowToExercise);
  },

  async getById(id: string): Promise<Exercise | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE id = ?', [id]
    );
    return row ? rowToExercise(row) : null;
  },

  async getByMuscleGroup(muscleGroup: MuscleGroup): Promise<Exercise[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name ASC', [muscleGroup]
    );
    return rows.map(rowToExercise);
  },

  async search(query: string): Promise<Exercise[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name ASC',
      [`%${query}%`]
    );
    return rows.map(rowToExercise);
  },

  async create(data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
    const db = await getDatabase();
    const now = Date.now();
    const id = uuid.v4() as string;

    await db.runAsync(
      `INSERT INTO exercises
        (id, name, muscle_group, secondary_muscles, equipment, category,
         is_custom, instructions, video_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.name, data.muscleGroup,
        JSON.stringify(data.secondaryMuscles),
        data.equipment, data.category,
        data.isCustom ? 1 : 0,
        data.instructions ?? null,
        data.videoUrl ?? null,
        now, now,
      ]
    );

    return { ...data, id, createdAt: now, updatedAt: now };
  },

  async update(id: string, data: Partial<Omit<Exercise, 'id' | 'createdAt'>>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      `UPDATE exercises SET
        name = COALESCE(?, name),
        muscle_group = COALESCE(?, muscle_group),
        secondary_muscles = COALESCE(?, secondary_muscles),
        equipment = COALESCE(?, equipment),
        category = COALESCE(?, category),
        instructions = COALESCE(?, instructions),
        updated_at = ?
       WHERE id = ?`,
      [
        data.name ?? null,
        data.muscleGroup ?? null,
        data.secondaryMuscles ? JSON.stringify(data.secondaryMuscles) : null,
        data.equipment ?? null,
        data.category ?? null,
        data.instructions ?? null,
        now, id,
      ]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM exercises WHERE id = ? AND is_custom = 1', [id]);
  },

  async bulkInsert(exercises: Omit<Exercise, 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.withTransactionAsync(async () => {
      for (const ex of exercises) {
        await db.runAsync(
          `INSERT OR IGNORE INTO exercises
            (id, name, muscle_group, secondary_muscles, equipment, category,
             is_custom, instructions, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ex.id, ex.name, ex.muscleGroup,
            JSON.stringify(ex.secondaryMuscles),
            ex.equipment, ex.category,
            ex.isCustom ? 1 : 0,
            ex.instructions ?? null,
            now, now,
          ]
        );
      }
    });
  },
};
