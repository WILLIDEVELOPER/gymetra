export const colors = {
  // Fondos
  bg: {
    primary:   '#0A0F1E',
    secondary: '#111827',
    card:      '#1A2035',
    cardAlt:   '#1E2A3A',
    input:     '#151C2E',
    overlay:   'rgba(0,0,0,0.7)',
  },
  // Azules principales
  brand: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Texto
  text: {
    primary:   '#F1F5F9',
    secondary: '#94A3B8',
    muted:     '#475569',
    inverse:   '#0A0F1E',
  },
  // Acentos
  accent: {
    blue:   '#3B82F6',
    cyan:   '#06B6D4',
    purple: '#8B5CF6',
    green:  '#10B981',
    yellow: '#F59E0B',
    red:    '#EF4444',
    orange: '#F97316',
  },
  // Bordes
  border: {
    default: '#1E2A3A',
    active:  '#3B82F6',
    subtle:  '#151C2E',
  },
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 9999,
} as const;

export const fontSize = {
  xs:   12,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// Gradientes para uso con LinearGradient
export const gradients = {
  primary: ['#1D4ED8', '#3B82F6'],
  card:    ['#1A2035', '#1E2A3A'],
  dark:    ['#0A0F1E', '#111827'],
  success: ['#065F46', '#10B981'],
  danger:  ['#7F1D1D', '#EF4444'],
  purple:  ['#4C1D95', '#8B5CF6'],
  xp:      ['#1D4ED8', '#06B6D4'],
} as const;

// Colores por nivel RPG
export const levelColors = [
  '#64748B', // Nivel 1-5:   Gris (Novato)
  '#3B82F6', // Nivel 6-10:  Azul (Atleta)
  '#8B5CF6', // Nivel 11-20: Morado (Guerrero)
  '#F59E0B', // Nivel 21-30: Dorado (Élite)
  '#EF4444', // Nivel 31-50: Rojo (Leyenda)
  '#EC4899', // Nivel 51+:   Rosa (Mítico)
] as const;

export const theme = { colors, spacing, radius, fontSize, shadows, gradients, levelColors };
export default theme;
