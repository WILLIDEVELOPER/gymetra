import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { colors, radius } from '../../theme';

interface ProgressBarProps {
  value: number;      // 0-100
  color?: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({
  value, color = colors.brand[500], height = 6, animated = true,
}: ProgressBarProps) {
  const width = useRef(new Animated.Value(0)).current;
  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    if (animated) {
      Animated.timing(width, {
        toValue: clampedValue,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      width.setValue(clampedValue);
    }
  }, [clampedValue]);

  return (
    <View style={{
      height, backgroundColor: colors.bg.input,
      borderRadius: radius.full, overflow: 'hidden',
    }}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: color,
          width: width.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
}
