import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize } from '../theme';
import { humanizeKey } from '../utils/format';
import { GameImage } from './GameImage';
import type { ItemType } from '../data/imageRegistry';

interface ItemRowProps {
  item: Record<string, unknown>;
  nameField: string;
  listFields: string[];
  onPress: () => void;
  imageType?: ItemType | null;
}

export function ItemRow({ item, nameField, listFields, onPress, imageType }: ItemRowProps) {
  const name = String(item[nameField] ?? 'Unknown');

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {imageType && (
        <GameImage kind={imageType} name={name} size={44} style={styles.thumb} />
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.stats}>
          {listFields.map((field) => {
            const val = item[field];
            if (val == null || val === '') return null;
            const strVal = String(val);
            if (strVal.length > 40) return null;
            return (
              <View key={field} style={styles.stat}>
                <Text style={styles.statLabel}>{humanizeKey(field)}</Text>
                <Text style={styles.statValue} numberOfLines={1}>
                  {strVal}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  thumb: {
    marginRight: spacing.md,
    borderRadius: 4,
  },
  pressed: {
    backgroundColor: colors.surfaceLight,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginRight: 4,
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
