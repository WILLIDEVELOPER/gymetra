import { format, formatDistanceToNow, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

export function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toFixed(0)}kg`;
}

export function formatDate(timestamp: number, fmt = 'dd MMM yyyy'): string {
  return format(new Date(timestamp), fmt, { locale: es });
}

export function formatRelative(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
}

export function getWeekStart(date = new Date()): number {
  return startOfWeek(date, { weekStartsOn: 1 }).getTime();
}

export function formatWeight(kg: number): string {
  return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`;
}

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest:      'Pecho',
  back:       'Espalda',
  shoulders:  'Hombros',
  biceps:     'Bíceps',
  triceps:    'Tríceps',
  forearms:   'Antebrazos',
  core:       'Core',
  quads:      'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  glutes:     'Glúteos',
  calves:     'Pantorrillas',
  full_body:  'Cuerpo completo',
  cardio:     'Cardio',
  other:      'Otro',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell:    'Barra',
  dumbbell:   'Mancuernas',
  cable:      'Polea',
  machine:    'Máquina',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  bands:      'Bandas',
  other:      'Otro',
};

export const CATEGORY_COLORS: Record<string, string> = {
  push:      '#3B82F6',
  pull:      '#8B5CF6',
  legs:      '#10B981',
  full_body: '#F59E0B',
  upper:     '#06B6D4',
  lower:     '#EC4899',
  custom:    '#6B7280',
};
