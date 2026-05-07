import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { ExerciseRepository } from '../../../infrastructure/repositories/ExerciseRepository';
import { WorkoutRepository } from '../../../infrastructure/repositories/WorkoutRepository';
import { PRRepository } from '../../../infrastructure/repositories/PRRepository';
import { Card, Badge } from '../../../components/ui';
import { colors, fontSize, spacing } from '../../../theme';
import {
  MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, formatDate, formatWeight,
} from '../../../utils/formatters';
import type { Exercise, PersonalRecord } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'ExerciseDetail'>;

export function ExerciseDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<{ workoutId: string; date: number; maxWeight: number; totalVol: number }[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    const { exerciseId } = route.params;
    Promise.all([
      ExerciseRepository.getById(exerciseId),
      WorkoutRepository.getExerciseSetsHistory(exerciseId, 20),
      PRRepository.getByExercise(exerciseId),
    ]).then(([ex, hist, prList]) => {
      setExercise(ex);
      setHistory(hist.map((h) => ({
        workoutId: h.workoutId,
        date: h.date,
        maxWeight: Math.max(...h.sets.map((s) => s.weight), 0),
        totalVol: h.sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
      })));
      setPrs(prList);
    });
  }, []);

  if (!exercise) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: colors.border.default,
      }}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '700', flex: 1 }}>
          {exercise.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: 20, paddingBottom: 40 }}>
        {/* Info */}
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Badge label={MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup} />
            <Badge label={EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment} color="gray" />
            <Badge label={exercise.category === 'compound' ? 'Compuesto' : 'Aislamiento'} color="purple" />
          </View>
          {exercise.instructions && (
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, lineHeight: 20, marginTop: 12 }}>
              {exercise.instructions}
            </Text>
          )}
        </Card>

        {/* PRs */}
        {prs.length > 0 && (
          <View>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
              Records personales
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {prs.filter((p) => p.type === 'weight' || p.type === '1rm').map((pr) => (
                <Card key={pr.id} style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.muted, fontSize: 10, fontWeight: '600' }}>
                    {pr.type === '1rm' ? '1RM estimado' : 'Peso máx.'}
                  </Text>
                  <Text style={{ color: colors.accent.yellow, fontSize: fontSize.xl, fontWeight: '800', marginTop: 4 }}>
                    {formatWeight(pr.value)}
                  </Text>
                  <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                    {formatDate(pr.achievedAt, 'dd MMM yy')}
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Historial de sesiones */}
        <View>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
            Historial ({history.length} sesiones)
          </Text>
          {history.length === 0 ? (
            <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>
              Aún no has hecho este ejercicio
            </Text>
          ) : (
            history.map((h, i) => (
              <Card key={i} style={{ marginBottom: 8, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
                    {formatDate(h.date, 'dd MMM yyyy')}
                  </Text>
                </View>
                <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '700' }}>
                  {formatWeight(h.maxWeight)}
                </Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
