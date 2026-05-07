import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useUserStore, useAchievementStore } from '../../../store';
import { GlassCard, Card, XPBar, ProgressBar, Badge, Input, Button, UpdateModal } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { formatDuration, formatVolume } from '../../../utils/formatters';
import { useUpdateCheck } from '../../../hooks/useUpdateCheck';
import type { UserProfile, FitnessGoal, ExperienceLevel } from '../../../domain/models';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

const GOAL_LABELS: Record<FitnessGoal, string> = {
  strength:    '💪 Fuerza',
  hypertrophy: '🦾 Hipertrofia',
  endurance:   '🏃 Resistencia',
  weight_loss: '🔥 Perder peso',
  general:     '⚡ General',
};

const GOAL_OPTIONS: { label: string; value: FitnessGoal }[] = [
  { label: '💪 Fuerza',      value: 'strength' },
  { label: '🦾 Hipertrofia', value: 'hypertrophy' },
  { label: '🏃 Resistencia', value: 'endurance' },
  { label: '🔥 Perder peso', value: 'weight_loss' },
  { label: '⚡ General',     value: 'general' },
];

const LEVEL_OPTIONS: { label: string; value: ExperienceLevel }[] = [
  { label: '🌱 Principiante', value: 'beginner' },
  { label: '⚡ Intermedio',   value: 'intermediate' },
  { label: '🦾 Avanzado',     value: 'advanced' },
  { label: '👑 Élite',        value: 'elite' },
];

const STAT_CONFIG = [
  { key: 'strength' as const,    label: 'Fuerza',       icon: '💪', color: colors.brand[400] },
  { key: 'discipline' as const,  label: 'Disciplina',   icon: '🧠', color: colors.accent.purple },
  { key: 'consistency' as const, label: 'Consistencia', icon: '🔥', color: colors.accent.orange },
];

