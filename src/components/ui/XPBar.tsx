import React from 'react';
import { View, Text } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { colors, fontSize, radius } from '../../theme';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNext: number;
  compact?: boolean;
}

const LEVEL_COLORS = [
  '#64748B', // 1-5  Novato
  '#3B82F6', // 6-10 Atleta
  '#8B5CF6', // 11-20 Guerrero
  '#F59E0B', // 21-30 Élite
  '#EF4444', // 31-50 Leyenda
  '#EC4899', // 51+  Mítico
];

function getLevelColor(level: number): string {
  if (level <= 5)  return LEVEL_COLORS[0];
  if (level <= 10) return LEVEL_COLORS[1];
  if (level <= 20) return LEVEL_COLORS[2];
  if (level <= 30) return LEVEL_COLORS[3];
  if (level <= 50) return LEVEL_COLORS[4];
  return LEVEL_COLORS[5];
}

function getLevelTitle(level: number): string {
  if (level <= 5)  return 'Novato';
  if (level <= 10) return 'Atleta';
  if (level <= 20) return 'Guerrero';
  if (level <= 30) return 'Élite';
  if (level <= 50) return 'Leyenda';
  return 'Mítico';
}

export function XPBar({ level, xp, xpToNext, compact = false }: XPBarProps) {
  const color = getLevelColor(level);
  const progress = Math.min(100, (xp / xpToNext) * 100);
  const title = getLevelTitle(level);

  if (compact) {
    return (
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color, fontSize: fontSize.xs, fontWeight: '700' }}>
            Nv. {level} · {title}
          </Text>
          <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
            {xp} / {xpToNext} XP
          </Text>
        </View>
        <ProgressBar value={progress} color={color} height={4} />
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.bg.card,
      borderRadius: radius.lg,
      padding: 16,
      gap: 10,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: `${color}20`,
          borderWidth: 2, borderColor: color,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color, fontSize: fontSize.lg, fontWeight: '800' }}>
            {level}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color, fontSize: fontSize.md, fontWeight: '700' }}>
            {title}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
            {xp} / {xpToNext} XP para nivel {level + 1}
          </Text>
        </View>
      </View>
      <ProgressBar value={progress} color={color} height={8} />
    </View>
  );
}
