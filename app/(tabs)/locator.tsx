import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, fontSize, letterSpacing } from '../../src/theme';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SearchBar } from '../../src/components/SearchBar';
import { useResourceLocator } from '../../src/hooks/useResourceLocator';
import { SystemResult, PlanetSource } from '../../src/services/resourceLocator';

type PickerTarget = 'resource' | 'origin' | null;

export default function LocatorScreen() {
  const router = useRouter();
  const {
    selectedResource,
    setResource,
    originSystem,
    setOrigin,
    results,
    isSearching,
    locatableResources,
    systemNames,
  } = useResourceLocator();

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const selectedResourceDef = useMemo(
    () => locatableResources.find((r) => r.shortName === selectedResource),
    [selectedResource, locatableResources],
  );

  const filteredPickerItems = useMemo(() => {
    const q = pickerQuery.toLowerCase();
    if (pickerTarget === 'resource') {
      const list = locatableResources;
      if (!q) return list;
      return list.filter(
        (r) =>
          r.resource.toLowerCase().includes(q) ||
          r.shortName.toLowerCase().includes(q),
      );
    }
    if (pickerTarget === 'origin') {
      if (!q) return systemNames;
      return systemNames.filter((s) => s.toLowerCase().includes(q));
    }
    return [];
  }, [pickerTarget, pickerQuery, locatableResources, systemNames]);

  const openPicker = useCallback((target: PickerTarget) => {
    setPickerQuery('');
    setPickerTarget(target);
  }, []);

  const closePicker = useCallback(() => {
    setPickerTarget(null);
    setPickerQuery('');
  }, []);

  const renderPlanet = useCallback((p: PlanetSource) => {
    const organicSources = p.sources.filter((s) => s.type !== 'mineral');
    return (
      <View key={p.planet} style={styles.planetRow}>
        <Ionicons
          name="globe-outline"
          size={12}
          color={colors.textMuted}
          style={styles.planetIcon}
        />
        <Text style={styles.planetName} numberOfLines={1}>
          {p.planet}
        </Text>
        {organicSources.length > 0 && (
          <Text style={styles.sourceTag} numberOfLines={1}>
            {organicSources
              .map((s) => (s.name ? `${s.name} (${s.type})` : s.type))
              .join(', ')}
          </Text>
        )}
      </View>
    );
  }, []);

  const renderResult = useCallback(({ item }: { item: SystemResult }) => {
    const isOrigin = item.system === originSystem;
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="star-outline" size={14} color={colors.primary} />
          <Text style={styles.resultSystem} numberOfLines={1}>
            {item.system}
          </Text>
          <Text style={styles.resultDistance}>
            {isOrigin ? 'Current system' : `${item.distance} ly`}
          </Text>
        </View>
        {item.planets.map(renderPlanet)}
      </View>
    );
  }, [renderPlanet, originSystem]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title="LOCATOR"
        subtitle="RESOURCE FINDER"
        onGearPress={() => router.push('/about')}
      />

      <Pressable style={styles.selector} onPress={() => openPicker('resource')}>
        <Ionicons name="diamond-outline" size={16} color={colors.primary} />
        <View style={styles.selectorContent}>
          <Text style={styles.selectorLabel}>Resource</Text>
          <Text style={styles.selectorValue} numberOfLines={1}>
            {selectedResourceDef
              ? `${selectedResourceDef.resource} (${selectedResourceDef.shortName})`
              : 'Select a resource...'}
          </Text>
        </View>
        {selectedResourceDef && (
          <View
            style={[
              styles.typeBadge,
              selectedResourceDef.type === 'organic'
                ? styles.typeBadgeOrganic
                : styles.typeBadgeInorganic,
            ]}
          >
            <Text style={styles.typeBadgeText}>{selectedResourceDef.type}</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Pressable style={styles.selector} onPress={() => openPicker('origin')}>
        <Ionicons name="locate-outline" size={16} color={colors.amber} />
        <View style={styles.selectorContent}>
          <Text style={styles.selectorLabel}>Origin System</Text>
          <Text style={styles.selectorValue} numberOfLines={1}>
            {originSystem}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {isSearching ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.emptyText}>Scanning systems...</Text>
        </View>
      ) : !selectedResource ? (
        <View style={styles.empty}>
          <Ionicons name="compass-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Select a resource to locate</Text>
          <Text style={styles.emptyHint}>
            Find the nearest systems with organic or inorganic resources
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Resource not found on any planet</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {results.length} system{results.length !== 1 ? 's' : ''} found
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.system}
            renderItem={renderResult}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      <Modal
        visible={pickerTarget !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePicker}
      >
        <SafeAreaView style={styles.modalScreen} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {pickerTarget === 'resource' ? 'Select Resource' : 'Select Origin System'}
            </Text>
            <Pressable onPress={closePicker} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
          <SearchBar
            value={pickerQuery}
            onChangeText={setPickerQuery}
            placeholder={
              pickerTarget === 'resource'
                ? 'Filter resources...'
                : 'Filter systems...'
            }
            autoFocus
          />
          <FlatList
            data={filteredPickerItems as any[]}
            keyExtractor={(item, idx) =>
              typeof item === 'string' ? item : item.shortName + idx
            }
            renderItem={({ item }) => {
              if (pickerTarget === 'origin') {
                const name = item as string;
                const isActive = name === originSystem;
                return (
                  <Pressable
                    style={[styles.pickerRow, isActive && styles.pickerRowActive]}
                    onPress={() => {
                      setOrigin(name);
                      closePicker();
                    }}
                  >
                    <Ionicons
                      name="star-outline"
                      size={14}
                      color={isActive ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.pickerText,
                        isActive && styles.pickerTextActive,
                      ]}
                    >
                      {name}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              }
              const res = item as {
                resource: string;
                shortName: string;
                type: string;
                rarity: string;
              };
              const isActive = res.shortName === selectedResource;
              return (
                <Pressable
                  style={[styles.pickerRow, isActive && styles.pickerRowActive]}
                  onPress={() => {
                    setResource(res.shortName);
                    closePicker();
                  }}
                >
                  <View style={styles.pickerResourceInfo}>
                    <Text
                      style={[
                        styles.pickerText,
                        isActive && styles.pickerTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {res.resource}
                    </Text>
                    {res.shortName !== res.resource && (
                      <Text style={styles.pickerShortName}>{res.shortName}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      res.type === 'organic'
                        ? styles.typeBadgeOrganic
                        : styles.typeBadgeInorganic,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>{res.type}</Text>
                  </View>
                  {isActive && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.primary}
                      style={{ marginLeft: spacing.sm }}
                    />
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  selectorValue: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 2,
  },
  typeBadgeOrganic: {
    backgroundColor: '#1a3a2a',
  },
  typeBadgeInorganic: {
    backgroundColor: '#1a2a3a',
  },
  typeBadgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  resultCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  resultSystem: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  resultDistance: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.amber,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingLeft: spacing.xl,
  },
  planetIcon: {
    marginRight: spacing.sm,
  },
  planetName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sourceTag: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.sm,
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
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },

  modalScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wide,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  pickerRowActive: {
    backgroundColor: colors.surfaceLight,
  },
  pickerResourceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pickerText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  pickerTextActive: {
    color: colors.primary,
  },
  pickerShortName: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
