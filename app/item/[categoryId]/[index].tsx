import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors, fonts, fontSize, letterSpacing } from '../../../src/theme';
import { useCategory } from '../../../src/hooks/useCategory';
import { FieldTable } from '../../../src/components/FieldTable';

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
      <FieldTable item={item} nameField={category.nameField} />
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
});
