import { Spinner as TamaguiSpinner, YStack, Paragraph } from 'tamagui';

interface SpinnerProps {
  label?: string;
  size?: 'small' | 'large';
}

export function Spinner({ label, size = 'large' }: SpinnerProps) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$3" backgroundColor="$background">
      <TamaguiSpinner size={size} color="$color" />
      {label && <Paragraph color="$gray10">{label}</Paragraph>}
    </YStack>
  );
}
