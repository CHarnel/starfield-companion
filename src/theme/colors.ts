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
} as const;

export type ColorName = keyof typeof colors;
