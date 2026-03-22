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
import { PlaceholderIcon } from './PlaceholderIcon';

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

const BLURHASH_DARK = 'L02rs+xb00Ri~Wxb00WB00WB00WB';

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

  if (!uri || failed) {
    if (fallback === 'none') return null;
    const placeholderType: ItemType = kind === 'skill' ? 'resource' : kind;
    return <PlaceholderIcon type={placeholderType} size={size} style={style as ImageStyle} />;
  }

  return (
    <ExpoImage
      source={{ uri }}
      style={[{ width: size, height: size, borderRadius: 6 }, style]}
      contentFit="contain"
      cachePolicy="disk"
      placeholder={{ blurhash: BLURHASH_DARK }}
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

export function hasImage(kind: 'skill' | ItemType, name: string, rank = 0): boolean {
  return kind === 'skill' ? hasSkillImage(name) : hasItemImage(name);
}
