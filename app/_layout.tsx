import 'react-native-gesture-handler';
import '../src/styles/global.css';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { getDatabase } from '../src/infrastructure/database/client';
import { runSeed } from '../src/infrastructure/services/SeedService';
import { UserRepository } from '../src/infrastructure/repositories/UserRepository';
import { RootNavigator } from '../src/navigation/RootNavigator';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // 1. Inicializar DB y ejecutar migraciones
      await getDatabase();
      // 2. Seed de ejercicios (solo si están vacíos)
      await runSeed();
      // 3. Crear perfil de usuario si no existe
      await UserRepository.getOrCreate();

      setReady(true);
      await SplashScreen.hideAsync();
    } catch (e) {
      setError(String(e));
      await SplashScreen.hideAsync();
    }
  };

  if (error) {
    return (
      <View style={{
        flex: 1, backgroundColor: colors.bg.primary,
        alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <Text style={{ color: colors.accent.red, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
          Error al iniciar la app
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 13, textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{
        flex: 1, backgroundColor: colors.bg.primary,
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <Text style={{ color: colors.brand[400], fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>
          Gymetra
        </Text>
        <ActivityIndicator color={colors.brand[400]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary:       colors.brand[500],
              background:    colors.bg.primary,
              card:          colors.bg.secondary,
              text:          colors.text.primary,
              border:        colors.border.default,
              notification:  colors.brand[500],
            },
          }}
        >
          <StatusBar style="light" backgroundColor={colors.bg.primary} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
