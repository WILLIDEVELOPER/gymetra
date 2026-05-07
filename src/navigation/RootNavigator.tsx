import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { WorkoutScreen } from '../presentation/screens/workout/WorkoutScreen';
import { RoutineFormScreen } from '../presentation/screens/routines/RoutineFormScreen';
import { ExercisePickerScreen } from '../presentation/screens/exercises/ExercisePickerScreen';
import { WorkoutSummaryScreen } from '../presentation/screens/workout/WorkoutSummaryScreen';
import { ExerciseDetailScreen } from '../presentation/screens/exercises/ExerciseDetailScreen';
import { colors } from '../theme';

export type RootStackParamList = {
  Tabs:            undefined;
  Workout:         { routineId?: string; routineName?: string };
  RoutineForm:     { routineId?: string };
  ExercisePicker:  { onSelect: (exerciseId: string) => void };
  WorkoutSummary:  { workoutId: string };
  ExerciseDetail:  { exerciseId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="Tabs"           component={TabNavigator} />
      <Stack.Screen name="Workout"        component={WorkoutScreen}
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      <Stack.Screen name="RoutineForm"    component={RoutineFormScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    </Stack.Navigator>
  );
}
