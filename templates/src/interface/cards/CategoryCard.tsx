import { Card, Text, YStack } from 'tamagui';
import type { NamedExoticComponent } from 'react';
import type { LucideProps } from '@tamagui/lucide-icons';

interface CategoryCardProps {
  icon: NamedExoticComponent<LucideProps>;
  label: string;
  backgroundColor: string;
  iconColor?: string;
  onPress?: () => void;
}

export function CategoryCard({
  icon: Icon,
  label,
  backgroundColor,
  iconColor = '$color',
  onPress,
}: CategoryCardProps) {
  return (
    <Card
      flex={1}
      bordered
      padding="$4"
      borderRadius="$5"
      backgroundColor={backgroundColor as any}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      onPress={onPress}
      animation="quick"
    >
      <YStack gap="$2" alignItems="flex-start">
        <Icon size={22} color={iconColor as any} />
        <Text fontWeight="600" fontSize="$3">
          {label}
        </Text>
      </YStack>
    </Card>
  );
}
