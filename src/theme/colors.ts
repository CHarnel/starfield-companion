export const colors = {
  background: '#0A0E17',
  surface: '#141924',
  surfaceLight: '#1A2030',
  border: '#1E293B',
  borderLight: '#2A3548',

  primary: '#5B9FE3',
  primaryMuted: '#3A6FA0',
  amber: '#D4A54A',
  amberMuted: '#8B7034',

  textPrimary: '#E8EAED',
  textSecondary: '#8B95A5',
  textMuted: '#576275',

  transparent: 'transparent',

  rarityCommon: '#C8CCD4',
  rarityUncommon: '#4CC764',
  rarityRare: '#5B9FE3',
  rarityExotic: '#B06ADE',
  rarityUnique: '#D4A54A',
} as const;

export type ColorName = keyof typeof colors;

const rarityMap: Record<string, string> = {
  common: colors.rarityCommon,
  uncommon: colors.rarityUncommon,
  rare: colors.rarityRare,
  exotic: colors.rarityExotic,
  unique: colors.rarityUnique,
};

export function rarityColor(rarity: string | undefined): string {
  return rarityMap[rarity?.toLowerCase() ?? ''] ?? colors.textSecondary;
}
