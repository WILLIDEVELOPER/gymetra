import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { WorkoutRepository } from '../../../infrastructure/repositories/WorkoutRepository';
import { StatCard, Card } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { formatDuration, formatVolume, formatDate } from '../../../utils/formatters';
import type { Workout } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    WorkoutRepository.getById(route.params.workoutId).then(setWorkout);
  }, []);

  if (!workout) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: 20, paddingBottom: 40 }}>
        {/* Título */}
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: 'rgba(59,130,246,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 36 }}>🏆</Text>
          </View>
          <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '800' }}>
            ¡Entrenamiento completado!
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm }}>
            {workout.name}
          </Text>
          <View style={{
            flexDirection: 'row', gap: 6,
            backgroundColor: 'rgba(245,158,11,0.15)',
            paddingHorizontal: 14, paddingVertical: 6,
            borderRadius: radius.full,
          }}>
            <Ionicons name="star" size={14} color={colors.accent.yellow} />
            <Text style={{ color: colors.accent.yellow, fontWeight: '700', fontSize: fontSize.sm }}>
              +{workout.xpEarned} XP
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard
            label="Duración"
            value={formatDuration(workout.durationSeconds)}
            icon={<Ionicons name="time" size={18} color={colors.brand[400]} />}
          />
          <StatCard
            label="Volumen"
            value={formatVolume(workout.totalVolume)}
            icon={<Ionicons name="trending-up" size={18} color={colors.accent.green} />}
            accent={colors.accent.green}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard
            label="Series"
            value={String(workout.totalSets)}
            icon={<Ionicons name="layers" size={18} color={colors.accent.purple} />}
            accent={colors.accent.purple}
          />
          <StatCard
            label="Repeticiones"
            value={String(workout.totalReps)}
            icon={<Ionicons name="repeat" size={18} color={colors.accent.cyan} />}
            accent={colors.accent.cyan}
          />
        </View>

        {/* Ejercicios */}
        <View>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
            Ejercicios realizados
          </Text>
          {workout.exercises.map((we) => {
            const completedSets = we.sets.filter((s) => s.completed && !s.isWarmup);
            const vol = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
            return (
              <Card key={we.id} style={{ marginBottom: 8 }}>
                <Text style={{ color: colors.text.primary, fontWeight: '600', marginBottom: 6 }}>
                  {we.exercise?.name ?? we.exerciseId}
                </Text>
                {completedSets.map((s, i) => (
                  <View key={s.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 3 }}>
                    <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, width: 50 }}>
                      Serie {i + 1}
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
                      {s.weight} kg × {s.reps} reps
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, marginLeft: 'auto' }}>
                      RIR {s.rir}
                    </Text>
                  </View>
                ))}
                <Text style={{ color: colors.brand[400], fontSize: fontSize.xs, fontWeight: '600', marginTop: 6 }}>
                  Vol: {formatVolume(vol)}
                </Text>
              </Card>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => (nav as any).navigate('Tabs')}
          style={{
            height: 50, borderRadius: radius.md,
            backgroundColor: colors.brand[600],
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: fontSize.base, fontWeight: '700' }}>
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
