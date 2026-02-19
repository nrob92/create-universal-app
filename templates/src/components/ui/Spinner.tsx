import { Spinner as TamaguiSpinner, YStack, Paragraph, useTheme } from 'tamagui';

interface SpinnerProps {
  label?: string;
  size?: 'small' | 'large';
}

export function Spinner({ label, size = 'large' }: SpinnerProps) {
  const theme = useTheme();
  const brandPrimary = theme.brandPrimary?.get() || '#FF7051';

  return (
    <YStack 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      gap="$3" 
      backgroundColor="$background"
    >
      <TamaguiSpinner size={size} color={brandPrimary} />
      {label && <Paragraph color="$gray10" fontWeight="600">{label}</Paragraph>}
    </YStack>
  );
}
