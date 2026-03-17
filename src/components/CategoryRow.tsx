import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize } from '../theme';
import { CategoryDefinition } from '../data/types';

interface CategoryRowProps {
  category: CategoryDefinition;
  itemCount: number;
  onPress: () => void;
}

export function CategoryRow({ category, itemCount, onPress }: CategoryRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Ionicons
        name={category.icon as keyof typeof Ionicons.glyphMap}
        size={18}
        color={colors.primary}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={styles.label} numberOfLines={1}>
          {category.label}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {category.description}
        </Text>
      </View>
      <Text style={styles.count}>{itemCount}</Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceLight,
  },
  icon: {
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    minWidth: 30,
    textAlign: 'right',
  },
});
