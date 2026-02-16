import { Button, type ButtonProps } from 'tamagui';

export function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      theme="active"
      fontWeight="600"
      borderRadius="$4"
      {...props}
    >
      {children}
    </Button>
  );
}
