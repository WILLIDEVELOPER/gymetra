import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  accent?: string;
}

export function GlassCard({ children, style, padding = spacing.lg, accent }: GlassCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(26, 32, 53, 0.85)',
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: accent ? `${accent}30` : 'rgba(255,255,255,0.07)',
          padding,
          // Sombra suave
          shadowColor: accent ?? '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: accent ? 0.18 : 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
        style,
      ]}
    >
      {/* Borde de acento superior si hay color */}
      {accent && (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 24, right: 24, height: 1.5,
            borderRadius: 1,
            backgroundColor: accent,
            opacity: 0.7,
          }}
        />
      )}
      {children}
    </View>
  );
}
