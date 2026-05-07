import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { useWorkoutStore } from '../store';

// Screens (importadas desde sus rutas)
import { DashboardScreen }  from '../presentation/screens/dashboard/DashboardScreen';
import { RoutinesScreen }   from '../presentation/screens/routines/RoutinesScreen';
import { HistoryScreen }    from '../presentation/screens/history/HistoryScreen';
import { ProgressScreen }   from '../presentation/screens/progress/ProgressScreen';
import { ProfileScreen }    from '../presentation/screens/profile/ProfileScreen';

export type TabParamList = {
  Dashboard: undefined;
  Routines:  undefined;
  History:   undefined;
  Progress:  undefined;
  Profile:   undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: {
  name: keyof TabParamList;
  label: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { name: 'Dashboard',  label: 'Inicio',    icon: 'home-outline',          activeIcon: 'home' },
  { name: 'Routines',   label: 'Rutinas',   icon: 'list-outline',          activeIcon: 'list' },
  { name: 'History',    label: 'Historial', icon: 'time-outline',          activeIcon: 'time' },
  { name: 'Progress',   label: 'Progreso',  icon: 'trending-up-outline',   activeIcon: 'trending-up' },
  { name: 'Profile',    label: 'Perfil',    icon: 'person-outline',        activeIcon: 'person' },
];

export function TabNavigator() {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name)!;
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bg.secondary,
            borderTopColor: colors.border.default,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tab.activeIcon : tab.icon}
              size={22}
              color={color}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 10, color, fontWeight: focused ? '700' : '500' }}>
              {tab.label}
            </Text>
          ),
          tabBarActiveTintColor:   colors.brand[400],
          tabBarInactiveTintColor: colors.text.muted,
        };
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={
            tab.name === 'Dashboard'  ? DashboardScreen :
            tab.name === 'Routines'   ? RoutinesScreen  :
            tab.name === 'History'    ? HistoryScreen   :
            tab.name === 'Progress'   ? ProgressScreen  :
            ProfileScreen
          }
        />
      ))}
    </Tab.Navigator>
  );
}
