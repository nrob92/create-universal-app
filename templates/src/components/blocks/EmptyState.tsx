import { YStack, H2, Paragraph } from 'tamagui';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      gap="$3"
    >
      {icon}
      <H2 textAlign="center">{title}</H2>
      {description && (
        <Paragraph color="$gray10" textAlign="center">
          {description}
        </Paragraph>
      )}
      {action}
    </YStack>
  );
}
