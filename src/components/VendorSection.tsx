import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../theme';
import { useLocation } from '../context/LocationContext';
import { getVendorsForItem, VendorResult } from '../services/vendorLookup';

interface VendorSectionProps {
  itemName: string;
}

export function VendorSection({ itemName }: VendorSectionProps) {
  const { currentSystem } = useLocation();

  const vendors = useMemo(
    () => getVendorsForItem(itemName, currentSystem),
    [itemName, currentSystem],
  );

  if (vendors.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>WHERE TO BUY</Text>
      <Text style={styles.subtitle}>
        Sorted by distance from {currentSystem}
      </Text>
      {vendors.map((v, i) => (
        <VendorRow key={`${v.npc}-${v.location}-${i}`} vendor={v} />
      ))}
    </View>
  );
}

function VendorRow({ vendor }: { vendor: VendorResult }) {
  const isCurrentSystem = vendor.distance === 0;
  const shopLabel = vendor.shop || vendor.npc;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.shopName}>{shopLabel}</Text>
        {vendor.shop ? (
          <Text style={styles.npc}>{vendor.npc}</Text>
        ) : null}
        <Text style={styles.locationLine}>
          {vendor.location} · {isCurrentSystem ? 'Current system' : `${vendor.system} — ${vendor.distance} ly`}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.qty}>×{vendor.qty}</Text>
        <View style={[styles.chanceBadge, chanceStyle(vendor.chance)]}>
          <Text style={styles.chanceText}>{vendor.chance}</Text>
        </View>
      </View>
    </View>
  );
}

function chanceStyle(chance: string) {
  switch (chance.toLowerCase()) {
    case 'high':
      return { backgroundColor: '#1a3a2a' };
    case 'medium':
      return { backgroundColor: '#3a3520' };
    default:
      return { backgroundColor: '#3a2020' };
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  shopName: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  npc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  locationLine: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  qty: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chanceText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
});
