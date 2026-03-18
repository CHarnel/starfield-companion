import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onGearPress?: () => void;
}

export function ScreenHeader({ title, subtitle, onGearPress }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onGearPress && (
        <Pressable onPress={onGearPress} hitSlop={12} style={styles.gearButton}>
          <Ionicons name="settings-outline" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wider,
  },
  subtitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wider,
    marginTop: 2,
  },
  gearButton: {
    padding: spacing.xs,
  },
});
