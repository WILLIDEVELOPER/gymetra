import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StatusBar,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAchievementStore } from '../../../store';
import { GlassCard, ProgressBar, Skeleton } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import type { Achievement } from '../../../domain/models';

// ─── Tarjeta de logro ──────────────────────────────────────────────────────────
interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const { unlocked, progress, maxProgress, iconName, title, description, xpReward } = achievement;
  const pct = maxProgress > 0 ? Math.min(progress / maxProgress, 1) : 0;
  const isNearlyDone = !unlocked && pct >= 0.5;

  return (
    <GlassCard
      accent={unlocked ? colors.accent.yellow : isNearlyDone ? colors.brand[400] : undefined}
      style={{ marginBottom: 10, opacity: unlocked ? 1 : 0.75 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        {/* Icono */}
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: unlocked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
          borderWidth: 1.5,
          borderColor: unlocked ? colors.accent.yellow : 'rgba(255,255,255,0.1)',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: unlocked ? colors.accent.yellow : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: unlocked ? 4 : 0,
        }}>
          <Ionicons
            name={iconName as any}
            size={24}
            color={unlocked ? colors.accent.yellow : colors.text.muted}
          />
        </View>

        {/* Info */}
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{
              color: unlocked ? colors.text.primary : colors.text.secondary,
              fontSize: fontSize.base, fontWeight: '800',
            }}>
              {title}
            </Text>
            {unlocked ? (
              <View style={{
                backgroundColor: 'rgba(245,158,11,0.15)',
                borderRadius: radius.sm,
                paddingHorizontal: 7, paddingVertical: 2,
              }}>
                <Text style={{ color: colors.accent.yellow, fontSize: 10, fontWeight: '800' }}>
                  ✓ +{xpReward} XP
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.text.muted, fontSize: 10, fontWeight: '600' }}>
                +{xpReward} XP
              </Text>
            )}
          </View>
          <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, lineHeight: 16 }}>
            {description}
          </Text>

          {/* Barra de progreso */}
          {!unlocked && maxProgress > 1 && (
            <View style={{ marginTop: 6, gap: 3 }}>
              <ProgressBar value={pct * 100} color={isNearlyDone ? colors.brand[400] : colors.text.muted} height={4} />
              <Text style={{ color: colors.text.muted, fontSize: 10 }}>
                {Math.floor(progress)}/{maxProgress}
              </Text>
            </View>
          )}
          {!unlocked && maxProgress === 1 && (
            <View style={{ marginTop: 4 }}>
              <View style={{
                height: 4, borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <View style={{
                  width: progress >= 1 ? '100%' : '0%',
                  height: '100%',
                  backgroundColor: colors.brand[400],
                  borderRadius: 2,
                }} />
              </View>
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export function AchievementsScreen() {
  const nav = useNavigation();
  const { achievements, isLoading, loadAchievements } = useAchievementStore();

  useEffect(() => {
    loadAchievements();
  }, []);

  const unlockedList = achievements.filter((a) => a.unlocked);
  const lockedList   = achievements.filter((a) => !a.unlocked);
  const totalXP      = unlockedList.reduce((s, a) => s + a.xpReward, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
        gap: 12,
      }}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '900', flex: 1 }}>
          Logros
        </Text>
        <View style={{
          backgroundColor: 'rgba(245,158,11,0.12)',
          borderRadius: radius.md,
          paddingHorizontal: 10, paddingVertical: 5,
          flexDirection: 'row', gap: 5, alignItems: 'center',
        }}>
          <Ionicons name="trophy" size={14} color={colors.accent.yellow} />
          <Text style={{ color: colors.accent.yellow, fontSize: fontSize.sm, fontWeight: '800' }}>
            {unlockedList.length}/{achievements.length}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <GlassCard>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <Skeleton width={52} height={52} borderRadius={26} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width="70%" height={14} />
                    <Skeleton width="90%" height={11} />
                    <Skeleton width="50%" height={4} borderRadius={2} />
                  </View>
                </View>
              </GlassCard>
            </View>
          ))
        ) : (
          <>
            {/* Resumen de XP de logros */}
            {unlockedList.length > 0 && (
              <GlassCard accent={colors.accent.yellow} style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center', gap: 2 }}>
                    <Text style={{ color: colors.accent.yellow, fontSize: 24, fontWeight: '900' }}>
                      {unlockedList.length}
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                      Desbloqueados
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <View style={{ alignItems: 'center', gap: 2 }}>
                    <Text style={{ color: colors.accent.yellow, fontSize: 24, fontWeight: '900' }}>
                      {totalXP}
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                      XP de logros
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <View style={{ alignItems: 'center', gap: 2 }}>
                    <Text style={{ color: colors.text.secondary, fontSize: 24, fontWeight: '900' }}>
                      {lockedList.length}
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                      Pendientes
                    </Text>
                  </View>
                </View>
              </GlassCard>
            )}

            {/* Logros desbloqueados */}
            {unlockedList.length > 0 && (
              <View style={{ marginBottom: 6 }}>
                <Text style={{
                  color: colors.accent.yellow,
                  fontSize: fontSize.sm, fontWeight: '800',
                  letterSpacing: 1, textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  ✓ Desbloqueados ({unlockedList.length})
                </Text>
                {unlockedList.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </View>
            )}

            {/* Logros pendientes */}
            {lockedList.length > 0 && (
              <View>
                <Text style={{
                  color: colors.text.muted,
                  fontSize: fontSize.sm, fontWeight: '800',
                  letterSpacing: 1, textTransform: 'uppercase',
                  marginBottom: 10,
                  marginTop: unlockedList.length > 0 ? 6 : 0,
                }}>
                  Pendientes ({lockedList.length})
                </Text>
                {lockedList.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </View>
            )}

            {/* Estado vacío inicial */}
            {achievements.length === 0 && (
              <View style={{ alignItems: 'center', gap: 14, paddingTop: 60 }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name="trophy-outline" size={36} color={colors.accent.yellow} style={{ opacity: 0.5 }} />
                </View>
                <Text style={{ color: colors.text.secondary, fontSize: fontSize.md, fontWeight: '700' }}>
                  Completa tu primer entrenamiento
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: fontSize.sm, textAlign: 'center' }}>
                  Los logros se desbloquean automáticamente al alcanzar hitos en tu entrenamiento
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
