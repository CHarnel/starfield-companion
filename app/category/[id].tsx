import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { useCategory } from '../../src/hooks/useCategory';
import { useFilteredList } from '../../src/hooks/useFilteredList';
import { SearchBar } from '../../src/components/SearchBar';
import { ItemRow } from '../../src/components/ItemRow';
import { getCategoryImageType } from '../../src/data/imageRegistry';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { category, data } = useCategory(id);
  const { filter, setFilter, filtered } = useFilteredList(data, category);
  const imageType = getCategoryImageType(id ?? '');

  if (!category) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: category.label,
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
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {filter ? ` matching "${filter}"` : ''}
        </Text>
      </View>
      <SearchBar
        value={filter}
        onChangeText={setFilter}
        placeholder={`Filter ${category.label.toLowerCase()}...`}
      />
      <FlatList
        data={filtered}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item, index }) => {
          const originalIndex = data.indexOf(item);
          return (
            <ItemRow
              item={item}
              nameField={category.nameField}
              listFields={category.listFields}
              imageType={imageType}
              onPress={() => {
                if (category.id === 'galaxy') {
                  const planetName = String(item[category.nameField] ?? '');
                  router.push(`/planet/${encodeURIComponent(planetName)}` as any);
                } else {
                  router.push(`/item/${category.id}/${originalIndex}`);
                }
              }}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items match your filter</Text>
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
