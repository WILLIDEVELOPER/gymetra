import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, StatusBar, TextInput, Animated,
  Keyboard, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useWorkoutStore, useExerciseStore, useRoutineStore } from '../../../store';
import { Button, Card, Badge, GlassCard, ExerciseIcon } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { formatDuration, MUSCLE_GROUP_LABELS } from '../../../utils/formatters';
import type { ExerciseSet, WorkoutExercise, ExerciseType } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Nav   = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Workout'>;

function useTimer(startedAt: number) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  return elapsed;
}

// ─── SetRow mejorado con edición inline y navegación entre campos ──────────────
interface SetRowProps {
  set: ExerciseSet;
  setNum: number;
  exerciseType: ExerciseType;
  onToggle: () => void;
  onEdit: (field: keyof ExerciseSet, value: string) => void;
  nextRef?: React.RefObject<TextInput>;
}

const SetRow = React.memo(function SetRow({
  set, setNum, exerciseType, onToggle, onEdit, nextRef,
}: SetRowProps) {
  const weightRef  = useRef<TextInput>(null);
  const repsRef    = useRef<TextInput>(null);
  const rirRef     = useRef<TextInput>(null);
  const durationRef = useRef<TextInput>(null);

  const completedScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(completedScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(completedScale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  const inputStyle = {
    color: colors.text.primary,
    fontSize: fontSize.base,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    paddingVertical: 0,
    flex: 1,
  } as const;

  const fieldContainer = (flex?: number, width?: number) => ({
    flex,
    width,
    backgroundColor: colors.bg.input,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  });

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 5,
      opacity: set.isWarmup ? 0.55 : 1,
    }}>
      {/* Número de serie */}
      <Text style={{
        color: set.isWarmup ? colors.accent.yellow : colors.text.muted,
        fontSize: fontSize.xs,
        fontWeight: '800',
        width: 22,
        textAlign: 'center',
      }}>
        {set.isWarmup ? 'C' : setNum}
      </Text>

      {/* Peso (solo para type weight) */}
      {exerciseType === 'weight' && (
        <>
          <View style={fieldContainer(1)}>
            <TextInput
              ref={weightRef}
              value={set.weight > 0 ? String(set.weight) : ''}
              onChangeText={(v) => onEdit('weight', v)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.text.muted}
              style={inputStyle}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => repsRef.current?.focus()}
              selectTextOnFocus
            />
          </View>
          <Text style={{ color: colors.text.muted, fontSize: 10, width: 14, textAlign: 'center' }}>kg</Text>
        </>
      )}

      {/* Duración (para type duration) */}
      {exerciseType === 'duration' && (
        <>
          <View style={fieldContainer(1)}>
            <TextInput
              ref={durationRef}
              value={set.durationSeconds != null && set.durationSeconds > 0 ? String(set.durationSeconds) : ''}
              onChangeText={(v) => onEdit('durationSeconds', v)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.text.muted}
              style={inputStyle}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => rirRef.current?.focus()}
              selectTextOnFocus
            />
          </View>
          <Text style={{ color: colors.text.muted, fontSize: 10, width: 14, textAlign: 'center' }}>s</Text>
        </>
      )}

      {/* Reps (weight y bodyweight) */}
      {exerciseType !== 'duration' && (
        <View style={fieldContainer(1)}>
          <TextInput
            ref={repsRef}
            value={set.reps > 0 ? String(set.reps) : ''}
            onChangeText={(v) => onEdit('reps', v)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.text.muted}
            style={inputStyle}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => rirRef.current?.focus()}
            selectTextOnFocus
          />
        </View>
      )}

      {/* RIR */}
      <View style={fieldContainer(undefined, 40)}>
        <TextInput
          ref={rirRef}
          value={set.rir > 0 ? String(set.rir) : '0'}
          onChangeText={(v) => onEdit('rir', v)}
          keyboardType="number-pad"
          style={{ ...inputStyle, color: colors.accent.cyan, fontSize: fontSize.sm }}
          returnKeyType={nextRef ? 'next' : 'done'}
          blurOnSubmit={!nextRef}
          onSubmitEditing={() => {
            if (nextRef?.current) nextRef.current.focus();
            else Keyboard.dismiss();
          }}
          selectTextOnFocus
        />
      </View>

      {/* Completar */}
      <Animated.View style={{ transform: [{ scale: completedScale }] }}>
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: set.completed ? colors.accent.green : colors.bg.input,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: set.completed ? 0 : 1,
            borderColor: 'rgba(255,255,255,0.1)',
            shadowColor: set.completed ? colors.accent.green : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: set.completed ? 4 : 0,
          }}
        >
          <Ionicons
            name={set.completed ? 'checkmark' : 'checkmark-outline'}
            size={18}
            color={set.completed ? '#fff' : colors.text.muted}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

