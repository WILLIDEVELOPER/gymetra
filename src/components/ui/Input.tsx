import React, { useState } from 'react';
import {
  TextInput, View, Text, type TextInputProps,
} from 'react-native';
import { colors, radius, fontSize } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: '500' }}>
          {label}
        </Text>
      )}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.bg.input,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: error ? colors.accent.red : focused ? colors.brand[500] : colors.border.default,
        paddingHorizontal: 12,
        height: 46,
      }}>
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <TextInput
          style={[{
            flex: 1, color: colors.text.primary,
            fontSize: fontSize.base, height: '100%',
          }, style as any]}
          placeholderTextColor={colors.text.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={{ color: colors.accent.red, fontSize: fontSize.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
}
