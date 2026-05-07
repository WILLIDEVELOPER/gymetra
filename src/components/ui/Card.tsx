import React from 'react';
import { View, type ViewProps } from 'react-native';
import { colors, radius, shadows } from '../../theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = { none: 0, sm: 12, md: 16, lg: 20 };

export function Card({ children, style, variant = 'default', padding = 'md', ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.bg.card,
          borderRadius: radius.lg,
          padding: paddingMap[padding],
          ...(variant === 'elevated' ? shadows.md : {}),
          ...(variant === 'outlined' ? {
            borderWidth: 1,
            borderColor: colors.border.default,
          } : {}),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
