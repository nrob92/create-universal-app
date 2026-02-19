import { YStack, styled, type GetProps, Text, View } from 'tamagui';

/**
 * Enhanced Button component with variants for consistent styling across the app.
 * Uses Tamagui's YStack as a base for maximum stability on native platforms.
 */
const StyledButton = styled(YStack, {
  name: 'Button',
  backgroundColor: '$background',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  borderWidth: 0,
  cursor: 'pointer',
  borderRadius: '$4',
  gap: '$2',

  // Press & Hover states
  pressStyle: {
    opacity: 0.8,
    scale: 0.98,
  },

  variants: {
    variant: {
      primary: {
        bg: '$color12',
        hoverStyle: { bg: '$color11', opacity: 0.9 },
        pressStyle: { bg: '$color10', opacity: 0.8 },
      },
      secondary: {
        bg: '$color3',
        hoverStyle: { bg: '$color4' },
        pressStyle: { bg: '$color2', opacity: 0.8 },
      },
      outlined: {
        bg: 'transparent',
        borderWidth: 2,
        borderColor: '$color6',
        hoverStyle: { borderColor: '$color8' },
        pressStyle: { borderColor: '$color4', opacity: 0.8 },
      },
      ghost: {
        bg: 'transparent',
        hoverStyle: { bg: '$color2' },
        pressStyle: { bg: '$color1', opacity: 0.8 },
      },
    },
    sized: {
      small: {
        py: '$2',
        px: '$3',
      },
      medium: {
        py: '$2.5',
        px: '$4',
      },
      large: {
        py: '$3',
        px: '$5',
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
        pressStyle: {
          scale: 1,
          opacity: 0.5,
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    sized: 'medium',
  },
});

export type ButtonProps = GetProps<typeof StyledButton> & {
  onPress?: () => void;
  icon?: React.ReactNode;
};

/**
 * Internal helper to ensure text inside Button is styled correctly
 */
function ButtonText({ children, variant, sized }: { children: any, variant?: string, sized?: string }) {
  if (typeof children !== 'string') return children;

  const color = variant === 'primary' ? '$background' : '$color12';
  const fontSize = sized === 'large' ? '$4' : sized === 'small' ? '$2' : '$3';
  
  return (
    <Text 
      color={color} 
      fontSize={fontSize} 
      fontWeight="600"
      textAlign="center"
      fontFamily="$body"
    >
      {children}
    </Text>
  );
}

/**
 * Main Button component that handles children styling and onPress
 */
export const Button = ({ children, onPress, variant, sized, icon, ...props }: ButtonProps) => {
  return (
    <StyledButton 
      onPress={onPress} 
      variant={variant} 
      sized={sized} 
      {...props}
    >
      {icon && <View>{icon}</View>}
      <ButtonText variant={variant} sized={sized}>{children}</ButtonText>
    </StyledButton>
  );
};

/**
 * Legacy PrimaryButton for backward compatibility.
 */
export function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <Button variant="primary" {...props}>
      {children}
    </Button>
  );
}
