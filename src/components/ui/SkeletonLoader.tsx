import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';
import { radius } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: 'rgba(148,163,184,0.15)',
          opacity,
        },
        style,
      ]}
    />
  );
}

// Skeleton pre-armado para una tarjeta de stat
export function StatCardSkeleton() {
  return (
    <View style={{ flex: 1, padding: 14, gap: 8 }}>
      <Skeleton width={32} height={32} borderRadius={16} />
      <Skeleton width="60%" height={12} />
      <Skeleton width="40%" height={20} />
    </View>
  );
}

// Skeleton para lista de workouts
export function WorkoutItemSkeleton() {
  return (
    <View style={{ padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="40%" height={11} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton width={60} height={22} borderRadius={11} />
        <Skeleton width={60} height={22} borderRadius={11} />
        <Skeleton width={60} height={22} borderRadius={11} />
      </View>
    </View>
  );
}
