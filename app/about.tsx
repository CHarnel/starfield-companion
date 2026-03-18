import React from 'react';
import { View, Text, Pressable, ScrollView, Linking, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../src/theme';

const PRIVACY_URL = 'https://charnel.github.io/starfield-companion/privacy/';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

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
});
