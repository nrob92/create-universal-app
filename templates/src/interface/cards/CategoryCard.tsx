import { Card, Text, YStack, View } from 'tamagui';
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
      padding="$5"
      borderRadius="$8"
      backgroundColor="$backgroundStrong"
      borderWidth={2}
      borderColor="$borderColor"
      pressStyle={{ scale: 0.96 }}
      hoverStyle={{ borderColor: '$brandPrimary' }}
      onPress={onPress}
      animation="quick"
      shadowColor="$shadowColor"
      shadowRadius={10}
      shadowOpacity={0.1}
    >
      <YStack gap="$3" alignItems="center" justifyContent="center">
        <View 
          backgroundColor={backgroundColor as any} 
          p="$3" 
          borderRadius="$6"
          shadowColor={iconColor as any}
          shadowRadius={10}
          shadowOpacity={0.2}
        >
          <Icon size={24} color={iconColor as any} />
        </View>
        <Text fontWeight="800" fontSize={14} color="$color" textTransform="uppercase" letterSpacing={1}>
          {label}
        </Text>
      </YStack>
    </Card>
  );
}
