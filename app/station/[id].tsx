import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { getStation, CraftingRecipe } from '../../src/data/craftingStations';
import { SearchBar } from '../../src/components/SearchBar';

interface Section {
  title: string;
  data: { recipe: CraftingRecipe; index: number }[];
}

export default function StationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const station = getStation(id);
  const [filter, setFilter] = useState('');

  const sections = useMemo<Section[]>(() => {
    if (!station) return [];
    const q = filter.toLowerCase();
    return station.sections
      .map((sectionTitle) => {
        const sectionRecipes = station.recipes
          .map((r, i) => ({ recipe: r, index: i }))
          .filter((entry) => {
            if (entry.recipe.section !== sectionTitle) return false;
            if (!q) return true;
            return (
              entry.recipe.name.toLowerCase().includes(q) ||
              entry.recipe.materials?.toLowerCase().includes(q) ||
              entry.recipe.effect?.toLowerCase().includes(q) ||
              entry.recipe.type?.toLowerCase().includes(q)
            );
          });
        return { title: sectionTitle, data: sectionRecipes };
      })
      .filter((s) => s.data.length > 0);
  }, [station, filter]);

  const totalFiltered = useMemo(
    () => sections.reduce((sum, s) => sum + s.data.length, 0),
    [sections],
  );

  const renderItem = useCallback(
    ({ item }: { item: { recipe: CraftingRecipe; index: number } }) => {
      const { recipe, index } = item;
      return (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push(`/recipe/${id}/${index}` as any)}
        >
          <View style={styles.rowContent}>
            <Text style={styles.rowName} numberOfLines={1}>
              {recipe.name}
            </Text>
            {recipe.type && (
              <View style={styles.rowMeta}>
                <Text style={styles.rowType}>{recipe.type}</Text>
              </View>
            )}
            {recipe.effect && (
              <Text style={styles.rowEffect} numberOfLines={1}>
                {recipe.effect}
              </Text>
            )}
            {!recipe.effect && recipe.materials && (
              <Text style={styles.rowEffect} numberOfLines={1}>
                {recipe.materials}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </Pressable>
      );
    },
    [id, router],
  );

  if (!station) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: 'Station' }} />
        <Text style={styles.errorText}>Station not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: station.label,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: fonts.headingBold,
            fontSize: fontSize.lg,
          },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {totalFiltered} {totalFiltered === 1 ? 'recipe' : 'recipes'}
          {filter ? ` matching "${filter}"` : ''}
        </Text>
      </View>
      <SearchBar
        value={filter}
        onChangeText={setFilter}
        placeholder={`Filter ${station.label.toLowerCase()}...`}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.recipe.section}-${item.index}`}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recipes match your filter</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  meta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wide,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  rowContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowName: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  rowMeta: {
    flexDirection: 'row',
    marginTop: 2,
  },
  rowType: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  rowEffect: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  errorText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 80,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
