import { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { Exercise } from '../../domain/models';

const SEED_EXERCISES: Omit<Exercise, 'createdAt' | 'updatedAt'>[] = [
  // PECHO
  { id: 'ex-001', name: 'Press de Banca', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell', category: 'compound', isCustom: false, instructions: 'Acostado en el banco, baja la barra controladamente al pecho y empuja hacia arriba.' },
  { id: 'ex-002', name: 'Press Inclinado con Barra', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-003', name: 'Press Declinado con Barra', muscleGroup: 'chest', secondaryMuscles: ['triceps'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-004', name: 'Press de Banca con Mancuernas', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'dumbbell', category: 'compound', isCustom: false },
  { id: 'ex-005', name: 'Press Inclinado con Mancuernas', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], equipment: 'dumbbell', category: 'compound', isCustom: false },
  { id: 'ex-006', name: 'Aperturas con Mancuernas', muscleGroup: 'chest', secondaryMuscles: [], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-007', name: 'Crossover en Polea', muscleGroup: 'chest', secondaryMuscles: [], equipment: 'cable', category: 'isolation', isCustom: false },
  { id: 'ex-008', name: 'Fondos en Paralelas', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight', category: 'compound', isCustom: false },
  { id: 'ex-009', name: 'Pullover con Mancuerna', muscleGroup: 'chest', secondaryMuscles: ['back'], equipment: 'dumbbell', category: 'isolation', isCustom: false },

  // ESPALDA
  { id: 'ex-010', name: 'Peso Muerto', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'core'], equipment: 'barbell', category: 'compound', isCustom: false, instructions: 'Agarra la barra al ancho de los hombros, espalda recta, empuja el suelo hacia abajo.' },
  { id: 'ex-011', name: 'Dominadas', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight', category: 'compound', isCustom: false },
  { id: 'ex-012', name: 'Jalón al Pecho', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable', category: 'compound', isCustom: false },
  { id: 'ex-013', name: 'Remo con Barra', muscleGroup: 'back', secondaryMuscles: ['biceps', 'core'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-014', name: 'Remo con Mancuerna', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'dumbbell', category: 'compound', isCustom: false },
  { id: 'ex-015', name: 'Remo en Polea Baja', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable', category: 'compound', isCustom: false },
  { id: 'ex-016', name: 'Rack Pull', muscleGroup: 'back', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-017', name: 'Hiperextensiones', muscleGroup: 'back', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'bodyweight', category: 'isolation', isCustom: false },

  // HOMBROS
  { id: 'ex-018', name: 'Press Militar con Barra', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-019', name: 'Press con Mancuernas', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'dumbbell', category: 'compound', isCustom: false },
  { id: 'ex-020', name: 'Elevaciones Laterales', muscleGroup: 'shoulders', secondaryMuscles: [], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-021', name: 'Elevaciones Frontales', muscleGroup: 'shoulders', secondaryMuscles: [], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-022', name: 'Pájaros (Rear Delt Fly)', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-023', name: 'Face Pull', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'cable', category: 'isolation', isCustom: false },

  // BÍCEPS
  { id: 'ex-024', name: 'Curl con Barra', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'barbell', category: 'isolation', isCustom: false },
  { id: 'ex-025', name: 'Curl con Mancuernas', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-026', name: 'Curl Martillo', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-027', name: 'Curl Concentrado', muscleGroup: 'biceps', secondaryMuscles: [], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-028', name: 'Curl en Polea', muscleGroup: 'biceps', secondaryMuscles: [], equipment: 'cable', category: 'isolation', isCustom: false },
  { id: 'ex-029', name: 'Curl Predicador', muscleGroup: 'biceps', secondaryMuscles: [], equipment: 'barbell', category: 'isolation', isCustom: false },

  // TRÍCEPS
  { id: 'ex-030', name: 'Press Francés', muscleGroup: 'triceps', secondaryMuscles: [], equipment: 'barbell', category: 'isolation', isCustom: false },
  { id: 'ex-031', name: 'Fondos en Banco', muscleGroup: 'triceps', secondaryMuscles: ['shoulders'], equipment: 'bodyweight', category: 'compound', isCustom: false },
  { id: 'ex-032', name: 'Extensiones en Polea (Push Down)', muscleGroup: 'triceps', secondaryMuscles: [], equipment: 'cable', category: 'isolation', isCustom: false },
  { id: 'ex-033', name: 'Extensión con Mancuerna (Skull Crusher)', muscleGroup: 'triceps', secondaryMuscles: [], equipment: 'dumbbell', category: 'isolation', isCustom: false },
  { id: 'ex-034', name: 'Extensión sobre la Cabeza', muscleGroup: 'triceps', secondaryMuscles: [], equipment: 'cable', category: 'isolation', isCustom: false },

  // CUÁDRICEPS
  { id: 'ex-035', name: 'Sentadilla con Barra', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings', 'core'], equipment: 'barbell', category: 'compound', isCustom: false, instructions: 'Pies al ancho de hombros, desciende manteniendo la espalda recta hasta muslos paralelos.' },
  { id: 'ex-036', name: 'Prensa de Piernas', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'machine', category: 'compound', isCustom: false },
  { id: 'ex-037', name: 'Extensiones de Cuádriceps', muscleGroup: 'quads', secondaryMuscles: [], equipment: 'machine', category: 'isolation', isCustom: false },
  { id: 'ex-038', name: 'Zancadas (Lunges)', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'dumbbell', category: 'compound', isCustom: false },
  { id: 'ex-039', name: 'Sentadilla Frontal', muscleGroup: 'quads', secondaryMuscles: ['core'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-040', name: 'Hack Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine', category: 'compound', isCustom: false },

  // ISQUIOTIBIALES
  { id: 'ex-041', name: 'Peso Muerto Rumano', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-042', name: 'Curl Femoral Tumbado', muscleGroup: 'hamstrings', secondaryMuscles: [], equipment: 'machine', category: 'isolation', isCustom: false },
  { id: 'ex-043', name: 'Curl Femoral de Pie', muscleGroup: 'hamstrings', secondaryMuscles: [], equipment: 'machine', category: 'isolation', isCustom: false },
  { id: 'ex-044', name: 'Buenos Días (Good Mornings)', muscleGroup: 'hamstrings', secondaryMuscles: ['back', 'glutes'], equipment: 'barbell', category: 'compound', isCustom: false },

  // GLÚTEOS
  { id: 'ex-045', name: 'Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'barbell', category: 'compound', isCustom: false },
  { id: 'ex-046', name: 'Glute Kickback', muscleGroup: 'glutes', secondaryMuscles: [], equipment: 'cable', category: 'isolation', isCustom: false },
  { id: 'ex-047', name: 'Abductores en Máquina', muscleGroup: 'glutes', secondaryMuscles: [], equipment: 'machine', category: 'isolation', isCustom: false },

  // PANTORRILLAS
  { id: 'ex-048', name: 'Elevación de Talones de Pie', muscleGroup: 'calves', secondaryMuscles: [], equipment: 'machine', category: 'isolation', isCustom: false },
  { id: 'ex-049', name: 'Elevación de Talones Sentado', muscleGroup: 'calves', secondaryMuscles: [], equipment: 'machine', category: 'isolation', isCustom: false },

  // CORE
  { id: 'ex-050', name: 'Plancha', muscleGroup: 'core', secondaryMuscles: [], equipment: 'bodyweight', category: 'isolation', isCustom: false },
  { id: 'ex-051', name: 'Crunch Abdominal', muscleGroup: 'core', secondaryMuscles: [], equipment: 'bodyweight', category: 'isolation', isCustom: false },
  { id: 'ex-052', name: 'Rueda Abdominal', muscleGroup: 'core', secondaryMuscles: [], equipment: 'other', category: 'isolation', isCustom: false },
  { id: 'ex-053', name: 'Elevación de Piernas', muscleGroup: 'core', secondaryMuscles: [], equipment: 'bodyweight', category: 'isolation', isCustom: false },
  { id: 'ex-054', name: 'Oblicuo en Polea', muscleGroup: 'core', secondaryMuscles: [], equipment: 'cable', category: 'isolation', isCustom: false },
];

export async function runSeed(): Promise<void> {
  await ExerciseRepository.bulkInsert(SEED_EXERCISES);
}
