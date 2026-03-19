import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing, rarityColor } from '../../src/theme';
import { WireframePlanet } from '../../src/components/WireframePlanet';
import {
  getPlanetByName,
  resolveResourceMeta,
  PlanetData,
  ResourceMeta,
} from '../../src/services/planetLookup';
import { isFlora } from '../../src/data/floraNames';

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const PROPERTY_ROWS: { key: keyof PlanetData; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'gravity', label: 'Gravity' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'atmosphere', label: 'Atmosphere' },
  { key: 'magnetosphere', label: 'Magnetosphere' },
  { key: 'water', label: 'Water' },
  { key: 'planet_length', label: 'Day Length' },
  { key: 'hab_rank', label: 'Habitability' },
];

const HAB_LABELS: Record<number, string> = {
  0: 'Uninhabitable',
  1: 'Low',
  2: 'Moderate',
  3: 'High',
};

function formatValue(key: string, value: unknown): string {
  if (key === 'gravity' && typeof value === 'number') return `${value.toFixed(2)}g`;
  if (key === 'planet_length' && typeof value === 'number') return `${value}h`;
  if (key === 'hab_rank' && typeof value === 'number') return HAB_LABELS[value] ?? String(value);
  if (typeof value === 'string') return humanize(value);
  return String(value ?? '—');
}