// ─── ExerciseBlock ──────────────────────────────────────────────────────────────
interface ExerciseBlockProps {
  we: WorkoutExercise;
  exerciseName: string;
  muscleGroup: string;
  exerciseType: ExerciseType;
  onAddSet: (warmup?: boolean) => void;
  onToggleSet: (setId: string, completed: boolean) => void;
  onEditSet: (setId: string, field: keyof ExerciseSet, value: string) => void;
  onRemove?: () => void;
}

function ExerciseBlock({
  we, exerciseName, muscleGroup, exerciseType,
  onAddSet, onToggleSet, onEditSet, onRemove,
}: ExerciseBlockProps) {
  const workingSets = we.sets.filter((s) => !s.isWarmup);
  const completed   = workingSets.filter((s) => s.completed).length;
  const isFullDone  = workingSets.length > 0 && completed === workingSets.length;

  return (
    <GlassCard style={{ marginBottom: 14 }} accent={isFullDone ? colors.accent.green : undefined}>
      {/* Cabecera del ejercicio */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
        <ExerciseIcon muscle={muscleGroup} size={20} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '800' }}>
            {exerciseName}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <Badge label={MUSCLE_GROUP_LABELS[muscleGroup] ?? muscleGroup} size="sm" />
            {workingSets.length > 0 && (
              <Badge
                label={`${completed}/${workingSets.length} series`}
                size="sm"
                color={isFullDone ? 'green' : 'gray'}
              />
            )}
            {exerciseType !== 'weight' && (
              <Badge
                label={exerciseType === 'duration' ? 'Duración' : 'Peso corporal'}
                size="sm"
                color="yellow"
              />
            )}
          </View>
        </View>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Header de columnas */}
      <View style={{ flexDirection: 'row', gap: 7, marginBottom: 6, paddingHorizontal: 0 }}>
        <Text style={{ color: colors.text.muted, fontSize: 10, width: 22, textAlign: 'center', fontWeight: '700' }}>#</Text>
        {exerciseType === 'weight' && (
          <>
            <Text style={{ flex: 1, color: colors.text.muted, fontSize: 10, textAlign: 'center', fontWeight: '700' }}>Peso</Text>
            <Text style={{ width: 14 }} />
          </>
        )}
        {exerciseType === 'duration' && (
          <>
            <Text style={{ flex: 1, color: colors.text.muted, fontSize: 10, textAlign: 'center', fontWeight: '700' }}>Seg</Text>
            <Text style={{ width: 14 }} />
          </>
        )}
        {exerciseType !== 'duration' && (
          <Text style={{ flex: 1, color: colors.text.muted, fontSize: 10, textAlign: 'center', fontWeight: '700' }}>Reps</Text>
        )}
        <Text style={{ color: colors.accent.cyan, fontSize: 10, width: 40, textAlign: 'center', fontWeight: '700' }}>RIR</Text>
        <Text style={{ width: 38 }} />
      </View>

      {we.sets.map((set, idx) => {
        const workingIdx = we.sets.filter((s, i) => !s.isWarmup && i <= idx).length;
        return (
          <SetRow
            key={set.id}
            set={set}
            setNum={workingIdx}
            exerciseType={exerciseType}
            onToggle={() => onToggleSet(set.id, !set.completed)}
            onEdit={(field, value) => onEditSet(set.id, field, value)}
          />
        );
      })}

      {/* Botones añadir serie */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => onAddSet(false)}
          style={{
            flex: 1, height: 36, borderRadius: radius.md,
            borderWidth: 1.5, borderColor: colors.brand[600],
            borderStyle: 'dashed',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 6,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={14} color={colors.brand[400]} />
          <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '700' }}>
            Serie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onAddSet(true)}
          style={{
            height: 36, paddingHorizontal: 14,
            borderRadius: radius.md, borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.08)',
            borderStyle: 'dashed',
            alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>Calent.</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

// ─── Pantalla principal ─────────────────────────────────────────────────────────
export function WorkoutScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { routines } = useRoutineStore();
  const { exercises, loadExercises } = useExerciseStore();
  const {
    activeWorkout, startWorkout, addExerciseToWorkout,
    addSet, updateSet, completeWorkout,
  } = useWorkoutStore();

  const [finishing, setFinishing] = useState(false);
  const elapsed = useTimer(activeWorkout?.startedAt ?? Date.now());

  useEffect(() => {
    loadExercises();
    if (!activeWorkout) {
      initWorkout();
    }
  }, []);

  const initWorkout = async () => {
    const routine = route.params?.routineId
      ? routines.find((r) => r.id === route.params.routineId)
      : undefined;
    const dayStr = new Date().toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
    const name = routine?.name ?? `Entreno ${dayStr}`;
    await startWorkout(name, routine);
  };

  const handleAddSet = useCallback(async (workoutExerciseId: string, warmup = false) => {
    const we = activeWorkout?.exercises.find((e) => e.id === workoutExerciseId);
    if (!we) return;
    const lastSet = [...we.sets].reverse().find((s) => s.isWarmup === warmup);
    const setNum  = we.sets.filter((s) => s.isWarmup === warmup).length + 1;

    const ex = exercises.find((e) => e.id === we.exerciseId);
    const isDuration = ex?.exerciseType === 'duration';

    await addSet(workoutExerciseId, {
      workoutExerciseId,
      setNumber: setNum,
      weight: isDuration ? 0 : (lastSet?.weight ?? 0),
      reps: isDuration ? 0 : (lastSet?.reps ?? 10),
      rir: lastSet?.rir ?? 2,
      restSeconds: lastSet?.restSeconds ?? 90,
      isWarmup: warmup,
      isDropset: false,
      completed: false,
      durationSeconds: isDuration ? (lastSet?.durationSeconds ?? 60) : undefined,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [activeWorkout, exercises, addSet]);

  const handleToggleSet = useCallback(async (setId: string, completed: boolean) => {
    await updateSet(setId, { completed });
  }, [updateSet]);

  const handleEditSet = useCallback(async (setId: string, field: keyof ExerciseSet, value: string) => {
    const num = parseFloat(value);
    if (value !== '' && isNaN(num)) return;
    const parsed = value === '' ? 0 : num;
    await updateSet(setId, { [field]: parsed });
  }, [updateSet]);

  const handleFinish = () => {
    const completedCount = activeWorkout?.exercises
      .flatMap((e) => e.sets)
      .filter((s) => s.completed && !s.isWarmup).length ?? 0;

    if (completedCount === 0) {
      Alert.alert(
        'Sin series completadas',
        '¿Seguro que quieres terminar sin marcar ninguna serie?',
        [
          { text: 'Seguir entrenando', style: 'cancel' },
          { text: 'Terminar igual', onPress: doFinish },
        ]
      );
      return;
    }
    doFinish();
  };

  const doFinish = () => {
    Alert.alert('Finalizar entrenamiento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          setFinishing(true);
          try {
            await completeWorkout();
            nav.replace('WorkoutSummary', { workoutId: activeWorkout!.id });
          } catch {
            Alert.alert('Error', 'No se pudo guardar el entrenamiento');
          } finally {
            setFinishing(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancelar entrenamiento', '¿Seguro? Se perderán los datos.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar entreno', style: 'destructive',
        onPress: async () => {
          await useWorkoutStore.getState().cancelWorkout();
          nav.goBack();
        },
      },
    ]);
  };

  if (!activeWorkout) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <Ionicons name="barbell-outline" size={40} color={colors.brand[400]} style={{ opacity: 0.5 }} />
        <Text style={{ color: colors.text.secondary }}>Preparando entrenamiento...</Text>
      </View>
    );
  }

  const totalCompleted = activeWorkout.exercises
    .flatMap((e) => e.sets)
    .filter((s) => s.completed && !s.isWarmup).length;

  const totalSeries = activeWorkout.exercises
    .flatMap((e) => e.sets)
    .filter((s) => !s.isWarmup).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
        gap: 12,
      }}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="close" size={22} color={colors.text.muted} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '800' }} numberOfLines={1}>
            {activeWorkout.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={12} color={colors.brand[400]} />
              <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '700' }}>
                {formatDuration(elapsed)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle-outline" size={12} color={colors.text.muted} />
              <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>
                {totalCompleted}/{totalSeries}
              </Text>
            </View>
          </View>
        </View>

        <Button
          label="Finalizar"
          size="sm"
          onPress={handleFinish}
          loading={finishing}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {activeWorkout.exercises.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 14, paddingTop: 60 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: 'rgba(59,130,246,0.1)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="barbell-outline" size={36} color={colors.brand[400]} style={{ opacity: 0.6 }} />
            </View>
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.md, fontWeight: '600' }}>
              Agrega ejercicios para empezar
            </Text>
            <Text style={{ color: colors.text.muted, fontSize: fontSize.sm, textAlign: 'center' }}>
              Pulsa el botón de abajo para elegir ejercicios
            </Text>
          </View>
        ) : (
          activeWorkout.exercises.map((we) => {
            const ex = exercises.find((e) => e.id === we.exerciseId);
            return (
              <ExerciseBlock
                key={we.id}
                we={we}
                exerciseName={ex?.name ?? 'Ejercicio'}
                muscleGroup={ex?.muscleGroup ?? 'other'}
                exerciseType={ex?.exerciseType ?? 'weight'}
                onAddSet={(warmup) => handleAddSet(we.id, warmup)}
                onToggleSet={handleToggleSet}
                onEditSet={handleEditSet}
              />
            );
          })
        )}

        {/* Agregar ejercicio */}
        <TouchableOpacity
          onPress={() => nav.navigate('ExercisePicker', {
            onSelect: (exId) => addExerciseToWorkout(exId),
          })}
          style={{
            borderRadius: radius.xl,
            borderWidth: 1.5, borderColor: 'rgba(59,130,246,0.3)',
            borderStyle: 'dashed', padding: 20,
            alignItems: 'center', gap: 10,
            backgroundColor: 'rgba(59,130,246,0.04)',
          }}
          activeOpacity={0.7}
        >
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: 'rgba(59,130,246,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="add" size={24} color={colors.brand[400]} />
          </View>
          <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '700' }}>
            Agregar ejercicio
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
