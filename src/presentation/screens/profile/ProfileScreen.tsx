import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useUserStore } from '../../../store';
import { Card, XPBar, ProgressBar, Badge, Input, Button } from '../../../components/ui';
import { colors, fontSize, spacing, radius } from '../../../theme';
import { formatDuration, formatVolume } from '../../../utils/formatters';
import type { UserProfile, FitnessGoal, ExperienceLevel } from '../../../domain/models';

const STATS_CONFIG = [
  { key: 'strength',    label: 'Fuerza',       icon: '💪', color: colors.brand[400] },
  { key: 'discipline',  label: 'Disciplina',   icon: '🧠', color: colors.accent.purple },
  { key: 'consistency', label: 'Consistencia', icon: '🔥', color: colors.accent.orange },
] as const;

const GOAL_OPTIONS: { label: string; value: FitnessGoal }[] = [
  { label: 'Fuerza',      value: 'strength' },
  { label: 'Hipertrofia', value: 'hypertrophy' },
  { label: 'Resistencia', value: 'endurance' },
  { label: 'Perder peso', value: 'weight_loss' },
  { label: 'General',     value: 'general' },
];

function StatRadar({ stats }: { stats: UserProfile['stats'] }) {
  return (
    <View style={{ gap: 10 }}>
      {STATS_CONFIG.map((s) => (
        <View key={s.key} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14 }}>{s.icon}</Text>
              <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '500' }}>
                {s.label}
              </Text>
            </View>
            <Text style={{ color: s.color, fontSize: fontSize.sm, fontWeight: '700' }}>
              {stats[s.key]}
            </Text>
          </View>
          <ProgressBar value={stats[s.key]} color={s.color} height={6} />
        </View>
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const { profile, loadProfile, updateProfile } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setWeight(profile.bodyWeight ? String(profile.bodyWeight) : '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name: name.trim() || 'Atleta',
      bodyWeight: weight ? parseFloat(weight) : undefined,
    });
    setSaving(false);
    setEditing(false);
  };

  if (!profile) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '800' }}>
            Perfil
          </Text>
          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              backgroundColor: colors.bg.card, paddingHorizontal: 12,
              paddingVertical: 7, borderRadius: radius.full,
            }}
          >
            <Ionicons name={editing ? 'close' : 'pencil'} size={14} color={colors.brand[400]} />
            <Text style={{ color: colors.brand[400], fontSize: fontSize.sm, fontWeight: '600' }}>
              {editing ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Nombre */}
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.brand[800],
            borderWidth: 3, borderColor: colors.brand[500],
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 36 }}>🦾</Text>
          </View>
          {editing ? (
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              style={{ textAlign: 'center' }}
            />
          ) : (
            <Text style={{ color: colors.text.primary, fontSize: fontSize.xl, fontWeight: '800' }}>
              {profile.name}
            </Text>
          )}
        </View>

        {/* XP / Nivel */}
        <XPBar level={profile.level} xp={profile.xp} xpToNext={profile.xpToNextLevel} />

        {/* Stats RPG */}
        <Card>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 14 }}>
            Estadísticas
          </Text>
          <StatRadar stats={profile.stats} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border.default }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.text.muted, fontSize: 10 }}>Total XP</Text>
              <Text style={{ color: colors.brand[400], fontSize: fontSize.md, fontWeight: '700' }}>
                {profile.totalXp.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.text.muted, fontSize: 10 }}>Racha actual</Text>
              <Text style={{ color: colors.accent.yellow, fontSize: fontSize.md, fontWeight: '700' }}>
                {profile.currentStreak}🔥
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.text.muted, fontSize: 10 }}>Racha máxima</Text>
              <Text style={{ color: colors.accent.orange, fontSize: fontSize.md, fontWeight: '700' }}>
                {profile.longestStreak}d
              </Text>
            </View>
          </View>
        </Card>

        {/* Totales */}
        <Card>
          <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 14 }}>
            De por vida
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {[
              { icon: '🏋️', label: 'Entrenos',   value: String(profile.totalWorkouts) },
              { icon: '⚖️', label: 'Volumen',    value: formatVolume(profile.totalVolume) },
              { icon: '⏱️', label: 'Tiempo',     value: formatDuration(profile.totalDuration) },
              { icon: '📊', label: 'Vol/sesión', value: profile.totalWorkouts > 0
                ? formatVolume(profile.totalVolume / profile.totalWorkouts) : '—' },
            ].map((item) => (
              <View key={item.label} style={{ width: '45%', gap: 4 }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text style={{ color: colors.text.primary, fontSize: fontSize.lg, fontWeight: '700' }}>
                  {item.value}
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Datos personales editables */}
        {editing && (
          <Card>
            <Text style={{ color: colors.text.primary, fontSize: fontSize.md, fontWeight: '700', marginBottom: 14 }}>
              Datos personales
            </Text>
            <Input
              label="Peso corporal (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="ej. 75"
            />
            <Button
              label="Guardar cambios"
              fullWidth
              style={{ marginTop: 14 }}
              onPress={handleSave}
              loading={saving}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
