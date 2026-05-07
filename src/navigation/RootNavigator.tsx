import React, { useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { WorkoutScreen } from '../presentation/screens/workout/WorkoutScreen';
import { RoutineFormScreen } from '../presentation/screens/routines/RoutineFormScreen';
import { ExercisePickerScreen } from '../presentation/screens/exercises/ExercisePickerScreen';
import { WorkoutSummaryScreen } from '../presentation/screens/workout/WorkoutSummaryScreen';
import { ExerciseDetailScreen } from '../presentation/screens/exercises/ExerciseDetailScreen';
import { AchievementsScreen } from '../presentation/screens/achievements/AchievementsScreen';
import { LevelUpModal, AchievementToast } from '../components/ui';
import { useUserStore, useAchievementStore } from '../store';
import { colors } from '../theme';
import type { Achievement } from '../domain/models';

export type RootStackParamList = {
  Tabs:            undefined;
  Workout:         { routineId?: string; routineName?: string };
  RoutineForm:     { routineId?: string };
  ExercisePicker:  { onSelect: (exerciseId: string) => void };
  WorkoutSummary:  { workoutId: string };
  ExerciseDetail:  { exerciseId: string };
  Achievements:    undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Componente que envuelve el navegador y maneja los modales globales de XP/logros
export function RootNavigator() {
  const profile = useUserStore((s) => s.profile);
  const prevLevel = useRef(profile?.level ?? 1);

  const { recentlyUnlocked, clearRecentlyUnlocked } = useAchievementStore();
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null);
  const toastQueue = useRef<Achievement[]>([]);

  // Detectar subida de nivel
  useEffect(() => {
    if (!profile) return;
    if (profile.level > prevLevel.current) {
      setNewLevel(profile.level);
      setLevelUpVisible(true);
    }
    prevLevel.current = profile.level;
  }, [profile?.level]);

  // Gestionar cola de toasts de logros
  useEffect(() => {
    if (recentlyUnlocked.length === 0) return;
    toastQueue.current = [...toastQueue.current, ...recentlyUnlocked];
    clearRecentlyUnlocked();
    if (!currentToast) showNextToast();
  }, [recentlyUnlocked]);

  function showNextToast() {
    if (toastQueue.current.length === 0) {
      setCurrentToast(null);
      return;
    }
    const next = toastQueue.current.shift()!;
    setCurrentToast(next);
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.bg.primary },
        }}
      >
        <Stack.Screen name="Tabs"            component={TabNavigator} />
        <Stack.Screen name="Workout"         component={WorkoutScreen}
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen name="RoutineForm"     component={RoutineFormScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="ExercisePicker"  component={ExercisePickerScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="WorkoutSummary"  component={WorkoutSummaryScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="ExerciseDetail"  component={ExerciseDetailScreen} />
        <Stack.Screen name="Achievements"    component={AchievementsScreen}
          options={{ presentation: 'card' }}
        />
      </Stack.Navigator>

      {/* Toast de logro desbloqueado */}
      <AchievementToast
        achievement={currentToast}
        onHide={showNextToast}
      />

      {/* Modal de subida de nivel */}
      <LevelUpModal
        visible={levelUpVisible}
        newLevel={newLevel}
        onClose={() => setLevelUpVisible(false)}
      />
    </>
  );
}
