import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useRoutineStore, useExerciseStore } from '../../../store';
import { RoutineRepository } from '../../../infrastructure/repositories/RoutineRepository';
import { Button, Input, Badge, Card } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import {
  MUSCLE_GROUP_LABELS, CATEGORY_COLORS,
} from '../../../utils/formatters';
import type { Routine, RoutineCategory, DayOfWeek, RoutineExercise } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Nav   = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'RoutineForm'>;

const CATEGORIES: { label: string; value: RoutineCategory; color: string }[] = [
  { label: 'Push',      value: 'push',      color: CATEGORY_COLORS.push },
  { label: 'Pull',      value: 'pull',      color: CATEGORY_COLORS.pull },
  { label: 'Piernas',   value: 'legs',      color: CATEGORY_COLORS.legs },
  { label: 'Full Body', value: 'full_body', color: CATEGORY_COLORS.full_body },
  { label: 'Superior',  value: 'upper',     color: CATEGORY_COLORS.upper },
  { label: 'Inferior',  value: 'lower',     color: CATEGORY_COLORS.lower },
  { label: 'Custom',    value: 'custom',    color: CATEGORY_COLORS.custom },
];

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const ROUTINE_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#F97316',
];

export function RoutineFormScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { createRoutine, updateRoutine, loadRoutines } = useRoutineStore();
  const { exercises, loadExercises } = useExerciseStore();

  const isEdit = !!route.params?.routineId;

  const [name, setName]             = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState<RoutineCategory>('custom');
  const [days, setDays]             = useState<DayOfWeek[]>([]);
  const [color, setColor]           = useState(ROUTINE_COLORS[0]);
  const [routineExercises, setREx]  = useState<RoutineExercise[]>([]);
  const [saving, setSaving]         = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  useEffect(() => {
    loadExercises();
    if (isEdit) {
      RoutineRepository.getById(route.params!.routineId!).then((r) => {
        if (!r) return;
        setName(r.name);
        setDesc(r.description ?? '');
        setCategory(r.category);
        setDays(r.scheduledDays);
        setColor(r.color);
        setREx(r.exercises);
      });
    }
  }, []);

  const toggleDay = (day: DayOfWeek) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addExercise = () => {
    nav.navigate('ExercisePicker', {
      onSelect: (exId) => {
        setREx((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            routineId: route.params?.routineId ?? '',
            exerciseId: exId,
            orderIndex: prev.length,
            targetSets: 3,
            targetReps: 10,
            restSeconds: 90,
          },
        ]);
      },
    });
  };

  const removeExercise = (idx: number) => {
    setREx((prev) => prev.filter((_, i) => i !== idx)
      .map((e, i) => ({ ...e, orderIndex: i })));
  };

  const updateExerciseSets = (idx: number, field: keyof RoutineExercise, value: number) => {
    setREx((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (name.trim().length > 50) errs.name = 'Máximo 50 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        scheduledDays: days,
        exercises: routineExercises,
        estimatedDuration: routineExercises.length * 10 + 10,
        color,
        isActive: true,
        lastUsedAt: undefined,
      };

      if (isEdit) {
        await updateRoutine(route.params!.routineId!, data);
      } else {
        await createRoutine(data);
      }
      await loadRoutines();
      nav.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la rutina');
    } finally {
      setSaving(false);
    }
  };

  const getExerciseName = (exId: string) =>
    exercises.find((e) => e.id === exId)?.name ?? 'Ejercicio';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: spacing.lg, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: colors.border.default,
        }}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '700', textAlign: 'center' }}>
            {isEdit ? 'Editar rutina' : 'Nueva rutina'}
          </Text>
          <Button label="Guardar" size="sm" onPress={handleSave} loading={saving} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nombre */}
          <Input
            label="Nombre de la rutina *"
            value={name}
            onChangeText={setName}
            placeholder="ej. Push A, Piernas Fuerza..."
            error={errors.name}
          />

          <Input
            label="Descripción"
            value={description}
            onChangeText={setDesc}
            placeholder="Descripción opcional..."
            multiline
            numberOfLines={2}
            style={{ height: 72 }}
          />

          {/* Categoría */}
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '500' }}>
              Categoría
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: radius.full,
                    backgroundColor: category === cat.value ? cat.color : colors.bg.card,
                    borderWidth: category === cat.value ? 0 : 1,
                    borderColor: colors.border.default,
                  }}
                >
                  <Text style={{
                    color: category === cat.value ? '#fff' : colors.text.secondary,
                    fontSize: fontSize.sm, fontWeight: '600',
                  }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '500' }}>
              Color
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {ROUTINE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: color === c ? 3 : 0,
                    borderColor: '#fff',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {color === c && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Días */}
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '500' }}>
              Días programados
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => toggleDay(d as DayOfWeek)}
                  style={{
                    flex: 1, height: 40, borderRadius: 8,
                    backgroundColor: days.includes(d as DayOfWeek) ? color : colors.bg.card,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: days.includes(d as DayOfWeek) ? 0 : 1,
                    borderColor: colors.border.default,
                  }}
                >
                  <Text style={{
                    fontSize: 11, fontWeight: '700',
                    color: days.includes(d as DayOfWeek) ? '#fff' : colors.text.muted,
                  }}>
                    {DAY_LABELS[d]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ejercicios */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700' }}>
                Ejercicios ({routineExercises.length})
              </Text>
              <Button
                label="Agregar"
                size="sm"
                variant="secondary"
                icon={<Ionicons name="add" size={14} color={colors.brand[400]} />}
                onPress={addExercise}
              />
            </View>

            {routineExercises.map((re, idx) => (
              <Card key={re.id} variant="outlined">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: colors.bg.input,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '700' }}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, color: colors.text.primary, fontSize: fontSize.base, fontWeight: '600' }}>
                    {getExerciseName(re.exerciseId)}
                  </Text>
                  <TouchableOpacity onPress={() => removeExercise(idx)}>
                    <Ionicons name="trash-outline" size={16} color={colors.accent.red} />
                  </TouchableOpacity>
                </View>

                {/* Series / Reps / Descanso */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                  {[
                    { label: 'Series', field: 'targetSets' as const, value: re.targetSets },
                    { label: 'Reps',   field: 'targetReps' as const, value: re.targetReps },
                    { label: 'Descanso (s)', field: 'restSeconds' as const, value: re.restSeconds },
                  ].map((f) => (
                    <View key={f.field} style={{ flex: 1, gap: 4 }}>
                      <Text style={{ color: colors.text.muted, fontSize: 10, fontWeight: '600' }}>
                        {f.label}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => updateExerciseSets(idx, f.field, Math.max(1, f.value - 1))}
                          style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bg.input, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="remove" size={14} color={colors.text.secondary} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '700', minWidth: 24, textAlign: 'center' }}>
                          {f.value}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateExerciseSets(idx, f.field, f.value + 1)}
                          style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bg.input, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="add" size={14} color={colors.text.secondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            ))}

            {routineExercises.length === 0 && (
              <TouchableOpacity
                onPress={addExercise}
                style={{
                  borderRadius: radius.lg, borderWidth: 1.5,
                  borderColor: colors.border.default, borderStyle: 'dashed',
                  padding: 24, alignItems: 'center', gap: 8,
                }}
              >
                <Ionicons name="add-circle-outline" size={32} color={colors.text.muted} />
                <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>
                  Agrega ejercicios a la rutina
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
