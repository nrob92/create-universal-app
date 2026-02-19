import { createFont } from 'tamagui';

/**
 * Custom font configuration for Tamagui.
 * Provides consistent typography across the app.
 * 
 * @example
 * // In tamagui.config.ts
 * import { fonts } from './fonts';
 * 
 * const config = createTamagui({
 *   fonts,
 *   // ...
 * });
 * 
 * // In components
 * <Text fontFamily="$body" fontSize="$4">Body text</Text>
 * <H1 fontFamily="$heading">Heading</H1>
 */

// Heading font for titles and headers
const headingFont = createFont({
  family: 'Inter',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
    7: '700',
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: -0.5,
    6: -0.5,
    7: -1,
    8: -1,
    9: -1.5,
    10: -2,
  },
});

// Body font for regular text content
const bodyFont = createFont({
  family: 'Inter',
  size: {
    1: 11,
    2: 12,
    3: 14,
    4: 16,
    5: 18,
    6: 20,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
  },
});

// Monospace font for code and technical content
const monoFont = createFont({
  family: 'JetBrains Mono',
  size: {
    1: 10,
    2: 11,
    3: 12,
    4: 14,
    5: 16,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
  },
});

export const fonts = {
  heading: headingFont,
  body: bodyFont,
  mono: monoFont,
};
