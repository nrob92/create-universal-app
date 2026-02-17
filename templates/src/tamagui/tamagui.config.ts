import { config } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

const tamaguiConfig = createTamagui(config);

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