export default function PlanetDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const planetName = decodeURIComponent(name);
  const planet = useMemo(() => getPlanetByName(planetName), [planetName]);

  const inorganic = useMemo(() => {
    if (!planet) return [];
    return planet.resources
      .map((code) => {
        const meta = resolveResourceMeta(code);
        if (meta && meta.type !== 'inorganic') return null;
        return { code, meta };
      })
      .filter(Boolean) as { code: string; meta: ResourceMeta | null }[];
  }, [planet]);

  const organic = useMemo(() => {
    if (!planet) return [];
    return planet.resources
      .map((code) => {
        const meta = resolveResourceMeta(code);
        if (!meta || meta.type !== 'organic') return null;
        return { code, meta };
      })
      .filter(Boolean) as { code: string; meta: ResourceMeta }[];
  }, [planet]);

  const allOrganisms = useMemo(() => {
    if (!planet) return [];
    return [
      ...planet.gatherable.map((g) => ({ ...g, domesticable: false })),
      ...planet.domesticable.map((d) => ({ ...d, domesticable: true })),
    ];
  }, [planet]);

  if (!planet) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: planetName }} />
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Planet not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: planet.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: fonts.headingBold, fontSize: fontSize.lg },
          headerShadowVisible: false,
        }}
      />

      {/* Planet header */}
      <View style={styles.header}>
        <Text style={styles.planetName}>{planet.name}</Text>
        <View style={styles.systemRow}>
          <Ionicons name="star-outline" size={12} color={colors.amber} />
          <Text style={styles.systemName}>{planet.system}</Text>
        </View>
      </View>

      {/* Wireframe */}
      <WireframePlanet size={200} />

      {/* Properties */}
      <SectionTitle icon="analytics-outline" title="PROPERTIES" />
      <View style={styles.card}>
        {PROPERTY_ROWS.map(({ key, label }) => (
          <View key={key} style={styles.propRow}>
            <Text style={styles.propLabel}>{label}</Text>
            <Text style={styles.propValue}>{formatValue(key, planet[key])}</Text>
          </View>
        ))}
      </View>

      {/* Biomes */}
      {planet.biomes.length > 0 && (
        <>
          <SectionTitle icon="layers-outline" title="BIOMES" />
          <View style={styles.card}>
            {planet.biomes.map((b) => (
              <View key={b.name} style={styles.biomeRow}>
                <Text style={styles.biomeName}>{b.name}</Text>
                <View style={styles.biomeBarTrack}>
                  <View
                    style={[styles.biomeBarFill, { width: `${Math.round(b.coverage * 100)}%` }]}
                  />
                </View>
                <Text style={styles.biomePercent}>
                  {Math.round(b.coverage * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Inorganic resources */}
      {inorganic.length > 0 && (
        <>
          <SectionTitle icon="diamond-outline" title="INORGANIC RESOURCES" />
          <View style={styles.card}>
            {inorganic.map(({ code, meta }) => {
              const rColor = rarityColor(meta?.rarity);
              return (
                <View key={code} style={styles.resourceRow}>
                  <Text numberOfLines={1} style={[styles.resourceSymbol, { color: rColor }]}>
                    {code}
                  </Text>
                  <Text numberOfLines={1} style={[styles.resourceName, { color: rColor }]}>
                    {meta?.fullName ?? code}
                  </Text>
                  {meta?.rarity && (
                    <View style={[styles.rarityBadge, { backgroundColor: rColor + '20' }]}>
                      <Text style={[styles.rarityText, { color: rColor }]}>
                        {meta.rarity}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Organic resources */}
      {organic.length > 0 && (
        <>
          <SectionTitle icon="leaf-outline" title="ORGANIC RESOURCES" />
          <View style={styles.card}>
            {organic.map(({ code, meta }) => {
              const rColor = rarityColor(meta.rarity);
              return (
                <View key={code} style={styles.resourceRow}>
                  <Text style={[styles.resourceName, { color: rColor, flex: 1 }]}>
                    {meta.fullName}
                  </Text>
                  {meta.rarity && (
                    <View style={[styles.rarityBadge, { backgroundColor: rColor + '20' }]}>
                      <Text style={[styles.rarityText, { color: rColor }]}>
                        {meta.rarity}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Fauna */}
      {planet.fauna > 0 && (
        <>
          <SectionTitle icon="paw-outline" title={`FAUNA  (${planet.fauna})`} />
          <View style={styles.card}>
            {allOrganisms
              .filter((o) => !isFlora(o.name))
              .map((o) => (
                <View key={o.name} style={styles.orgRow}>
                  <Ionicons
                    name={o.domesticable ? 'heart-outline' : 'bug-outline'}
                    size={12}
                    color={o.domesticable ? colors.amber : colors.textMuted}
                  />
                  <Text style={styles.orgName} numberOfLines={1}>{o.name}</Text>
                  <Text style={styles.orgResource}>{o.resource}</Text>
                </View>
              ))}
          </View>
        </>
      )}

      {/* Flora */}
      {planet.flora > 0 && (
        <>
          <SectionTitle icon="leaf-outline" title={`FLORA  (${planet.flora})`} />
          <View style={styles.card}>
            {allOrganisms
              .filter((o) => isFlora(o.name))
              .map((o) => (
                <View key={o.name} style={styles.orgRow}>
                  <Ionicons
                    name={o.domesticable ? 'heart-outline' : 'leaf-outline'}
                    size={12}
                    color={o.domesticable ? colors.amber : colors.textMuted}
                  />
                  <Text style={styles.orgName} numberOfLines={1}>{o.name}</Text>
                  <Text style={styles.orgResource}>{o.resource}</Text>
                </View>
              ))}
          </View>
        </>
      )}

      {/* Traits */}
      {planet.traits.length > 0 && (
        <>
          <SectionTitle icon="flag-outline" title="TRAITS" />
          <View style={styles.card}>
            {planet.traits.map((t) => (
              <View key={t} style={styles.traitRow}>
                <Ionicons name="ellipse" size={6} color={colors.amber} />
                <Text style={styles.traitText}>{t}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={14} color={colors.textMuted} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  planetName: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wide,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  systemName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  propRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  propLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
    width: 130,
  },
  propValue: {
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },

  biomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  biomeName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 120,
  },
  biomeBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  biomeBarFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  biomePercent: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    width: 32,
    textAlign: 'right',
  },

  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  resourceSymbol: {
    fontFamily: fonts.mono,
    fontSize: fontSize.md,
    minWidth: 58,
  },
  resourceName: {
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 2,
  },
  rarityText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
  },

  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  orgName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  orgResource: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  traitText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
