import { YStack } from 'tamagui';

import type { ReactNode } from 'react';

export interface KeyboardStickyFooterProps {
  children: ReactNode;
  offset?: number;
  openedOffset?: number;
}

// Web version - just a bit of padding
export const KeyboardStickyFooter = ({ children, offset }: KeyboardStickyFooterProps) => {
  return (
    <YStack maw={500} self="center" pt="$8" pb="$4" style={{ paddingBottom: offset }}>
      {children}
    </YStack>
  );
};
