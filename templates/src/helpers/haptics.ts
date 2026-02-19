import { isWeb } from 'tamagui';

// Lazy load haptics to prevent web bundling errors
let Haptics: any = null;
if (!isWeb) {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    // Silently fail if module is not available
  }
}

/**
 * Safe haptics wrapper that works on both mobile and web.
 * Includes defensive checks and error catching for environments where
 * the native module might be present in JS but not in the native runtime.
 */
export const haptics = {
  /** Light tap for small actions */
  light: async () => {
    if (!isWeb && Haptics?.impactAsync) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Native module not available or failed
      }
    }
  },
  /** Medium tap for standard actions */
  medium: async () => {
    if (!isWeb && Haptics?.impactAsync) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Native module not available or failed
      }
    }
  },
  /** Heavy tap for major actions */
  heavy: async () => {
    if (!isWeb && Haptics?.impactAsync) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {
        // Native module not available or failed
      }
    }
  },
  /** Selection tap for list scrolling or picker changes */
  selection: async () => {
    if (!isWeb && Haptics?.selectionAsync) {
      try {
        await Haptics.selectionAsync();
      } catch (e) {
        // Native module not available or failed
      }
    }
  },
  /** Success notification tap */
  success: async () => {
    if (!isWeb && Haptics?.notificationAsync) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Native module not available or failed
      }
    }
  },
  /** Error notification tap */
  error: async () => {
    if (!isWeb && Haptics?.notificationAsync) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        // Native module not available or failed
      }
    }
  },
};
