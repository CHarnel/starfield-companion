import React from 'react';
import { Text } from 'react-native';
import { sharedStyles } from '../theme';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return <Text style={sharedStyles.sectionHeader}>{title}</Text>;
}
