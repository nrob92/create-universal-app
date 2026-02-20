import { config } from '@tamagui/config';
import { createTamagui, createTokens } from 'tamagui';
import { animationsRoot } from './animations';

// Sushi-inspired color palette
const sushiColors = {
  salmon: '#FF7051',    // Primary action
  salmonLight: '#FF8A75',
  salmonDark: '#E65A40',
  nori: '#121212',      // Deep background
  noriLight: '#1E1E1E', // Card background
  rice: '#FAFAFA',      // Text / Primary light
  wasabi: '#95D5B2',    // Success / Accent green
  ginger: '#F4A261',    // Accent orange/peach
  tuna: '#D62828',      // Error / Dark red
};

const tokens = createTokens({
  ...config.tokens,
  color: {
    ...config.tokens.color,
    brandPrimary: sushiColors.salmon,
    brandSecondary: sushiColors.wasabi,
    brandAccent: sushiColors.ginger,
    brandPrimaryLight: sushiColors.salmonLight,
    brandPrimaryDark: sushiColors.salmonDark,
    brandTuna: sushiColors.tuna,
  },
});

const tamaguiConfig = createTamagui({
  ...config,
  tokens,
  animations: animationsRoot,
  themes: {
    ...config.themes,
    dark: {
      ...config.themes.dark,
      brandPrimary: sushiColors.salmon,
      brandSecondary: sushiColors.wasabi,
      brandAccent: sushiColors.ginger,
      brandTuna: sushiColors.tuna,
      background: sushiColors.nori,
      backgroundStrong: sushiColors.noriLight,
      color: sushiColors.rice,
      primary: sushiColors.salmon,
      borderColor: '#2A2A2A',
    },
    light: {
      ...config.themes.light,
      brandPrimary: sushiColors.salmon,
      brandSecondary: sushiColors.wasabi,
      brandAccent: sushiColors.ginger,
      brandTuna: sushiColors.tuna,
      background: sushiColors.rice,
      backgroundStrong: '#f5f5f5',
      color: sushiColors.nori,
      primary: sushiColors.salmon,
      borderColor: '#e0e0e0',
    },
    ocean: {
      ...config.themes.dark,
      brandPrimary: '#0ea5e9', // Light Blue (Primary)
      brandSecondary: '#f97316', // Orange (Complementary to blue)
      brandAccent: '#3b82f6', // Rich Blue
      brandTuna: '#ef4444',
      background: '#0f172a', // Deep slate
      backgroundStrong: '#1e293b',
      color: '#f8fafc',
      primary: '#0ea5e9',
      borderColor: '#334155',
    },
    forest: {
      ...config.themes.dark,
      brandPrimary: '#10b981', // Emerald (Primary)
      brandSecondary: '#f43f5e', // Rose/Red (Complementary to green)
      brandAccent: '#059669', // Dark Emerald
      brandTuna: '#ef4444',
      background: '#064e3b', // Deep green
      backgroundStrong: '#065f46',
      color: '#ecfdf5',
      primary: '#10b981',
      borderColor: '#047857',
    },
    midnight: {
      ...config.themes.dark,
      brandPrimary: '#8b5cf6', // Violet (Primary)
      brandSecondary: '#eab308', // Yellow/Gold (Complementary to violet)
      brandAccent: '#7c3aed', // Deep Violet
      brandTuna: '#ef4444',
      background: '#2e1065', // Very deep purple
      backgroundStrong: '#4c1d95',
      color: '#f5f3ff',
      primary: '#8b5cf6',
      borderColor: '#5b21b6',
    },
    sunrise: {
      ...config.themes.light,
      brandPrimary: '#ea580c', // Dark Orange (Primary)
      brandSecondary: '#0284c7', // Sky Blue (Complementary to orange)
      brandAccent: '#c2410c', // Deep Orange
      brandTuna: '#ef4444',
      background: '#fff7ed', // Very light orange/white
      backgroundStrong: '#ffedd5',
      color: '#431407', // Very dark brown/black for contrast
      primary: '#ea580c',
      borderColor: '#fed7aa',
    }
  }
});

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
