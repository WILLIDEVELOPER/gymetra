import React from 'react';
import { View, Text } from 'react-native';
import { colors, radius } from '../../theme';

type BadgeColor = 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  size?: 'sm' | 'md';
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  blue:   { bg: 'rgba(59,130,246,0.15)', text: colors.brand[400] },
  green:  { bg: 'rgba(16,185,129,0.15)', text: colors.accent.green },
  red:    { bg: 'rgba(239,68,68,0.15)',  text: colors.accent.red },
  purple: { bg: 'rgba(139,92,246,0.15)', text: colors.accent.purple },
  yellow: { bg: 'rgba(245,158,11,0.15)', text: colors.accent.yellow },
  gray:   { bg: colors.bg.input,         text: colors.text.secondary },
};

export function Badge({ label, color = 'blue', size = 'md' }: BadgeProps) {
  const { bg, text } = colorMap[color];
  return (
    <View style={{
      backgroundColor: bg,
      borderRadius: radius.full,
      paddingHorizontal: size === 'sm' ? 8 : 10,
      paddingVertical: size === 'sm' ? 2 : 4,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: text, fontSize: size === 'sm' ? 11 : 12, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
