import { Button } from 'tamagui';
import { Sun, Moon } from '@tamagui/lucide-icons';
import { useTheme } from '~/tamagui/TamaguiRootProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      chromeless
      circular
      icon={isDark ? Sun : Moon}
      onPress={toggleTheme}
    />
  );
}
