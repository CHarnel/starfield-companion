import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import skillsData from '../../src/data/json/Skills.json';
import { getSkillImageUrl } from '../../src/data/imageRegistry';

interface Skill {
  name: string;
  tier: string;
  tree: string;
  description: string;
  ranks: string;
  unlock: string;
  rankEffects?: string[];
}

function parseUnlockChallenges(
  unlock: string,
): Record<number, string> {
  const parts = unlock.split(/Rank\s+(\d+):\s*/);
  const map: Record<number, string> = {};
  for (let i = 1; i < parts.length; i += 2) {
    const rank = parseInt(parts[i], 10);
    const challenge = parts[i + 1]?.trim().replace(/\.$/, '');
    if (challenge) {
      map[rank] = challenge;
    }
  }
  return map;
}

export default function SkillDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const skill = (skillsData as Skill[]).find((s) => s.name === decodedName);

  const [selectedRank, setSelectedRank] = useState(1);

  const availableRanks = useMemo(() => {
    if (!skill) return [];
    return [1, 2, 3, 4].filter(
      (r) => getSkillImageUrl(skill.name, r) !== null,
    );
  }, [skill]);

  const challengeMap = useMemo(() => {
    if (!skill) return {};
    return parseUnlockChallenges(skill.unlock);
  }, [skill]);

  const imageUrl = skill ? getSkillImageUrl(skill.name, selectedRank) : null;
  const treeLabel = skill?.tree.replace(' Skill', '').toUpperCase() ?? '';
  const currentChallenge = challengeMap[selectedRank];
  const effectRankIndex = selectedRank >= 1 ? selectedRank - 1 : 0;
  const currentEffect =
    skill?.rankEffects?.[effectRankIndex] ?? skill?.ranks ?? '';

  if (!skill) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: 'Skill' }} />
        <Text style={styles.errorText}>Skill not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: skill.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: fonts.headingBold,
            fontSize: fontSize.lg,
          },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageSection}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroImagePlaceholder]} />
          )}
        </View>

        {availableRanks.length > 1 && (
          <View style={styles.rankSelector}>
            {availableRanks.map((rank) => (
              <Pressable
                key={rank}
                style={[
                  styles.rankDot,
                  selectedRank === rank && styles.rankDotActive,
                ]}
                onPress={() => setSelectedRank(rank)}
              >
                <Text
                  style={[
                    styles.rankDotText,
                    selectedRank === rank && styles.rankDotTextActive,
                  ]}
                >
                  {rank}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{treeLabel}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{skill.tier.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.description}>{skill.description}</Text>

        <Text style={styles.sectionTitle}>
          {`RANK ${selectedRank} EFFECT`}
        </Text>
        <View style={styles.effectCard}>
          <Ionicons
            name="flash"
            size={16}
            color={colors.primary}
            style={styles.effectIcon}
          />
          <Text style={styles.effectText}>{currentEffect}</Text>
        </View>

        {currentChallenge && (
          <>
            <Text style={styles.sectionTitle}>
              RANK {selectedRank} CHALLENGE
            </Text>
            <View style={styles.challengeCard}>
              <Ionicons
                name="trophy-outline"
                size={16}
                color={colors.amber}
                style={styles.effectIcon}
              />
              <Text style={styles.challengeText}>{currentChallenge}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const HERO_SIZE = 180;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl * 2,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heroImage: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: 4,
    resizeMode: 'contain',
  },
  heroImagePlaceholder: {
    backgroundColor: colors.surfaceLight,
  },
  rankSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rankDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rankDotText: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  rankDotTextActive: {
    color: colors.background,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 2,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wide,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wider,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  effectCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  effectIcon: {
    marginTop: 2,
  },
  effectText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  challengeText: {
    flex: 1,
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
