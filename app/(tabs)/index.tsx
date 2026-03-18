import React, { useMemo } from 'react';
import { ScrollView, View, SectionList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { categories, getCategory } from '../../src/data/registry';
import { categoryGroupOrder, categoryGroupLabels, SearchResult } from '../../src/data/types';
import { CategoryRow } from '../../src/components/CategoryRow';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SearchBar } from '../../src/components/SearchBar';
import { useSearch } from '../../src/hooks/useSearch';

interface SectionData {
  title: string;
  categoryId: string;
  data: SearchResult[];
}

export default function BrowseScreen() {
  const router = useRouter();
  const { query, setQuery, results, isSearching, clear } = useSearch();
  const isActive = query.length >= 2;

  const sections = useMemo(() => {
    const grouped = new Map<string, SearchResult[]>();
    for (const result of results) {
      const existing = grouped.get(result.categoryId);
      if (existing) {
        existing.push(result);
      } else {
        grouped.set(result.categoryId, [result]);
      }
    }

    const sectionList: SectionData[] = [];
    for (const [categoryId, items] of grouped) {
      sectionList.push({
        title: items[0].categoryLabel,
        categoryId,
        data: items,
      });
    }
    return sectionList;
  }, [results]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>STARFIELD</Text>
        <Text style={styles.subtitle}>COMPANION DATABASE</Text>
      </View>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={clear}
        placeholder="Search all categories..."
      />
      {isActive ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, idx) => `${item.categoryId}-${item.index}-${idx}`}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            const cat = getCategory(item.categoryId);
            const nameField = cat?.nameField ?? 'name';
            const name = String(item.item[nameField] ?? 'Unknown');
            const listFields = cat?.listFields ?? [];
            const firstStat = listFields.find(
              (f) => item.item[f] != null && item.item[f] !== ''
            );

            return (
              <View
                style={styles.resultRow}
                onTouchEnd={() =>
                  router.push(`/item/${item.categoryId}/${item.index}`)
                }
              >
                <Ionicons
                  name={
                    (cat?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap
                  }
                  size={14}
                  color={colors.primary}
                  style={styles.resultIcon}
                />
                <Text style={styles.resultName} numberOfLines={1}>
                  {name}
                </Text>
                {firstStat && (
                  <Text style={styles.resultStat} numberOfLines={1}>
                    {String(item.item[firstStat])}
                  </Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              {isSearching ? (
                <Text style={styles.emptyText}>Searching...</Text>
              ) : (
                <>
                  <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={colors.textMuted}
                  />
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptyHint}>
                    Try a different search term
                  </Text>
                </>
              )}
            </View>
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {categoryGroupOrder.map((group) => {
            const groupCategories = categories.filter((c) => c.group === group);
            if (groupCategories.length === 0) return null;

            return (
              <View key={group}>
                <SectionHeader title={categoryGroupLabels[group]} />
                {groupCategories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    itemCount={cat.data().length}
                    onPress={() => router.push(`/category/${cat.id}`)}
                  />
                ))}
              </View>
            );
          })}
          <View style={styles.footer} />
        </ScrollView>
      )}
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
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
  sectionHeader: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  resultName: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  resultStat: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    maxWidth: 120,
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
  emptyHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  footer: {
    height: spacing.xxl,
  },
});
