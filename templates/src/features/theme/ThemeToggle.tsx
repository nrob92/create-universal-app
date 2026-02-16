import { Button, useThemeName } from 'tamagui';
import { Sun, Moon } from '@tamagui/lucide-icons';

interface ThemeToggleProps {
  onToggle: (theme: 'light' | 'dark') => void;
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark';

  return (
    <Button
      chromeless
      circular
      icon={isDark ? Sun : Moon}
      onPress={() => onToggle(isDark ? 'light' : 'dark')}
    />
  );
}
