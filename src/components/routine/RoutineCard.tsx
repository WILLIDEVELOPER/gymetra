import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius } from '../../theme';
import type { Routine } from '../../domain/models';

interface RoutineCardProps {
  routine: Routine;
  onPress: () => void;
  onStart: () => void;
  onOptions: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  push: 'Push', pull: 'Pull', legs: 'Piernas',
  full_body: 'Full Body', upper: 'Superior',
  lower: 'Inferior', custom: 'Personalizada',
};

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function RoutineCard({ routine, onPress, onStart, onOptions }: RoutineCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Borde de color */}
      <View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: routine.color,
      }} />

      <View style={{ padding: 16, paddingLeft: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' }}>
              {routine.name}
            </Text>
            {routine.description && (
              <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, marginTop: 2 }} numberOfLines={1}>
                {routine.description}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onOptions} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Info row */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="barbell-outline" size={14} color={colors.text.muted} />
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
              {routine.exercises.length} ejercicios
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
              ~{routine.estimatedDuration} min
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="trophy-outline" size={14} color={colors.text.muted} />
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
              {routine.timesCompleted}x
            </Text>
          </View>
        </View>

        {/* Días programados */}
        {routine.scheduledDays.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <View
                key={day}
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: routine.scheduledDays.includes(day as any)
                    ? routine.color
                    : colors.bg.input,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontSize: 9, fontWeight: '700',
                  color: routine.scheduledDays.includes(day as any)
                    ? '#fff' : colors.text.muted,
                }}>
                  {DAY_LABELS[day]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Botón iniciar */}
        <TouchableOpacity
          onPress={onStart}
          activeOpacity={0.8}
          style={{
            marginTop: 14, height: 40, borderRadius: radius.md,
            backgroundColor: routine.color,
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 6,
          }}
        >
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>
            Iniciar entrenamiento
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
