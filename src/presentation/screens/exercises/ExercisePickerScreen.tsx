import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { useExerciseStore } from '../../../store';
import { Input, Badge } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '../../../utils/formatters';
import type { MuscleGroup } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'ExercisePicker'>;

const MUSCLE_FILTERS: { label: string; value: MuscleGroup | null }[] = [
  { label: 'Todos', value: null },
  { label: 'Pecho',  value: 'chest' },
  { label: 'Espalda', value: 'back' },
  { label: 'Hombros', value: 'shoulders' },
  { label: 'Bíceps',  value: 'biceps' },
  { label: 'Tríceps', value: 'triceps' },
  { label: 'Piernas', value: 'quads' },
  { label: 'Core',    value: 'core' },
];

export function ExercisePickerScreen() {
  const nav   = useNavigation();
  const route = useRoute<Route>();
  const { filtered, isLoading, loadExercises, setSearch, setFilter, searchQuery, filterMuscle } = useExerciseStore();

  useEffect(() => {
    loadExercises();
    return () => { setSearch(''); setFilter(null); };
  }, []);

  const handleSelect = (exerciseId: string) => {
    route.params.onSelect(exerciseId);
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: colors.border.default,
      }}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '700' }}>
          Seleccionar ejercicio
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: 14, gap: 12 }}>
        <Input
          placeholder="Buscar ejercicio..."
          value={searchQuery}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search" size={16} color={colors.text.muted} />}
        />
        <FlatList
          horizontal
          data={MUSCLE_FILTERS}
          keyExtractor={(i) => String(i.value)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.value)}
              style={{
                paddingHorizontal: 14, paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: filterMuscle === item.value ? colors.brand[600] : colors.bg.card,
                borderWidth: filterMuscle === item.value ? 0 : 1,
                borderColor: colors.border.default,
              }}
            >
              <Text style={{
                color: filterMuscle === item.value ? '#fff' : colors.text.secondary,
                fontSize: fontSize.sm, fontWeight: '600',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.lg, gap: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item.id)}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.bg.card,
              borderRadius: radius.md,
              padding: 14,
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: colors.bg.input,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="barbell-outline" size={18} color={colors.brand[400]} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text.primary, fontSize: fontSize.base, fontWeight: '600' }}>
                {item.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Badge label={MUSCLE_GROUP_LABELS[item.muscleGroup] ?? item.muscleGroup} size="sm" />
                <Badge label={EQUIPMENT_LABELS[item.equipment] ?? item.equipment} size="sm" color="gray" />
              </View>
            </View>
            <Ionicons name="add-circle" size={22} color={colors.brand[400]} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