function RPGStats({ stats }: { stats: UserProfile['stats'] }) {
  return (
    <View style={{ gap: 12 }}>
      {STAT_CONFIG.map((s) => (
        <View key={s.key} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Text style={{ fontSize: 15 }}>{s.icon}</Text>
              <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '600' }}>
                {s.label}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: s.color, fontSize: fontSize.sm, fontWeight: '800' }}>
                {Math.floor(typeof stats[s.key] === 'number' ? stats[s.key] : 0)}
              </Text>
              <Text style={{ color: colors.text.muted, fontSize: 10 }}>/100</Text>
            </View>
          </View>
          <ProgressBar value={typeof stats[s.key] === 'number' ? stats[s.key] : 0} color={s.color} height={6} />
        </View>
      ))}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 6, padding: 10,
        backgroundColor: 'rgba(59,130,246,0.06)',
        borderRadius: radius.md,
      }}>
        <Ionicons name="barbell-outline" size={14} color={colors.accent.cyan} />
        <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
          Volumen total:{' '}
          <Text style={{ color: colors.accent.cyan, fontWeight: '700' }}>
            {typeof stats.volume === 'number' ? stats.volume.toFixed(1) : '0.0'} t
          </Text>
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { profile, loadProfile, updateProfile } = useUserStore();
  const { achievements, loadAchievements } = useAchievementStore();

  const [editing, setEditing] = useState(false);
  const [name, setName]     = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge]       = useState('');
  const [goal, setGoal]     = useState<FitnessGoal>('hypertrophy');
  const [expLevel, setExpLevel] = useState<ExperienceLevel>('beginner');
  const [saving, setSaving] = useState(false);

  const { updateInfo, checkForUpdate, downloadAndInstall, dismiss } = useUpdateCheck();

  useEffect(() => {
    loadProfile();
    loadAchievements();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setWeight(profile.bodyWeight ? String(profile.bodyWeight) : '');
      setHeight(profile.height ? String(profile.height) : '');
      setAge(profile.age ? String(profile.age) : '');
      setGoal(profile.goal);
      setExpLevel(profile.experienceLevel);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name: name.trim() || 'Atleta',
      bodyWeight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age) : undefined,
      goal,
      experienceLevel: expLevel,
    });
    setSaving(false);
    setEditing(false);
  };

  const unlockedCount  = achievements.filter((a) => a.unlocked).length;
  const totalCount     = achievements.length;
  const recentTrophies = achievements.filter((a) => a.unlocked).slice(0, 3);

  if (!profile) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: 18, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '900' }}>
            Perfil
          </Text>
          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: colors.bg.card,
              paddingHorizontal: 12, paddingVertical: 7,
              borderRadius: radius.full,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <Ionicons name={editing ? 'close' : 'pencil'} size={14} color={colors.brand[400]} />
            <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '700' }}>
              {editing ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Avatar + Nombre ── */}
        <GlassCard style={{ alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 90, height: 90, borderRadius: 45,
            backgroundColor: 'rgba(59,130,246,0.15)',
            borderWidth: 3, borderColor: colors.brand[500],
            alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.brand[400],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
          }}>
            <Text style={{ fontSize: 40 }}>🦾</Text>
          </View>
          {editing ? (
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              style={{ textAlign: 'center' }}
            />
          ) : (
            <Text style={{ color: colors.text.primary, fontSize: fontSize.xl, fontWeight: '900' }}>
              {profile.name}
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Badge label={GOAL_LABELS[profile.goal] ?? profile.goal} size="sm" color="gray" />
            {profile.bodyWeight && (
              <Badge label={`${profile.bodyWeight} kg`} size="sm" color="gray" />
            )}
            {profile.age && (
              <Badge label={`${profile.age} años`} size="sm" color="gray" />
            )}
          </View>
        </GlassCard>

        {/* ── Nivel XP ── */}
        <XPBar level={profile.level} xp={profile.xp} xpToNext={profile.xpToNextLevel} />

        {/* ── Stats RPG ── */}
        <GlassCard accent={colors.brand[400]}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '800', marginBottom: 16 }}>
            Estadísticas RPG
          </Text>
          <RPGStats stats={profile.stats} />
          <View style={{
            flexDirection: 'row', justifyContent: 'space-around',
            marginTop: 16, paddingTop: 16,
            borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
          }}>
            {[
              { label: 'Total XP', value: profile.totalXp.toLocaleString(), color: colors.brand[400] },
              { label: 'Racha', value: `${profile.currentStreak}🔥`, color: colors.accent.yellow },
              { label: 'Récord', value: `${profile.longestStreak}d`, color: colors.accent.orange },
            ].map((item) => (
              <View key={item.label} style={{ alignItems: 'center', gap: 2 }}>
                <Text style={{ color: colors.text.muted, fontSize: 10 }}>{item.label}</Text>
                <Text style={{ color: item.color, fontSize: fontSize.md, fontWeight: '800' }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* ── Logros preview ── */}
        <TouchableOpacity onPress={() => nav.navigate('Achievements')} activeOpacity={0.85}>
          <GlassCard accent={colors.accent.yellow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="trophy" size={20} color={colors.accent.yellow} />
                <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '800' }}>
                  Logros
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Badge
                  label={`${unlockedCount}/${totalCount}`}
                  color="yellow"
                  size="sm"
                />
                <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
              </View>
            </View>
            {recentTrophies.length > 0 ? (
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {recentTrophies.map((a) => (
                  <View key={a.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: 'rgba(245,158,11,0.1)',
                    borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 6,
                    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
                  }}>
                    <Ionicons name={a.iconName as any} size={14} color={colors.accent.yellow} />
                    <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs, fontWeight: '600' }}>
                      {a.title}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>
                Completa entrenamientos para desbloquear logros
              </Text>
            )}
          </GlassCard>
        </TouchableOpacity>

        {/* ── Totales de por vida ── */}
        <Card>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '800', marginBottom: 16 }}>
            De por vida
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {[
              { icon: '🏋️', label: 'Entrenos',    value: String(profile.totalWorkouts) },
              { icon: '⚖️', label: 'Volumen',     value: formatVolume(profile.totalVolume) },
              { icon: '⏱️', label: 'Tiempo',      value: formatDuration(profile.totalDuration) },
              { icon: '📊', label: 'Vol/sesión',  value: profile.totalWorkouts > 0
                ? formatVolume(profile.totalVolume / profile.totalWorkouts) : '—' },
            ].map((item) => (
              <View key={item.label} style={{ width: '45%', gap: 3 }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text style={{ color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '800' }}>
                  {item.value}
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ── Edición de datos personales ── */}
        {editing && (
          <Card>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '800', marginBottom: 14 }}>
              Datos personales
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Peso (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="75"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Altura (cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="175"
                />
              </View>
            </View>

            <Input
              label="Edad"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="25"
              style={{ marginTop: 10 }}
            />

            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '700', marginTop: 14, marginBottom: 8 }}>
              Objetivo
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GOAL_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => setGoal(o.value)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 7,
                    borderRadius: radius.full,
                    backgroundColor: goal === o.value ? colors.brand[600] : colors.bg.input,
                    borderWidth: 1,
                    borderColor: goal === o.value ? colors.brand[400] : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <Text style={{
                    color: goal === o.value ? '#fff' : colors.text.secondary,
                    fontSize: fontSize.sm, fontWeight: '600',
                  }}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '700', marginTop: 14, marginBottom: 8 }}>
              Nivel de experiencia
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {LEVEL_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => setExpLevel(o.value)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 7,
                    borderRadius: radius.full,
                    backgroundColor: expLevel === o.value ? colors.accent.purple : colors.bg.input,
                    borderWidth: 1,
                    borderColor: expLevel === o.value ? colors.accent.purple : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <Text style={{
                    color: expLevel === o.value ? '#fff' : colors.text.secondary,
                    fontSize: fontSize.sm, fontWeight: '600',
                  }}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label="Guardar cambios"
              fullWidth
              style={{ marginTop: 16 }}
              onPress={handleSave}
              loading={saving}
            />
          </Card>
        )}

        {/* ── Actualización de la app ── */}
        <GlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: 'rgba(6,182,212,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="cloud-outline" size={20} color={colors.accent.cyan} />
              </View>
              <View>
                <Text style={{ color: colors.text.primary, fontSize: fontSize.sm, fontWeight: '700' }}>
                  Versión de la app
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                  {updateInfo.status === 'checking' ? 'Verificando...' : `v${updateInfo.currentVersion}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={checkForUpdate}
              style={{
                backgroundColor: colors.bg.input,
                borderRadius: radius.md,
                paddingHorizontal: 12, paddingVertical: 8,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ color: colors.accent.cyan, fontSize: fontSize.xs, fontWeight: '700' }}>
                Verificar
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Modal de actualización */}
      <UpdateModal
        updateInfo={updateInfo}
        onUpdate={downloadAndInstall}
        onDismiss={dismiss}
      />
    </SafeAreaView>
  );
}
