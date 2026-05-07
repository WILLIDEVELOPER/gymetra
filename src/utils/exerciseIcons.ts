import type { MuscleGroup } from '../domain/models';

// Mapa de grupo muscular → nombre de icono Ionicons
export const MUSCLE_ICONS: Record<MuscleGroup, string> = {
  chest:      'body-outline',
  back:       'body-outline',
  shoulders:  'accessibility-outline',
  biceps:     'barbell-outline',
  triceps:    'barbell-outline',
  forearms:   'barbell-outline',
  core:       'ellipse-outline',
  quads:      'walk-outline',
  hamstrings: 'walk-outline',
  glutes:     'walk-outline',
  calves:     'walk-outline',
  full_body:  'fitness-outline',
  cardio:     'heart-outline',
  other:      'barbell-outline',
};

// Color de acento por grupo muscular
export const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest:      '#3B82F6',  // azul
  back:       '#8B5CF6',  // púrpura
  shoulders:  '#06B6D4',  // cyan
  biceps:     '#F59E0B',  // amarillo
  triceps:    '#F97316',  // naranja
  forearms:   '#F97316',
  core:       '#10B981',  // verde
  quads:      '#EF4444',  // rojo
  hamstrings: '#EC4899',  // rosa
  glutes:     '#EC4899',
  calves:     '#EF4444',
  full_body:  '#3B82F6',
  cardio:     '#EF4444',
  other:      '#6B7280',  // gris
};

export function getMuscleIcon(muscle: MuscleGroup | string): string {
  return MUSCLE_ICONS[muscle as MuscleGroup] ?? 'barbell-outline';
}

export function getMuscleColor(muscle: MuscleGroup | string): string {
  return MUSCLE_COLORS[muscle as MuscleGroup] ?? '#6B7280';
}

// Icono específico por categoría de equipo
export const EQUIPMENT_ICONS: Record<string, string> = {
  barbell:    'barbell-outline',
  dumbbell:   'barbell-outline',
  cable:      'git-branch-outline',
  machine:    'hardware-chip-outline',
  bodyweight: 'body-outline',
  kettlebell: 'bowling-ball-outline',
  bands:      'ellipse-outline',
  other:      'barbell-outline',
};
