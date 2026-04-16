import React from 'react';
import { View, Text, Pressable, ScrollView, Linking, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../src/theme';
import { useTipJar } from '../src/hooks/useTipJar';

const PRIVACY_URL = 'https://charnel.github.io/starfield-companion/privacy/';
const REPO_URL = 'https://github.com/charnel/starfield-companion';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const { products, purchase, loading, purchasingId, thankedId } = useTipJar();

  const smallProduct = products.find((p) => p.id === 'tip_small');
  const largeProduct = products.find((p) => p.id === 'tip_large');

  return (
    <>
      <Stack.Screen options={{ headerBackTitle: 'Back', title: 'About' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.appName}>STARFIELD</Text>
          <Text style={styles.appNameSub}>COMPANION</Text>
          <Text style={styles.version}>Version {version}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>DISCLAIMER</Text>
          </View>
          <Text style={styles.cardBody}>
            This is an unofficial fan-made companion app for Starfield. It is not affiliated
            with, endorsed by, or connected to Bethesda Game Studios, ZeniMax Media, or
            Microsoft Corporation.
          </Text>
          <Text style={styles.cardBody}>
            All game content and materials are trademarks and copyrights of their respective
            owners. This app is provided for informational purposes only.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="code-slash-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>OPEN SOURCE</Text>
          </View>
          <Text style={styles.cardBody}>
            This app is free and open source. Contributions, bug reports, and feature requests are
            welcome!
          </Text>
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart-outline" size={18} color={colors.amber} />
              <Text style={styles.cardTitle}>SUPPORT THE APP</Text>
            </View>
            <Text style={styles.cardBody}>
              This app is a labor of love — about $150 and a lot of coffee went into getting it
              into orbit. If it helps you navigate the Settled Systems, consider leaving a tip!
            </Text>
            {!loading && (
              <View style={styles.tipButtons}>
                <TipButton
                  label={smallProduct ? `Leave a Tip — ${smallProduct.localizedPrice}` : 'Leave a Tip'}
                  variant="outline"
                  busy={purchasingId === 'tip_small'}
                  thanked={thankedId === 'tip_small'}
                  disabled={!!purchasingId}
                  onPress={() => purchase('tip_small')}
                />
                <TipButton
                  label={largeProduct ? `Buy Me a Fancy Coffee — ${largeProduct.localizedPrice}` : 'Buy Me a Fancy Coffee'}
                  variant="filled"
                  busy={purchasingId === 'tip_large'}
                  thanked={thankedId === 'tip_large'}
                  disabled={!!purchasingId}
                  onPress={() => purchase('tip_large')}
                />
              </View>
            )}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => Linking.openURL(REPO_URL)}
        >
          <Ionicons name="logo-github" size={18} color={colors.primary} />
          <Text style={styles.rowLabel}>View on GitHub</Text>
          <Ionicons name="open-outline" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => Linking.openURL(PRIVACY_URL)}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Ionicons name="open-outline" size={16} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </>
  );
}

function TipButton({
  label,
  variant,
  busy,
  thanked,
  disabled,
  onPress,
}: {
  label: string;
  variant: 'outline' | 'filled';
  busy: boolean;
  thanked: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const isFilled = variant === 'filled';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tipButton,
        isFilled ? styles.tipButtonFilled : styles.tipButtonOutline,
        pressed && !disabled && (isFilled ? styles.tipButtonFilledPressed : styles.tipButtonOutlinePressed),
        disabled && !busy && styles.tipButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {busy ? (
        <ActivityIndicator size="small" color={isFilled ? colors.background : colors.amber} />
      ) : (
        <Text
          style={[
            styles.tipButtonText,
            isFilled && styles.tipButtonFilledText,
          ]}
        >
          {thanked ? 'Thank you!' : label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  appName: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wider,
  },
  appNameSub: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wider,
    marginTop: 2,
  },
  version: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wider,
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  tipButtons: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 2,
    minHeight: 44,
  },
  tipButtonOutline: {
    borderWidth: 1,
    borderColor: colors.amber,
    backgroundColor: 'transparent',
  },
  tipButtonOutlinePressed: {
    backgroundColor: 'rgba(212, 165, 74, 0.1)',
  },
  tipButtonFilled: {
    backgroundColor: colors.amber,
  },
  tipButtonFilledPressed: {
    backgroundColor: colors.amberMuted,
  },
  tipButtonDisabled: {
    opacity: 0.5,
  },
  tipButtonText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.amber,
    letterSpacing: letterSpacing.wide,
  },
  tipButtonFilledText: {
    color: colors.background,
  },
});
