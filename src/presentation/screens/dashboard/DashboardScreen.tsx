import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  RefreshControl, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useUserStore, useWorkoutStore, useRoutineStore } from '../../../store';
import { StatCard, XPBar, Card, Button, EmptyState, Badge } from '../../../components/ui';
import { RoutineCard } from '../../../components/routine/RoutineCard';
import { colors, fontSize, spacing } from '../../../theme';
import { formatDuration, formatVolume, formatDate, getWeekStart, CATEGORY_COLORS } from '../../../utils/formatters';
import { WorkoutRepository } from '../../../infrastructure/repositories/WorkoutRepository';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

function GreetingHeader({ name, streak }: { name: string; streak: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm }}>
          {greeting}
        </Text>
        <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '800', marginTop: 2 }}>
          {name} 👋
        </Text>
      </View>
      {streak > 0 && (
        <View style={{
          backgroundColor: 'rgba(245,158,11,0.15)',
          borderRadius: 12, padding: 10,
          alignItems: 'center', gap: 2,
        }}>
          <Text style={{ fontSize: 20 }}>🔥</Text>
          <Text style={{ color: colors.accent.yellow, fontSize: fontSize.xs, fontWeight: '700' }}>
            {streak}d
          </Text>
        </View>
      )}
    </View>
  );
}

function ActiveWorkoutBanner({ onResume }: { onResume: () => void }) {
  return (
    <TouchableOpacity
      onPress={onResume}
      activeOpacity={0.85}
      style={{
        backgroundColor: colors.brand[700],
        borderRadius: 14, padding: 14,
        flexDirection: 'row', alignItems: 'center',
        gap: 12, marginBottom: 4,
      }}
    >
      <View style={{
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#4ADE80',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 4,
      }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.sm }}>
          Entrenamiento en curso
        </Text>
        <Text style={{ color: colors.brand[200], fontSize: fontSize.xs }}>
          Toca para retomar
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#fff" />
    </TouchableOpacity>
  );
}

export function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const profile = useUserStore((s) => s.profile);
  const loadProfile = useUserStore((s) => s.loadProfile);
  const { routines, loadRoutines } = useRoutineStore();
  const { activeWorkout, loadHistory, resumeInProgress } = useWorkoutStore();

  const [weekStats, setWeekStats] = useState({
    workoutCount: 0, totalVolume: 0, totalDuration: 0, xpEarned: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([loadProfile(), loadRoutines(), loadHistory(5)]);
    const stats = await WorkoutRepository.getWeeklyStats(getWeekStart());
    setWeekStats(stats);
  }, []);

  useEffect(() => {
    loadData();
    resumeInProgress();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartRoutine = (routine: typeof routines[0]) => {
    nav.navigate('Workout', { routineId: routine.id, routineName: routine.name });
  };

  const handleQuickStart = () => {
    nav.navigate('Workout', {});
  };

  if (!profile) return null;

  const today = new Date().getDay();
  const todayRoutines = routines.filter((r) => r.scheduledDays.includes(today as any));
  const recentRoutines = routines.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
          />
        }
      >
        {/* Header */}
        <GreetingHeader name={profile.name} streak={profile.currentStreak} />

        {/* Workout activo */}
        {activeWorkout && (
          <ActiveWorkoutBanner onResume={() => nav.navigate('Workout', {})} />
        )}

        {/* XP / Nivel */}
        <XPBar
          level={profile.level}
          xp={profile.xp}
          xpToNext={profile.xpToNextLevel}
        />

        {/* Stats de la semana */}
        <View>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
            Esta semana
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard
              label="Entrenos"
              value={String(weekStats.workoutCount)}
              icon={<Ionicons name="barbell" size={18} color={colors.brand[400]} />}
            />
            <StatCard
              label="Volumen"
              value={formatVolume(weekStats.totalVolume)}
              icon={<Ionicons name="trending-up" size={18} color={colors.accent.green} />}
              accent={colors.accent.green}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <StatCard
              label="Tiempo"
              value={formatDuration(weekStats.totalDuration)}
              icon={<Ionicons name="time" size={18} color={colors.accent.purple} />}
              accent={colors.accent.purple}
            />
            <StatCard
              label="XP ganado"
              value={`${weekStats.xpEarned} XP`}
              icon={<Ionicons name="star" size={18} color={colors.accent.yellow} />}
              accent={colors.accent.yellow}
            />
          </View>
        </View>

        {/* Quick start */}
        <Button
          label="Entrenamiento libre"
          variant="secondary"
          fullWidth
          size="lg"
          icon={<Ionicons name="add-circle" size={20} color={colors.brand[400]} />}
          onPress={handleQuickStart}
        />

        {/* Rutinas de hoy */}
        {todayRoutines.length > 0 && (
          <View>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
              Para hoy 📅
            </Text>
            {todayRoutines.map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                onPress={() => nav.navigate('RoutineForm', { routineId: r.id })}
                onStart={() => handleStartRoutine(r)}
                onOptions={() => {}}
              />
            ))}
          </View>
        )}

        {/* Mis rutinas */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' }}>
              Mis rutinas
            </Text>
            <TouchableOpacity onPress={() => nav.navigate('Tabs' as any)}>
              <Text style={{ color: colors.brand[400], fontSize: fontSize.sm }}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recentRoutines.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="list" size={48} color={colors.text.muted} />}
              title="Sin rutinas"
              subtitle="Crea tu primera rutina para empezar"
              action={
                <Button
                  label="Crear rutina"
                  onPress={() => nav.navigate('RoutineForm', {})}
                />
              }
            />
          ) : (
            recentRoutines.map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                onPress={() => nav.navigate('RoutineForm', { routineId: r.id })}
                onStart={() => handleStartRoutine(r)}
                onOptions={() => {}}
              />
            ))
          )}
        </View>

        {/* Stats personales */}
        <View>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
            Estadísticas totales
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard
              label="Total entrenos"
              value={String(profile.totalWorkouts)}
              icon={<Ionicons name="fitness" size={18} color={colors.brand[400]} />}
            />
            <StatCard
              label="Volumen total"
              value={formatVolume(profile.totalVolume)}
              icon={<Ionicons name="barbell" size={18} color={colors.accent.cyan} />}
              accent={colors.accent.cyan}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <StatCard
              label="Tiempo total"
              value={formatDuration(profile.totalDuration)}
              icon={<Ionicons name="timer" size={18} color={colors.accent.orange} />}
              accent={colors.accent.orange}
            />
            <StatCard
              label="Racha máx."
              value={`${profile.longestStreak}d`}
              icon={<Ionicons name="flame" size={18} color={colors.accent.red} />}
              accent={colors.accent.red}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
