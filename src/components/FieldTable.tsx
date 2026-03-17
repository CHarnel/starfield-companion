import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fonts, fontSize } from '../theme';
import { humanizeKey } from '../utils/format';

interface FieldTableProps {
  item: Record<string, unknown>;
  nameField: string;
}

export function FieldTable({ item, nameField }: FieldTableProps) {
  const entries = Object.entries(item).filter(
    ([key, value]) =>
      !key.startsWith('_') &&
      value != null &&
      value !== '' &&
      key !== nameField
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {String(item[nameField] ?? 'Unknown')}
      </Text>
      <View style={styles.divider} />
      {entries.map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{humanizeKey(key)}</Text>
          <Text style={styles.value} selectable>
            {formatValue(value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function formatObject(obj: Record<string, unknown>): string {
  if ('name' in obj) {
    const extra = Object.entries(obj)
      .filter(([k]) => k !== 'name')
      .map(([, v]) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : String(v)));
    return extra.length ? `${obj.name} (${extra.join(', ')})` : String(obj.name);
  }
  return Object.entries(obj)
    .map(([k, v]) => `${humanizeKey(k)}: ${v}`)
    .join(', ');
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        typeof v === 'object' && v !== null ? formatObject(v as Record<string, unknown>) : String(v)
      )
      .join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return formatObject(value as Record<string, unknown>);
  }
  return String(value);
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primary,
    opacity: 0.3,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 130,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
