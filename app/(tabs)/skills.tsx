import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import skillsData from '../../src/data/json/Skills.json';
import { getSkillIcon } from '../../src/data/imageRegistry';

interface Skill {
  name: string;
  tier: string;
  tree: string;
  description: string;
  ranks: string;
  unlock: string;
}

const TREES = [
  { key: 'Physical Skill', label: 'Physical' },
  { key: 'Social Skill', label: 'Social' },
  { key: 'Combat Skill', label: 'Combat' },
  { key: 'Science Skill', label: 'Science' },
  { key: 'Tech Skill', label: 'Tech' },
];

const TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
const MAX_PER_ROW = 5;

interface TierGroup {
  tier: string;
  skills: Skill[];
}

export default function SkillsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [activeTree, setActiveTree] = useState(0);

  const contentWidth = width - spacing.lg * 2;
  const gap = spacing.sm;
  const cardWidth = Math.floor(
    (contentWidth - gap * (MAX_PER_ROW - 1)) / MAX_PER_ROW,
  );
  const imageSize = cardWidth - spacing.sm * 2;

  const skillsByTree = useMemo(() => {
    const typed = skillsData as Skill[];
    return TREES.map((tree) => {
      const treeSkills = typed.filter((s) => s.tree === tree.key);
      return TIERS.map((tier) => ({
        tier,
        skills: treeSkills.filter((s) => s.tier === tier),
      })).filter((group) => group.skills.length > 0);
    });
  }, []);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveTree(index);
    },
    [width],
  );

  const scrollToTree = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setActiveTree(index);
  }, []);

  const renderTreePage = useCallback(
    ({ item }: { item: TierGroup[] }) => (
      <ScrollView
        style={{ width }}
        contentContainerStyle={styles.treeContent}
        showsVerticalScrollIndicator={false}
      >
        {item.map((tierGroup) => (
          <View key={tierGroup.tier}>
            <Text style={styles.tierHeader}>{tierGroup.tier.toUpperCase()}</Text>
            <View style={[styles.skillRow, { gap }]}>
              {tierGroup.skills.map((skill) => {
                const iconSource = getSkillIcon(skill.name);
                return (
                  <Pressable
                    key={skill.name}
                    style={({ pressed }) => [
                      styles.skillCard,
                      { width: cardWidth },
                      pressed && styles.skillCardPressed,
                    ]}
                    onPress={() =>
                      router.push(
                        `/skill/${encodeURIComponent(skill.name)}` as any,
                      )
                    }
                  >
                    {iconSource ? (
                      <Image
                        source={iconSource}
                        style={[
                          styles.skillImage,
                          { width: imageSize, height: imageSize },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.skillImagePlaceholder,
                          { width: imageSize, height: imageSize },
                        ]}
                      />
                    )}
                    <Text style={styles.skillName} numberOfLines={1}>
                      {skill.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    ),
    [width, cardWidth, imageSize, router],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title="SKILLS"
        subtitle="CHARACTER ABILITIES"
        onGearPress={() => router.push('/about')}
      />
      <View style={styles.treeSelector}>
        {TREES.map((tree, i) => (
          <Pressable
            key={tree.key}
            style={[
              styles.treePill,
              activeTree === i && styles.treePillActive,
            ]}
            onPress={() => scrollToTree(i)}
          >
            <Text
              style={[
                styles.treePillText,
                activeTree === i && styles.treePillTextActive,
              ]}
            >
              {tree.label.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        ref={listRef}
        data={skillsByTree}
        renderItem={renderTreePage}
        keyExtractor={(_, i) => TREES[i].key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  treeSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  treePill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  treePillActive: {
    backgroundColor: colors.surfaceLight,
    borderBottomColor: colors.primary,
  },
  treePillText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wide,
  },
  treePillTextActive: {
    color: colors.primary,
  },
  treeContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 3,
  },
  tierHeader: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  skillCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    padding: spacing.sm,
  },
  skillCardPressed: {
    backgroundColor: colors.surfaceLight,
  },
  skillImage: {
    borderRadius: 2,
    resizeMode: 'contain',
  },
  skillImagePlaceholder: {
    borderRadius: 2,
    backgroundColor: colors.surfaceLight,
  },
  skillName: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
