import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';
import { spacing, fontSize, letterSpacing } from './spacing';

export { colors } from './colors';
export { spacing, fontSize, letterSpacing } from './spacing';

export const fonts = {
  heading: 'Exo2_600SemiBold',
  headingBold: 'Exo2_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    fontFamily: 'Exo2_700Bold',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
