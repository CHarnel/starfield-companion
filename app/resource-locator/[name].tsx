import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import {
  findResource,
  getLocatableResources,
  getAllSystemNames,
  SystemResult,
  PlanetSource,
} from '../../src/services/resourceLocator';
import resources from '../../src/data/json/resources.json';
import materials from '../../src/data/json/Materials.json';

interface ResourceDef {
  resource?: string;
  shortName?: string;
  name?: string;
  symbol?: string;
  type?: string;
  rarity?: string;
}

const DEFAULT_ORIGIN = 'Sol';

function resolveResource(
  searchName: string,
): { shortName: string; fullName: string; type?: string; rarity?: string } | null {
  const q = searchName.toLowerCase();
  const allResources = resources as ResourceDef[];
  const allMaterials = materials as ResourceDef[];

  for (const r of allResources) {
    if (
      r.resource?.toLowerCase() === q ||
      r.shortName?.toLowerCase() === q
    ) {
      return {
        shortName: r.shortName || r.resource || searchName,
        fullName: r.resource || searchName,
        type: r.type,
        rarity: r.rarity,
      };
    }
  }

  for (const m of allMaterials) {
    if (
      m.name?.toLowerCase() === q ||
      m.symbol?.toLowerCase() === q
    ) {
      return {
        shortName: m.symbol || m.name || searchName,
        fullName: m.name || searchName,
        rarity: m.rarity,
      };
    }
  }

  return null;
}

export default function ResourceLocatorScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const searchName = decodeURIComponent(name);

  const resolved = useMemo(() => resolveResource(searchName), [searchName]);
  const results = useMemo(() => {
    if (!resolved) return [];
    return findResource(resolved.shortName, DEFAULT_ORIGIN);
  }, [resolved]);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: searchName,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: fonts.headingBold,
            fontSize: fontSize.lg,
          },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.resourceInfo}>
          <Ionicons name="diamond-outline" size={20} color={colors.primary} />
          <View style={styles.resourceText}>
            <Text style={styles.resourceName}>{resolved?.fullName ?? searchName}</Text>
            {resolved?.shortName && resolved.shortName !== resolved.fullName && (
              <Text style={styles.resourceShort}>{resolved.shortName}</Text>
            )}
          </View>
          {resolved?.rarity && (
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>{resolved.rarity}</Text>
            </View>
          )}
          {resolved?.type && (
            <View
              style={[
                styles.typeBadge,
                resolved.type === 'organic'
                  ? styles.typeBadgeOrganic
                  : styles.typeBadgeInorganic,
              ]}
            >
              <Text style={styles.typeBadgeText}>{resolved.type}</Text>
            </View>
          )}
        </View>
      </View>

      {!resolved ? (
        <View style={styles.empty}>
          <Ionicons
            name="help-circle-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>
            "{searchName}" is not a locatable resource
          </Text>
          <Text style={styles.emptyHint}>
            Manufactured components and consumables cannot be found on planets
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>No planets found with this resource</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {results.length} system{results.length !== 1 ? 's' : ''} found
            {' · sorted by distance from Sol'}
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.system}
            renderItem={({ item }) => <SystemCard result={item} />}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

function SystemCard({ result }: { result: SystemResult }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Ionicons name="star-outline" size={14} color={colors.primary} />
        <Text style={styles.resultSystem} numberOfLines={1}>
          {result.system}
        </Text>
        <Text style={styles.resultDistance}>
          {result.distance === 0 ? 'Origin' : `${result.distance} ly`}
        </Text>
      </View>
      {result.planets.map((p) => (
        <PlanetRow key={p.planet} planet={p} />
      ))}
    </View>
  );
}

function PlanetRow({ planet }: { planet: PlanetSource }) {
  const router = useRouter();
  const organicSources = planet.sources.filter((s) => s.type !== 'mineral');
  return (
    <Pressable
      style={styles.planetRow}
      onPress={() =>
        router.push(`/planet/${encodeURIComponent(planet.planet)}` as any)
      }
    >
      <Ionicons
        name="globe-outline"
        size={12}
        color={colors.textMuted}
        style={styles.planetIcon}
      />
      <Text style={styles.planetName} numberOfLines={1}>
        {planet.planet}
      </Text>
      {organicSources.length > 0 && (
        <Text style={styles.sourceTag} numberOfLines={1}>
          {organicSources
            .map((s) => (s.name ? `${s.name} (${s.type})` : s.type))
            .join(', ')}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resourceText: {
    flex: 1,
  },
  resourceName: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  resourceShort: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: '#2a2520',
  },
  rarityText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.amber,
    textTransform: 'uppercase',
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 2,
  },
  typeBadgeOrganic: {
    backgroundColor: '#1a3a2a',
  },
  typeBadgeInorganic: {
    backgroundColor: '#1a2a3a',
  },
  typeBadgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  resultCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  resultSystem: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  resultDistance: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.amber,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingLeft: spacing.xl,
  },
  planetIcon: {
    marginRight: spacing.sm,
  },
  planetName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sourceTag: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
