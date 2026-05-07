import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fontSize, spacing, radius } from '../../theme';
import type { Achievement } from '../../domain/models';

interface AchievementToastProps {
  achievement: Achievement | null;
  onHide: () => void;
}

const { width } = Dimensions.get('window');

export function AchievementToast({ achievement, onHide }: AchievementToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievement) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      // Auto-ocultar después de 3.5s
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -120, duration: 350, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start(onHide);
      }, 3500);
    });

    return () => {
      translateY.setValue(-120);
      opacity.setValue(0);
    };
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: spacing.lg,
        right: spacing.lg,
        transform: [{ translateY }],
        opacity,
        zIndex: 999,
      }}
    >
      <View
        style={{
          backgroundColor: 'rgba(26,32,53,0.97)',
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.accent.yellow,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          shadowColor: colors.accent.yellow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* Icono */}
        <View
          style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: 'rgba(245,158,11,0.15)',
            borderWidth: 1.5,
            borderColor: colors.accent.yellow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={achievement.iconName as any} size={24} color={colors.accent.yellow} />
        </View>

        {/* Texto */}
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.accent.yellow,
            fontSize: fontSize.xs,
            fontWeight: '700',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            Logro desbloqueado
          </Text>
          <Text style={{
            color: colors.text.primary,
            fontSize: fontSize.base,
            fontWeight: '700',
            marginTop: 2,
          }}>
            {achievement.title}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: fontSize.xs,
            marginTop: 1,
          }}>
            +{achievement.xpReward} XP
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
