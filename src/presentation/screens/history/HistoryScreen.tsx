import React, { useEffect } from 'react';
import { View, Text, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useWorkoutStore } from '../../../store';
import { Card, EmptyState, Badge } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { formatDate, formatDuration, formatVolume, formatRelative } from '../../../utils/formatters';
import type { WorkoutSummary } from '../../../domain/models';

function WorkoutItem({ item }: { item: WorkoutSummary }) {
  return (
    <Card style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '700' }}>
            {item.name}
          </Text>
          {item.routineName && (
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs, marginTop: 2 }}>
              {item.routineName}
            </Text>
          )}
          <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, marginTop: 4 }}>
            {formatRelative(item.startedAt)}
          </Text>
        </View>
        <Badge label={`+${item.xpEarned} XP`} color="yellow" size="sm" />
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={13} color={colors.text.muted} />
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
            {formatDuration(item.durationSeconds)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="trending-up-outline" size={13} color={colors.text.muted} />
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
            {formatVolume(item.totalVolume)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="layers-outline" size={13} color={colors.text.muted} />
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
            {item.totalSets} series
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="barbell-outline" size={13} color={colors.text.muted} />
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs }}>
            {item.exerciseCount} ejerc.
          </Text>
        </View>
      </View>
    </Card>
  );
}

export function HistoryScreen() {
  const { history, isLoading, loadHistory } = useWorkoutStore();

  useEffect(() => { loadHistory(50); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 14 }}>
        <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '800' }}>
          Historial
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, marginTop: 2 }}>
          {history.length} entrenamientos registrados
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => loadHistory(50)}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="time" size={56} color={colors.text.muted} />}
            title="Sin historial"
            subtitle="Completa tu primer entrenamiento para ver el historial"
          />
        }
        renderItem={({ item }) => <WorkoutItem item={item} />}
      />
    </SafeAreaView>
  );
}
