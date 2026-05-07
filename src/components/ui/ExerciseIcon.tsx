import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMuscleIcon, getMuscleColor } from '../../utils/exerciseIcons';
import type { MuscleGroup } from '../../domain/models';

interface ExerciseIconProps {
  muscle: MuscleGroup | string;
  size?: number;
  showBackground?: boolean;
  iconName?: string; // override manual si se quiere
}

export function ExerciseIcon({
  muscle,
  size = 24,
  showBackground = true,
  iconName,
}: ExerciseIconProps) {
  const icon  = iconName ?? getMuscleIcon(muscle);
  const color = getMuscleColor(muscle);
  const bg    = size + 16;

  if (!showBackground) {
    return <Ionicons name={icon as any} size={size} color={color} />;
  }

  return (
    <View
      style={{
        width: bg, height: bg,
        borderRadius: bg / 2,
        backgroundColor: `${color}18`,
        borderWidth: 1,
        borderColor: `${color}30`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon as any} size={size} color={color} />
    </View>
  );
}
