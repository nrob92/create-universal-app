import { useEffect } from 'react';
import { View, ViewProps } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
}

export function Skeleton({
  width,
  height,
  borderRadius = '$4',
  backgroundColor = '$gray5',
  ...props
}: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedView
      width={width as any}
      height={height as any}
      borderRadius={borderRadius as any}
      backgroundColor={backgroundColor}
      style={animatedStyle}
      {...props}
    />
  );
}


