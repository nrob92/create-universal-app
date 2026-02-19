import {
  Input as TamaguiInput,
  styled,
  type GetProps,
  View,
  Text,
  XStack,
} from 'tamagui';

/**
 * Enhanced Input component with validation states
 * 
 * Features:
 * - Default, error, and success states
 * - Focus-visible styling with outline
 * - Consistent height and sizing
 * - Optional helper text and error message display
 * 
 * Usage:
 * ```tsx
 * <Input placeholder="Email" />
 * <Input placeholder="Email" state="error" errorMessage="Invalid email" />
 * <Input placeholder="Email" state="success" />
 * ```
 */

export const Input = styled(TamaguiInput, {
  name: 'Input',
  height: 50,
  size: '$5',
  borderWidth: 1,
  borderColor: '$color6',
  backgroundColor: '$color1',
  borderRadius: '$4',
  placeholderTextColor: '$color9',
  paddingHorizontal: '$4',
  fontSize: 16,

  // Focus state
  focusVisibleStyle: {
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: '$blue9',
    outlineOffset: 2,
    borderWidth: 1,
    borderColor: '$blue8',
  },

  // Disabled state
  disabledStyle: {
    opacity: 0.5,
    backgroundColor: '$color3',
  },

  // Validation state variants
  variants: {
    state: {
      default: {
        borderColor: '$color6',
        backgroundColor: '$color1',
      },
      error: {
        borderColor: '$red9',
        backgroundColor: '$red2',
        focusVisibleStyle: {
          outlineColor: '$red9',
          borderColor: '$red10',
        },
      },
      success: {
        borderColor: '$green9',
        backgroundColor: '$green2',
        focusVisibleStyle: {
          outlineColor: '$green9',
          borderColor: '$green10',
        },
      },
    },
  } as const,

  defaultVariants: {
    state: 'default',
  },
});

export type InputProps = GetProps<typeof Input>;

/**
 * InputField component - Input with label and helper text support
 */
interface InputFieldProps extends InputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

export function InputField({
  label,
  helperText,
  errorMessage,
  required,
  state,
  ...props
}: InputFieldProps) {
  // Determine the actual state based on error message
  const actualState = errorMessage ? 'error' : state;

  return (
    <View gap="$2" width="100%">
      {label && (
        <XStack gap="$1" alignItems="center">
          <Text fontSize={14} fontWeight="500" color="$color12">
            {label}
          </Text>
          {required && (
            <Text fontSize={14} color="$red10">
              *
            </Text>
          )}
        </XStack>
      )}
      <Input state={actualState} {...props} />
      {errorMessage && (
        <Text fontSize={12} color="$red10">
          {errorMessage}
        </Text>
      )}
      {helperText && !errorMessage && (
        <Text fontSize={12} color="$color9">
          {helperText}
        </Text>
      )}
    </View>
  );
}

/**
 * PasswordInput component - Input with password visibility toggle
 */
import { useState } from 'react';
import { Pressable } from 'react-native';

interface PasswordInputProps extends InputFieldProps {
  showToggle?: boolean;
}

export function PasswordInput({
  showToggle = true,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!showToggle) {
    return <InputField secureTextEntry {...props} />;
  }

  return (
    <View gap="$2" width="100%">
      {props.label && (
        <XStack gap="$1" alignItems="center">
          <Text fontSize={14} fontWeight="500" color="$color12">
            {props.label}
          </Text>
          {props.required && (
            <Text fontSize={14} color="$red10">
              *
            </Text>
          )}
        </XStack>
      )}
      <XStack position="relative" alignItems="center">
        <Input
          state={props.errorMessage ? 'error' : props.state}
          {...props}
          secureTextEntry={!showPassword}
          width="100%"
          paddingRight="$12"
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 16,
            padding: 4,
          }}
        >
          <Text fontSize={14} color="$color10">
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </XStack>
      {props.errorMessage && (
        <Text fontSize={12} color="$red10">
          {props.errorMessage}
        </Text>
      )}
      {props.helperText && !props.errorMessage && (
        <Text fontSize={12} color="$color9">
          {props.helperText}
        </Text>
      )}
    </View>
  );
}