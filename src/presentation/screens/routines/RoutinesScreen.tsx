import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActionSheetIOS, Alert, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useRoutineStore } from '../../../store';
import { RoutineCard } from '../../../components/routine/RoutineCard';
import { Button, EmptyState, Input, Badge } from '../../../components/ui';
import { colors, fontSize, spacing } from '../../../theme';
import type { Routine, RoutineCategory } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

const CATEGORY_FILTERS: { label: string; value: RoutineCategory | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Push',  value: 'push' },
  { label: 'Pull',  value: 'pull' },
  { label: 'Piernas', value: 'legs' },
  { label: 'Full Body', value: 'full_body' },
  { label: 'Superior', value: 'upper' },
  { label: 'Inferior',  value: 'lower' },
  { label: 'Custom',    value: 'custom' },
];

export function RoutinesScreen() {
  const nav = useNavigation<Nav>();
  const { routines, isLoading, loadRoutines, deleteRoutine, duplicateRoutine } = useRoutineStore();
  const [filter, setFilter] = useState<RoutineCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadRoutines(); }, []);

  const filtered = routines.filter((r) => {
    const matchCat    = filter === 'all' || r.category === filter;
    const matchSearch = search === '' || r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const showOptions = (routine: Routine) => {
    const options = ['Editar', 'Duplicar', 'Eliminar', 'Cancelar'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, destructiveButtonIndex: 2, title: routine.name },
        (idx) => handleOption(idx, routine)
      );
    } else {
      Alert.alert(routine.name, undefined, [
        { text: 'Editar',    onPress: () => handleOption(0, routine) },
        { text: 'Duplicar', onPress: () => handleOption(1, routine) },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleOption(2, routine) },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  const handleOption = async (idx: number, routine: Routine) => {
    if (idx === 0) {
      nav.navigate('RoutineForm', { routineId: routine.id });
    } else if (idx === 1) {
      await duplicateRoutine(routine.id);
    } else if (idx === 2) {
      Alert.alert(
        'Eliminar rutina',
        `¿Estás seguro de eliminar "${routine.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoutine(routine.id) },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 12, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '800' }}>
            Rutinas
          </Text>
          <TouchableOpacity
            onPress={() => nav.navigate('RoutineForm', {})}
            style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: colors.brand[600],
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Buscar rutina..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search" size={16} color={colors.text.muted} />}
        />

        {/* Filtros */}
        <FlatList
          horizontal
          data={CATEGORY_FILTERS}
          keyExtractor={(i) => i.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.value)}
              style={{
                paddingHorizontal: 14, paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: filter === item.value ? colors.brand[600] : colors.bg.card,
                borderWidth: filter === item.value ? 0 : 1,
                borderColor: colors.border.default,
              }}
            >
              <Text style={{
                color: filter === item.value ? '#fff' : colors.text.secondary,
                fontSize: fontSize.sm, fontWeight: '600',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="list" size={56} color={colors.text.muted} />}
            title={routines.length === 0 ? 'Sin rutinas' : 'Sin resultados'}
            subtitle={
              routines.length === 0
                ? 'Crea tu primera rutina y comienza a entrenar'
                : 'Prueba con otro filtro o búsqueda'
            }
            action={
              routines.length === 0 ? (
                <Button
                  label="Crear rutina"
                  onPress={() => nav.navigate('RoutineForm', {})}
                />
              ) : undefined
            }
          />
        }
        renderItem={({ item }) => (
          <RoutineCard
            routine={item}
            onPress={() => nav.navigate('RoutineForm', { routineId: item.id })}
            onStart={() => nav.navigate('Workout', { routineId: item.id, routineName: item.name })}
            onOptions={() => showOptions(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}
