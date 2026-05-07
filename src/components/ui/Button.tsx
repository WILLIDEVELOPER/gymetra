import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, View,
  type TouchableOpacityProps,
} from 'react-native';
import { colors, radius, fontSize } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  label: string;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: colors.brand[600], text: '#fff' },
  secondary: { bg: colors.bg.cardAlt, text: colors.text.primary, border: colors.border.default },
  ghost:     { bg: 'transparent', text: colors.brand[400] },
  danger:    { bg: '#7F1D1D', text: '#FCA5A5' },
};

const sizeStyles: Record<Size, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: 12, fontSize: fontSize.sm },
  md: { height: 46, px: 18, fontSize: fontSize.base },
  lg: { height: 54, px: 24, fontSize: fontSize.lg },
};

export function Button({
  variant = 'primary', size = 'md', loading = false,
  icon, label, fullWidth = false, disabled, style, ...props
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        {
          height: ss.height,
          paddingHorizontal: ss.px,
          borderRadius: radius.md,
          backgroundColor: vs.bg,
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style as any,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text style={{ color: vs.text, fontSize: ss.fontSize, fontWeight: '600' }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
