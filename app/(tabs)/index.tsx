import React from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { categories } from '../../src/data/registry';
import { categoryGroupOrder, categoryGroupLabels } from '../../src/data/types';
import { CategoryRow } from '../../src/components/CategoryRow';
import { SectionHeader } from '../../src/components/SectionHeader';

export default function BrowseScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>STARFIELD</Text>
        <Text style={styles.subtitle}>COMPANION DATABASE</Text>
      </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  footer: {
    height: spacing.xxl,
  },
});
