import { createAnimations } from '@tamagui/animations-reanimated';

/**
 * Animation configuration for Tamagui.
 * Provides consistent animation presets across the app.
 * 
 * @example
 * // In tamagui.config.ts
 * import { animationsRoot } from './animations';
 * 
 * const config = createTamagui({
 *   animations: animationsRoot,
 *   // ...
 * });
 * 
 * // In components
 * <View animation="quick" enterStyle={{ opacity: 0, scale: 0.9 }}>
 *   <Text>Animated content</Text>
 * </View>
 */

export const animationsRoot = createAnimations({
  // Timing-based animations
  '100ms': {
    type: 'timing',
    duration: 100,
  },
  '200ms': {
    type: 'timing',
    duration: 200,
  },
  '300ms': {
    type: 'timing',
    duration: 300,
  },
  '500ms': {
    type: 'timing',
    duration: 500,
  },

  // Spring animations
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 200,
  },
  slow: {
    type: 'spring',
    damping: 20,
    mass: 2,
    stiffness: 100,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 300,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    mass: 1.5,
    stiffness: 80,
  },
});

/**
 * Animation presets for common use cases.
 * Use these with the `animation` prop on Tamagui components.
 */
export const animationPresets = {
  /** Fast fade in/out */
  fadeIn: {
    animation: 'quick',
    enterStyle: { opacity: 0 },
    exitStyle: { opacity: 0 },
  },
  /** Scale up from small */
  scaleIn: {
    animation: 'quick',
    enterStyle: { opacity: 0, scale: 0.9 },
    exitStyle: { opacity: 0, scale: 0.9 },
  },
  /** Slide up from bottom */
  slideUp: {
    animation: 'medium',
    enterStyle: { opacity: 0, y: 20 },
    exitStyle: { opacity: 0, y: -20 },
  },
  /** Bouncy entrance */
  bouncy: {
    animation: 'bouncy',
    enterStyle: { opacity: 0, scale: 0.8 },
    exitStyle: { opacity: 0, scale: 0.8 },
  },
} as const;
