import { XStack, Text } from 'tamagui';
import { Sun, Moon, Monitor } from '@tamagui/lucide-icons';
import { useTheme } from '~/tamagui/TamaguiRootProvider';
import { Button } from '~/interface/buttons/Button';

/**
 * Theme toggle component with system theme support.
 * Allows switching between light, dark, and system preference.
 */
export function ThemeToggle() {
  const { theme, toggleTheme, isSystemTheme, useSystemTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <XStack gap="$2" alignItems="center">
      {/* Manual theme toggle */}
      <Button
        variant={isSystemTheme ? 'ghost' : 'outlined'}
        size="small"
        icon={isDark ? Sun : Moon}
        onPress={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? 'Light' : 'Dark'}
      </Button>

      {/* System theme button */}
      <Button
        variant={isSystemTheme ? 'primary' : 'ghost'}
        size="small"
        icon={Monitor}
        onPress={useSystemTheme}
        aria-label="Use system theme"
      >
        System
      </Button>
    </XStack>
  );
}

/**
 * Simple theme toggle button (icon only).
 * For use in headers or compact spaces.
 */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="small"
      icon={isDark ? Sun : Moon}
      onPress={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    />
  );
}
