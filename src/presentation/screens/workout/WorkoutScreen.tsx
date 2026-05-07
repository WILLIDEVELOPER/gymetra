import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useWorkoutStore, useExerciseStore, useRoutineStore } from '../../../store';
import { Button, Card, Badge } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { formatDuration, MUSCLE_GROUP_LABELS } from '../../../utils/formatters';
import type { ExerciseSet, WorkoutExercise } from '../../../domain/models';
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

interface SetRowProps {
  set: ExerciseSet;
  setNum: number;
  onToggle: () => void;
  onEdit: (field: 'weight' | 'reps' | 'rir', value: string) => void;
}

function SetRow({ set, setNum, onToggle, onEdit }: SetRowProps) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingVertical: 6,
      opacity: set.isWarmup ? 0.6 : 1,
    }}>
      <Text style={{ color: colors.text.muted, fontSize: fontSize.sm, width: 22, textAlign: 'center' }}>
        {set.isWarmup ? 'W' : setNum}
      </Text>

      {/* Peso */}
      <View style={{
        flex: 1, backgroundColor: colors.bg.input,
        borderRadius: radius.sm, paddingHorizontal: 8, height: 38,
        justifyContent: 'center',
      }}>
        <TextInput
          value={set.weight > 0 ? String(set.weight) : ''}
          onChangeText={(v) => onEdit('weight', v)}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.text.muted}
          style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '600' }}
        />
      </View>

      <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>kg</Text>

      {/* Reps */}
      <View style={{
        flex: 1, backgroundColor: colors.bg.input,
        borderRadius: radius.sm, paddingHorizontal: 8, height: 38,
        justifyContent: 'center',
      }}>
        <TextInput
          value={set.reps > 0 ? String(set.reps) : ''}
          onChangeText={(v) => onEdit('reps', v)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.text.muted}
          style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '600' }}
        />
      </View>

      {/* RIR */}
      <View style={{ alignItems: 'center', width: 36 }}>
        <Text style={{ color: colors.text.muted, fontSize: 9, fontWeight: '600' }}>RIR</Text>
        <TextInput
          value={String(set.rir)}
          onChangeText={(v) => onEdit('rir', v)}
          keyboardType="number-pad"
          style={{
            color: colors.accent.cyan, fontSize: fontSize.sm,
            fontWeight: '700', textAlign: 'center', width: '100%',
          }}
        />
      </View>

      {/* Completar */}
      <TouchableOpacity
        onPress={onToggle}
        style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: set.completed ? colors.accent.green : colors.bg.input,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: set.completed ? 0 : 1,
          borderColor: colors.border.default,
        }}
      >
        <Ionicons
          name={set.completed ? 'checkmark' : 'checkmark-outline'}
          size={18}
          color={set.completed ? '#fff' : colors.text.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

interface ExerciseBlockProps {
  we: WorkoutExercise;
  exerciseName: string;
  muscleGroup: string;
  onAddSet: (warmup?: boolean) => void;
  onToggleSet: (setId: string, completed: boolean) => void;
  onEditSet: (setId: string, field: 'weight' | 'reps' | 'rir', value: string) => void;
}

function ExerciseBlock({ we, exerciseName, muscleGroup, onAddSet, onToggleSet, onEditSet }: ExerciseBlockProps) {
  const workingSets = we.sets.filter((s) => !s.isWarmup);
  const completed   = workingSets.filter((s) => s.completed).length;

  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' }}>
            {exerciseName}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <Badge label={MUSCLE_GROUP_LABELS[muscleGroup] ?? muscleGroup} size="sm" />
            {workingSets.length > 0 && (
              <Badge label={`${completed}/${workingSets.length} series`} size="sm" color={completed === workingSets.length ? 'green' : 'gray'} />
            )}
          </View>
        </View>
      </View>

      {/* Header tabla */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4, paddingHorizontal: 0 }}>
        <Text style={{ color: colors.text.muted, fontSize: 10, width: 22, textAlign: 'center' }}>#</Text>
        <Text style={{ flex: 1, color: colors.text.muted, fontSize: 10, textAlign: 'center' }}>Peso</Text>
        <Text style={{ width: 18 }} />
        <Text style={{ flex: 1, color: colors.text.muted, fontSize: 10, textAlign: 'center' }}>Reps</Text>
        <Text style={{ color: colors.text.muted, fontSize: 10, width: 36, textAlign: 'center' }}>RIR</Text>
        <Text style={{ width: 36 }} />
      </View>

      {we.sets.map((set, idx) => {
        const workingIdx = we.sets.filter((s, i) => !s.isWarmup && i <= idx).length;
        return (
          <SetRow
            key={set.id}
            set={set}
            setNum={workingIdx}
            onToggle={() => onToggleSet(set.id, !set.completed)}
            onEdit={(field, value) => onEditSet(set.id, field, value)}
          />
        );
      })}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => onAddSet(false)}
          style={{
            flex: 1, height: 34, borderRadius: radius.sm,
            borderWidth: 1, borderColor: colors.brand[600], borderStyle: 'dashed',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '600' }}>
            + Serie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onAddSet(true)}
          style={{
            height: 34, paddingHorizontal: 12,
            borderRadius: radius.sm, borderWidth: 1,
            borderColor: colors.border.default, borderStyle: 'dashed',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>+ Calent.</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export function WorkoutScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { routines } = useRoutineStore();
  const { exercises, loadExercises } = useExerciseStore();
  const { activeWorkout, startWorkout, addExerciseToWorkout, addSet, updateSet, completeWorkout } = useWorkoutStore();

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
    const name = routine?.name ?? `Entreno ${new Date().toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}`;
    await startWorkout(name, routine);
  };

  const handleAddSet = async (workoutExerciseId: string, warmup = false) => {
    const we = activeWorkout?.exercises.find((e) => e.id === workoutExerciseId);
    if (!we) return;

    const lastSet = [...we.sets].reverse().find((s) => s.isWarmup === warmup);
    const setNum = we.sets.filter((s) => s.isWarmup === warmup).length + 1;

    await addSet(workoutExerciseId, {
      workoutExerciseId,
      setNumber: setNum,
      weight: lastSet?.weight ?? 0,
      reps: lastSet?.reps ?? 10,
      rir: lastSet?.rir ?? 2,
      restSeconds: 90,
      isWarmup: warmup,
      isDropset: false,
      completed: false,
    });
  };

  const handleToggleSet = async (setId: string, completed: boolean) => {
    await updateSet(setId, { completed });
  };

  const handleEditSet = async (setId: string, field: 'weight' | 'reps' | 'rir', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    await updateSet(setId, { [field]: num });
  };

  const handleFinish = () => {
    Alert.alert('Finalizar entrenamiento', '¿Estás seguro de que quieres terminar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          setFinishing(true);
          try {
            const { xpEarned, newPRs } = await completeWorkout();
            nav.replace('WorkoutSummary', { workoutId: activeWorkout!.id });
          } catch (e) {
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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.secondary }}>Cargando entrenamiento...</Text>
      </View>
    );
  }

  const totalCompleted = activeWorkout.exercises
    .flatMap((e) => e.sets)
    .filter((s) => s.completed && !s.isWarmup).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.border.default,
        gap: 12,
      }}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="close" size={22} color={colors.text.muted} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '700' }} numberOfLines={1}>
            {activeWorkout.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
            <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '600' }}>
              {formatDuration(elapsed)}
            </Text>
            <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>
              {totalCompleted} series
            </Text>
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
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {activeWorkout.exercises.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 12, paddingTop: 40 }}>
            <Ionicons name="barbell-outline" size={56} color={colors.text.muted} style={{ opacity: 0.4 }} />
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.md }}>
              Agrega ejercicios para empezar
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
            borderRadius: radius.lg,
            borderWidth: 1.5, borderColor: colors.border.default,
            borderStyle: 'dashed', padding: 18,
            alignItems: 'center', gap: 8,
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.brand[400]} />
          <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '600' }}>
            Agregar ejercicio
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
