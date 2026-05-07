import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fontSize, spacing, radius } from '../../theme';
import { getLevelTitle } from '../../domain/models';

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export function LevelUpModal({ visible, newLevel, onClose }: LevelUpModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [visible]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
            width: width - spacing.xl * 2,
          }}
        >
          {/* Glow ring */}
          <Animated.View
            style={{
              width: 140, height: 140,
              borderRadius: 70,
              backgroundColor: 'rgba(245,158,11,0.12)',
              borderWidth: 2,
              borderColor: colors.accent.yellow,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              opacity: glowOpacity,
              shadowColor: colors.accent.yellow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Text style={{ fontSize: 56 }}>⚡</Text>
          </Animated.View>

          <Text style={{
            color: colors.accent.yellow,
            fontSize: fontSize.sm,
            fontWeight: '700',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            ¡Subiste de nivel!
          </Text>

          <Text style={{
            color: colors.text.primary,
            fontSize: 56,
            fontWeight: '900',
            lineHeight: 60,
            marginBottom: 4,
          }}>
            {newLevel}
          </Text>

          <Text style={{
            color: colors.accent.yellow,
            fontSize: fontSize.xl,
            fontWeight: '700',
            marginBottom: 24,
          }}>
            {getLevelTitle(newLevel)}
          </Text>

          <Text style={{
            color: colors.text.secondary,
            fontSize: fontSize.base,
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 22,
          }}>
            Tu dedicación te llevó al siguiente nivel. Sigue así, {getLevelTitle(newLevel)}.
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: colors.accent.yellow,
              borderRadius: radius.xl,
              paddingVertical: 14,
              paddingHorizontal: 40,
            }}
          >
            <Text style={{
              color: '#0A0F1E',
              fontSize: fontSize.md,
              fontWeight: '800',
            }}>
              ¡Continuar!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
