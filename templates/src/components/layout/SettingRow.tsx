import { XStack, YStack, Paragraph, Text } from 'tamagui';
import { ChevronRight } from '@tamagui/lucide-icons';
import type { NamedExoticComponent } from 'react';
import type { IconProps } from '@tamagui/lucide-icons';

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}

export function SettingRow({
  icon: Icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  rightElement,
}: SettingRowProps) {
  const labelColor = destructive ? '$red10' : '$color';
  const iconColor = destructive ? '$red10' : '$gray10';

  return (
    <XStack
      paddingVertical="$3"
      paddingHorizontal="$4"
      gap="$3"
      alignItems="center"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
      cursor={onPress ? 'pointer' : undefined}
    >
      <YStack
        width={34}
        height={34}
        borderRadius="$3"
        backgroundColor={destructive ? '$red3' : '$backgroundStrong'}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon size={16} color={iconColor as any} />
      </YStack>

      <Paragraph flex={1} color={labelColor as any} fontWeight="500">
        {label}
      </Paragraph>

      {rightElement ?? (
        <>
          {value && (
            <Text color="$gray10" fontSize="$3">
              {value}
            </Text>
          )}
          {showChevron && onPress && (
            <ChevronRight size={16} color="$gray8" />
          )}
        </>
      )}
    </XStack>
  );
}
