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
    }
  }
});

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
