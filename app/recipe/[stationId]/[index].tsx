import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../../src/theme';
import { getStation, CraftingIngredient } from '../../../src/data/craftingStations';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>
        {value}
      </Text>
    </View>
  );
}

function IngredientChip({
  ingredient,
  onPress,
}: {
  ingredient: CraftingIngredient;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      onPress={onPress}
    >
      <Ionicons
        name="diamond-outline"
        size={12}
        color={colors.primary}
        style={styles.chipIcon}
      />
      <Text style={styles.chipName}>{ingredient.name}</Text>
      <Text style={styles.chipQty}>x{ingredient.quantity}</Text>
      <Ionicons name="open-outline" size={10} color={colors.textMuted} />
    </Pressable>
  );
}

export default function RecipeDetailScreen() {
  const { stationId, index } = useLocalSearchParams<{
    stationId: string;
    index: string;
  }>();
  const router = useRouter();
  const station = getStation(stationId);

  const recipeIndex = parseInt(index, 10);
  const recipe = station?.recipes[recipeIndex];

  if (!station || !recipe) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: recipe.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: fonts.headingBold,
            fontSize: fontSize.lg,
          },
          headerShadowVisible: false,
        }}
      />

      <Text style={styles.title}>{recipe.name}</Text>
      <View style={styles.divider} />

      {recipe.type && <DetailRow label="TYPE" value={recipe.type} />}
      {recipe.effect && <DetailRow label="EFFECT" value={recipe.effect} />}
      {recipe.section && <DetailRow label="CATEGORY" value={recipe.section} />}
      {recipe.requiredResearch && (
        <DetailRow label="RESEARCH" value={recipe.requiredResearch} />
      )}
      {recipe.skillTier && recipe.skillTier !== 'None' && (
        <DetailRow label="SKILL TIER" value={recipe.skillTier} />
      )}
      {recipe.requiredSkills && recipe.requiredSkills !== 'None' && (
        <DetailRow label="REQUIRED SKILLS" value={recipe.requiredSkills} />
      )}
      {recipe.requiredResearch &&
        typeof recipe.requiredResearch === 'string' &&
        recipe.requiredResearch !== 'None' &&
        recipe.craftingUnlocked && (
          <DetailRow label="UNLOCKS" value={recipe.craftingUnlocked} />
        )}

      <View style={styles.ingredientsSection}>
        <Text style={styles.ingredientsHeader}>MATERIALS</Text>
        <Text style={styles.ingredientsHint}>
          Tap a material to find where to get it
        </Text>
        <View style={styles.chipContainer}>
          {recipe.ingredients.map((ing, i) => (
            <IngredientChip
              key={`${ing.name}-${i}`}
              ingredient={ing}
              onPress={() =>
                router.push(
                  `/resource-locator/${encodeURIComponent(ing.name)}` as any,
                )
              }
            />
          ))}
        </View>
        {recipe.ingredients.length === 0 && recipe.materials && (
          <Text style={styles.materialsRaw}>{recipe.materials}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 60,
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
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 130,
    letterSpacing: 0.5,
  },
  detailValue: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  ingredientsSection: {
    marginTop: spacing.xl,
  },
  ingredientsHeader: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
  },
  ingredientsHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    gap: 4,
  },
  chipPressed: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  chipIcon: {
    marginRight: 2,
  },
  chipName: {
    fontFamily: fonts.heading,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  chipQty: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.amber,
  },
  materialsRaw: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  errorText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 80,
  },
});
