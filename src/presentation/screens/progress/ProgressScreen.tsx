import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { PRRepository } from '../../../infrastructure/repositories/PRRepository';
import { WorkoutRepository } from '../../../infrastructure/repositories/WorkoutRepository';
import { Card, Badge, EmptyState } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import {
  formatVolume, formatDate, formatWeight, MUSCLE_GROUP_LABELS, getWeekStart,
} from '../../../utils/formatters';
import type { PersonalRecord } from '../../../domain/models';

const SCREEN_W = Dimensions.get('window').width;

// Mini gráfico de barras sin dependencias externas
function MiniBarChart({ data, color = colors.brand[500] }: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{
            width: '100%',
            height: Math.max(4, (d.value / max) * 64),
            backgroundColor: color,
            borderRadius: 4,
            opacity: 0.8 + (i / data.length) * 0.2,
          }} />
          <Text style={{ color: colors.text.muted, fontSize: 9 }} numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ProgressScreen() {
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allPrs] = await Promise.all([PRRepository.getAll()]);
    setPrs(allPrs);

    // Últimas 8 semanas
    const weeks: { label: string; value: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = getWeekStart(new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000));
      const stats = await WorkoutRepository.getWeeklyStats(weekStart);
      const d = new Date(weekStart);
      weeks.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        value: stats.workoutCount,
      });
    }
    setWeeklyData(weeks);
    setLoading(false);
  };

  const weightPRs = prs.filter((p) => p.type === 'weight');
  const grouped = weightPRs.reduce<Record<string, PersonalRecord>>((acc, pr) => {
    if (!acc[pr.exerciseId] || pr.value > acc[pr.exerciseId].value) {
      acc[pr.exerciseId] = pr;
    }
    return acc;
  }, {});
  const topPRs = Object.values(grouped).sort((a, b) => b.achievedAt - a.achievedAt);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '800' }}>
          Progreso
        </Text>

        {/* Frecuencia semanal */}
        <Card>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 16 }}>
            Frecuencia semanal
          </Text>
          <MiniBarChart data={weeklyData} />
          <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, textAlign: 'center', marginTop: 8 }}>
            Últimas 8 semanas · entrenamientos por semana
          </Text>
        </Card>

        {/* Personal Records */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' }}>
              Records personales
            </Text>
            <Badge label={`${topPRs.length} PRs`} color="yellow" />
          </View>

          {topPRs.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="trophy" size={48} color={colors.text.muted} />}
              title="Sin PRs todavía"
              subtitle="Completa entrenamientos para registrar tus records"
            />
          ) : (
            topPRs.map((pr) => (
              <Card key={pr.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: 'rgba(245,158,11,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 18 }}>🏆</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '600' }}>
                      {pr.exerciseName}
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, marginTop: 2 }}>
                      {formatDate(pr.achievedAt)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.accent.yellow, fontSize: fontSize.lg, fontWeight: '800' }}>
                      {formatWeight(pr.value)}
                    </Text>
                    {pr.reps && (
                      <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                        × {pr.reps} reps
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
