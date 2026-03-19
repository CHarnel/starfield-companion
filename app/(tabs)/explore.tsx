import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { SearchBar } from '../../src/components/SearchBar';
import { getSystemGroups, PlanetData } from '../../src/services/planetLookup';

interface Section {
  system: string;
  data: PlanetData[];
}

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const allSystems = useMemo(() => getSystemGroups(), []);

  const sections: Section[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return allSystems.map((g) => ({ system: g.system, data: g.planets }));
    }
    const result: Section[] = [];
    for (const g of allSystems) {
      const systemMatch = g.system.toLowerCase().includes(q);
      if (systemMatch) {
        result.push({ system: g.system, data: g.planets });
      } else {
        const matched = g.planets.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q),
        );
        if (matched.length > 0) {
          result.push({ system: g.system, data: matched });
        }
      }
    }
    return result;
  }, [query, allSystems]);

  const toggleSystem = useCallback((system: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(system)) next.delete(system);
      else next.add(system);
      return next;
    });
  }, []);

  const isFiltering = query.trim().length > 0;

  const visibleSections = useMemo(() => {
    if (isFiltering) return sections;
    return sections.map((s) => ({
      ...s,
      data: collapsed.has(s.system) ? [] : s.data,
    }));
  }, [sections, collapsed, isFiltering]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => {
      const isCollapsed = !isFiltering && collapsed.has(section.system);
      const planetCount = sections.find((s) => s.system === section.system)?.data.length ?? 0;
      return (
        <Pressable
          style={styles.systemRow}
          onPress={() => toggleSystem(section.system)}
        >
          <Ionicons name="star-outline" size={14} color={colors.amber} />
          <Text style={styles.systemName} numberOfLines={1}>
            {section.system}
          </Text>
          <Text style={styles.planetCount}>{planetCount}</Text>
          {!isFiltering && (
            <Ionicons
              name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
              size={14}
              color={colors.textMuted}
            />
          )}
        </Pressable>
      );
    },
    [collapsed, isFiltering, toggleSystem, sections],
  );

  const renderItem = useCallback(
    ({ item }: { item: PlanetData }) => (
      <Pressable
        style={styles.planetRow}
        onPress={() =>
          router.push(`/planet/${encodeURIComponent(item.name)}` as any)
        }
      >
        <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
        <Text style={styles.planetName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </Pressable>
    ),
    [router],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>EXPLORE</Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search systems or planets..."
      />

      <Text style={styles.resultCount}>
        {sections.length} system{sections.length !== 1 ? 's' : ''}
        {isFiltering ? ' matched' : ''}
      </Text>

      <SectionList
        sections={visibleSections}
        keyExtractor={(item) => item.name}
        renderSectionHeader={renderSectionHeader as any}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={30}
        maxToRenderPerBatch={20}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wider,
  },
  resultCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  systemName: {
    flex: 1,
    fontFamily: fonts.headingBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  planetCount: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.xl + spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  planetName: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: colors.surfaceLight,
  },
  typeBadgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
