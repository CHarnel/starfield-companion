import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../../src/theme';
import { useCategory } from '../../../src/hooks/useCategory';
import { FieldTable } from '../../../src/components/FieldTable';
import { VendorSection } from '../../../src/components/VendorSection';
import { GameImage } from '../../../src/components/GameImage';
import { getImageTypeForItem } from '../../../src/data/imageRegistry';

export default function ItemDetailScreen() {
  const { categoryId, index } = useLocalSearchParams<{
    categoryId: string;
    index: string;
  }>();
  const { category, data } = useCategory(categoryId);

  const itemIndex = parseInt(index, 10);
  const item = data[itemIndex];

  if (!category || !item) {
    return null;
  }

  const name = String(item[category.nameField] ?? 'Details');
  const imageType = getImageTypeForItem(categoryId ?? '', item);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: fonts.headingBold,
            fontSize: fontSize.lg,
          },
          headerShadowVisible: false,
        }}
      />
      {imageType && (
        <View style={styles.heroContainer}>
          <GameImage kind={imageType} name={name} size={180} />
        </View>
      )}
      <FieldTable item={item} nameField={category.nameField} />
      <VendorSection itemName={name} />
    </ScrollView>
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
  heroContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
