import { H1 as TamaguiH1, H2 as TamaguiH2, H3 as TamaguiH3, H4 as TamaguiH4, styled, Text } from 'tamagui';

/**
 * Heading components with consistent styling.
 * Use these instead of raw H1-H4 for consistent typography.
 * 
 * @example
 * import { H1, H2, H3, H4 } from '~/interface/text/Headings';
 * 
 * <H1>Main Title</H1>
 * <H2>Section Title</H2>
 * <H3>Subsection Title</H3>
 * <H4>Card Title</H4>
 */

export const H1 = styled(TamaguiH1, {
  fontWeight: '700',
  color: '$color12',
  fontFamily: '$heading',
});

export const H2 = styled(TamaguiH2, {
  fontWeight: '600',
  color: '$color12',
  fontFamily: '$heading',
});

export const H3 = styled(TamaguiH3, {
  fontWeight: '600',
  color: '$color11',
  fontFamily: '$heading',
});

export const H4 = styled(TamaguiH4, {
  fontWeight: '600',
  color: '$color11',
  fontFamily: '$heading',
});

/**
 * Subtitle component for secondary headings.
 */
export const Subtitle = styled(Text, {
  fontWeight: '500',
  color: '$color10',
  fontFamily: '$body',
  fontSize: '$4',
  opacity: 0.8,
});
