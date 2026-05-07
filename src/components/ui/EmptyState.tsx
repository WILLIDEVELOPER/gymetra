import React from 'react';
import { View, Text } from 'react-native';
import { colors, fontSize } from '../../theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={{
      flex: 1, alignItems: 'center', justifyContent: 'center',
      padding: 32, gap: 12,
    }}>
      {icon && (
        <View style={{ opacity: 0.4, marginBottom: 8 }}>
          {icon}
        </View>
      )}
      <Text style={{
        color: colors.text.primary, fontSize: fontSize.lg,
        fontWeight: '600', textAlign: 'center',
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          color: colors.text.secondary, fontSize: fontSize.sm,
          textAlign: 'center', lineHeight: 20,
        }}>
          {subtitle}
        </Text>
      )}
      {action && <View style={{ marginTop: 8 }}>{action}</View>}
    </View>
  );
}
