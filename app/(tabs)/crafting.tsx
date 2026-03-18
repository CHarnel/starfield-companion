import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize } from '../../src/theme';
import { stations } from '../../src/data/craftingStations';
import { ScreenHeader } from '../../src/components/ScreenHeader';

export default function CraftingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title="CRAFTING"
        subtitle="WORKBENCHES & STATIONS"
        onGearPress={() => router.push('/about')}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {stations.map((station) => (
          <Pressable
            key={station.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/station/${station.id}` as any)}
          >
            <View style={styles.cardIconWrap}>
              <Ionicons
                name={station.icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color={colors.primary}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{station.label}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {station.description}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardCount}>
                  {station.recipes.length} recipes
                </Text>
                <Text style={styles.cardSections}>
                  {station.sections.length} categories
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardPressed: {
    backgroundColor: colors.surfaceLight,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cardCount: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  cardSections: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footer: {
    height: spacing.xxl,
  },
});
