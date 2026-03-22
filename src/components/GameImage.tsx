import React, { useState } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import {
  getSkillImageUrl,
  getItemImageUrl,
  hasItemImage,
  hasSkillImage,
  type ItemType,
} from '../data/imageRegistry';
import { PlaceholderIcon, placeholderImages } from './PlaceholderIcon';

interface SkillImageProps {
  kind: 'skill';
  name: string;
  rank?: number;
  size?: number;
  style?: StyleProp<ImageStyle>;
  fallback?: 'placeholder' | 'none';
}

interface ItemImageProps {
  kind: ItemType;
  name: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  fallback?: 'placeholder' | 'none';
}

export type GameImageProps = SkillImageProps | ItemImageProps;

export function GameImage(props: GameImageProps) {
  const { kind, name, size = 80, style, fallback = 'placeholder' } = props;
  const [failed, setFailed] = useState(false);

  let uri: string | null = null;

  if (kind === 'skill') {
    const rank = (props as SkillImageProps).rank ?? 0;
    uri = getSkillImageUrl(name, rank);
  } else {
    uri = getItemImageUrl(name);
  }

  const placeholderType: ItemType = kind === 'skill' ? 'resource' : kind;

  if (!uri || failed) {
    if (fallback === 'none') return null;
    return <PlaceholderIcon type={placeholderType} size={size} style={style as ImageStyle} />;
  }

  return (
    <ExpoImage
      source={{ uri }}
      style={[{ width: size, height: size, borderRadius: 6 }, style]}
      contentFit="contain"
      cachePolicy="disk"
      placeholder={placeholderImages[placeholderType]}
      placeholderContentFit="contain"
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

export function hasImage(kind: 'skill' | ItemType, name: string, rank = 0): boolean {
  return kind === 'skill' ? hasSkillImage(name) : hasItemImage(name);
}
