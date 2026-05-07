import React from 'react';
import { View, Text } from 'react-native';
import { Card } from './Card';
import { colors, fontSize } from '../../theme';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: string;
}

export function StatCard({ label, value, subtitle, icon, accent }: StatCardProps) {
  return (
    <Card style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs, marginBottom: 4 }}>
            {label}
          </Text>
          <Text style={{ color: accent ?? colors.text.primary, fontSize: fontSize['2xl'], fontWeight: '700' }}>
            {value}
          </Text>
          {subtitle && (
            <Text style={{ color: colors.text.muted, fontSize: fontSize.xs, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
        {icon && (
          <View style={{
            backgroundColor: accent ? `${accent}20` : 'rgba(59,130,246,0.15)',
            borderRadius: 10,
            padding: 8,
          }}>
            {icon}
          </View>
        )}
      </View>
    </Card>
  );
}
