import React, { useState } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import {
  getSkillImageUrl,
  getItemImageUrl,
  getItemType,
  type ItemType,
} from '../data/imageRegistry';
import { PlaceholderIcon } from './PlaceholderIcon';

interface SkillImageProps {
  kind: 'skill';
  name: string;
  rank?: number;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

interface ItemImageProps {
  kind: ItemType;
  name: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export type GameImageProps = SkillImageProps | ItemImageProps;

const BLURHASH_DARK = 'L02rs+xb00Ri~Wxb00WB00WB00WB';

export function GameImage(props: GameImageProps) {
  const { kind, name, size = 80, style } = props;
  const [failed, setFailed] = useState(false);

  let uri: string | null = null;
  let placeholderType: ItemType = kind === 'skill' ? 'resource' : kind;

  if (kind === 'skill') {
    const rank = (props as SkillImageProps).rank ?? 0;
    uri = getSkillImageUrl(name, rank);
  } else {
    uri = getItemImageUrl(name);
    placeholderType = getItemType(name) ?? kind;
  }

  if (!uri || failed) {
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
