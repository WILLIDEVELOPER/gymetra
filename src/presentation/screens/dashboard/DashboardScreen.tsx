import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useUserStore, useWorkoutStore, useRoutineStore } from '../../../store';
import { GlassCard, StatCard, XPBar, Card, Button, EmptyState, Badge } from '../../../components/ui';
import { RoutineCard } from '../../../components/routine/RoutineCard';
import { colors, fontSize, spacing, radius } from '../../../theme';
import {
  formatDuration, formatVolume, getWeekStart,
  MUSCLE_GROUP_LABELS,
} from '../../../utils/formatters';
import { WorkoutRepository } from '../../../infrastructure/repositories/WorkoutRepository';
import { getMuscleColor } from '../../../utils/exerciseIcons';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.lg * 2 - 32;

// ─── Mini bar chart de últimas 8 semanas ───────────────────────────────────────
interface WeekBar { weekStart: number; count: number; volume: number }

function WeeklyChart({ data }: { data: WeekBar[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const today = Date.now();
  const barW = (CHART_WIDTH / data.length) - 6;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60 }}>
        {data.map((d, i) => {
          const isCurrentWeek = i === data.length - 1;
          const h = Math.max((d.count / maxCount) * 52, d.count > 0 ? 6 : 2);
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View
                style={{
                  width: barW,
                  height: h,
                  borderRadius: 4,
                  backgroundColor: isCurrentWeek
                    ? colors.brand[400]
                    : d.count > 0
                      ? `${colors.brand[600]}80`
                      : 'rgba(255,255,255,0.06)',
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 5 }}>
        {data.map((_, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: colors.text.muted, fontSize: 9 }}>
              {i === data.length - 1 ? 'Hoy' : `S${i + 1}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Heatmap de actividad (últimas 12 semanas) ─────────────────────────────────
function ActivityHeatmap({ dates }: { dates: number[] }) {
  const WEEKS = 12;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeDays = new Set(dates.map((ts) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }));

  const cells: boolean[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: boolean[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(today);
      day.setDate(today.getDate() - w * 7 - (6 - d));
      week.push(activeDays.has(day.getTime()));
    }
    cells.push(week);
  }

  const cellSize = Math.floor((CHART_WIDTH - (WEEKS - 1) * 3) / WEEKS);

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {cells.map((week, wi) => (
          <View key={wi} style={{ gap: 3 }}>
            {week.map((active, di) => (
              <View
                key={di}
                style={{
                  width: cellSize, height: cellSize,
                  borderRadius: 2,
                  backgroundColor: active
                    ? colors.brand[400]
                    : 'rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ color: colors.text.muted, fontSize: 9 }}>12 semanas atrás</Text>
        <Text style={{ color: colors.text.muted, fontSize: 9 }}>Hoy</Text>
      </View>
    </View>
  );
}

// ─── Barra de grupo muscular ───────────────────────────────────────────────────
function MuscleBar({ muscle, volume, maxVolume }: { muscle: string; volume: number; maxVolume: number }) {
  const pct = maxVolume > 0 ? volume / maxVolume : 0;
  const color = getMuscleColor(muscle as any);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs, width: 72 }} numberOfLines={1}>
        {MUSCLE_GROUP_LABELS[muscle] ?? muscle}
      </Text>
      <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </View>
      <Text style={{ color: colors.text.muted, fontSize: 10, width: 40, textAlign: 'right' }}>
        {formatVolume(volume)}
      </Text>
    </View>
  );
}

// ─── Tarjeta de streak ─────────────────────────────────────────────────────────
function StreakCard({ streak, longest }: { streak: number; longest: number }) {
  return (
    <GlassCard accent={streak > 0 ? colors.accent.orange : undefined} style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 28 }}>🔥</Text>
        <Text style={{ color: colors.text.primary, fontSize: 28, fontWeight: '900' }}>{streak}</Text>
        <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>días seguidos</Text>
        {longest > 0 && (
          <Text style={{ color: colors.accent.yellow, fontSize: 10, fontWeight: '700', marginTop: 4 }}>
            Récord: {longest}d
          </Text>
        )}
      </View>
    </GlassCard>
  );
}

// ─── Banner workout activo ─────────────────────────────────────────────────────
function ActiveWorkoutBanner({ onResume }: { onResume: () => void }) {
  return (
    <TouchableOpacity onPress={onResume} activeOpacity={0.85}>
      <GlassCard accent={colors.accent.green} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
        <View style={{
          width: 10, height: 10, borderRadius: 5,
          backgroundColor: colors.accent.green,
          shadowColor: colors.accent.green,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1, shadowRadius: 6, elevation: 4,
        }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.sm }}>
            Entrenamiento en curso
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: fontSize.xs }}>
            Toca para retomar
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </GlassCard>
    </TouchableOpacity>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const profile = useUserStore((s) => s.profile);
  const loadProfile = useUserStore((s) => s.loadProfile);
  const { routines, loadRoutines } = useRoutineStore();
  const { activeWorkout, loadHistory, resumeInProgress } = useWorkoutStore();

  const [weekStats, setWeekStats] = useState({ workoutCount: 0, totalVolume: 0, totalDuration: 0, xpEarned: 0 });
  const [weeklyBars, setWeeklyBars] = useState<WeekBar[]>([]);
  const [muscleVolume, setMuscleVolume] = useState<Record<string, number>>({});
  const [workoutDates, setWorkoutDates] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([loadProfile(), loadRoutines(), loadHistory(5)]);
    const [stats, bars, muscles, dates] = await Promise.all([
      WorkoutRepository.getWeeklyStats(getWeekStart()),
      WorkoutRepository.getLast8WeeksStats(),
      WorkoutRepository.getMuscleGroupVolume(Date.now() - 30 * 24 * 60 * 60 * 1000),
      WorkoutRepository.getWorkoutDates(84),
    ]);
    setWeekStats(stats);
    setWeeklyBars(bars);
    setMuscleVolume(muscles);
    setWorkoutDates(dates);
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

  const topMuscles = useMemo(() => {
    const entries = Object.entries(muscleVolume).filter(([, v]) => v > 0);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 5);
  }, [muscleVolume]);

  const maxMuscleVol = topMuscles[0]?.[1] ?? 1;

  if (!profile) return null;

  const today = new Date().getDay();
  const todayRoutines = routines.filter((r) => r.scheduledDays.includes(today as any));
  const recentRoutines = routines.slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: 18, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.brand[400]} colors={[colors.brand[400]]}
          />
        }
      >
        {/* ── Encabezado ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>{greeting}</Text>
            <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '900', marginTop: 2 }}>
              {profile.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => nav.navigate('Achievements')}
            style={{
              backgroundColor: 'rgba(245,158,11,0.12)',
              borderRadius: radius.lg, padding: 10,
            }}
          >
            <Ionicons name="trophy" size={22} color={colors.accent.yellow} />
          </TouchableOpacity>
        </View>

        {/* ── Workout activo ── */}
        {activeWorkout && (
          <ActiveWorkoutBanner onResume={() => nav.navigate('Workout', {})} />
        )}

        {/* ── XP Bar ── */}
        <XPBar level={profile.level} xp={profile.xp} xpToNext={profile.xpToNextLevel} />

        {/* ── Stats semana + Streak ── */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 3, gap: 10 }}>
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
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <StatCard
                label="Tiempo"
                value={formatDuration(weekStats.totalDuration)}
                icon={<Ionicons name="time" size={18} color={colors.accent.purple} />}
                accent={colors.accent.purple}
              />
              <StatCard
                label="XP semana"
                value={`+${weekStats.xpEarned}`}
                icon={<Ionicons name="star" size={18} color={colors.accent.yellow} />}
                accent={colors.accent.yellow}
              />
            </View>
          </View>
          <StreakCard streak={profile.currentStreak} longest={profile.longestStreak} />
        </View>

        {/* ── Gráfica semanal ── */}
        {weeklyBars.length > 0 && (
          <GlassCard>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: 14 }}>
              Entrenos — últimas 8 semanas
            </Text>
            <WeeklyChart data={weeklyBars} />
          </GlassCard>
        )}

        {/* ── Heatmap de actividad ── */}
        <GlassCard>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: 14 }}>
            Actividad — 12 semanas
          </Text>
          <ActivityHeatmap dates={workoutDates} />
        </GlassCard>

        {/* ── Músculos más entrenados (último mes) ── */}
        {topMuscles.length > 0 && (
          <GlassCard>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: 14 }}>
              Músculos más trabajados (30 días)
            </Text>
            {topMuscles.map(([muscle, volume]) => (
              <MuscleBar key={muscle} muscle={muscle} volume={volume} maxVolume={maxMuscleVol} />
            ))}
          </GlassCard>
        )}

        {/* ── Quick start ── */}
        <Button
          label="Entrenamiento libre"
          variant="secondary"
          fullWidth
          size="lg"
          icon={<Ionicons name="add-circle" size={20} color={colors.brand[400]} />}
          onPress={() => nav.navigate('Workout', {})}
        />

        {/* ── Rutinas de hoy ── */}
        {todayRoutines.length > 0 && (
          <View>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 12 }}>
              Para hoy 📅
            </Text>
            {todayRoutines.map((r) => (
              <RoutineCard
                key={r.id} routine={r}
                onPress={() => nav.navigate('RoutineForm', { routineId: r.id })}
                onStart={() => nav.navigate('Workout', { routineId: r.id, routineName: r.name })}
                onOptions={() => {}}
              />
            ))}
          </View>
        )}

        {/* ── Mis rutinas ── */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' }}>
              Mis rutinas
            </Text>
            <TouchableOpacity onPress={() => (nav as any).navigate('Routines')}>
              <Text style={{ color: colors.brand[400], fontSize: fontSize.sm }}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recentRoutines.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="list" size={48} color={colors.text.muted} />}
              title="Sin rutinas"
              subtitle="Crea tu primera rutina para empezar"
              action={<Button label="Crear rutina" onPress={() => nav.navigate('RoutineForm', {})} />}
            />
          ) : (
            recentRoutines.map((r) => (
              <RoutineCard
                key={r.id} routine={r}
                onPress={() => nav.navigate('RoutineForm', { routineId: r.id })}
                onStart={() => nav.navigate('Workout', { routineId: r.id, routineName: r.name })}
                onOptions={() => {}}
              />
            ))
          )}
        </View>

        {/* ── Estadísticas globales ── */}
        <GlassCard>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: 14 }}>
            Estadísticas totales
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard
              label="Entrenos"
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
              label="Nivel"
              value={`${profile.level}`}
              icon={<Ionicons name="ribbon" size={18} color={colors.accent.yellow} />}
              accent={colors.accent.yellow}
            />
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
