import React from 'react';
import { Image, type ImageStyle } from 'react-native';
import type { ItemType } from '../data/imageRegistry';

const images: Record<ItemType, number> = {
  weapon: require('../../assets/images/placeholders/weapon.png'),
  apparel: require('../../assets/images/placeholders/apparel.png'),
  consumable: require('../../assets/images/placeholders/consumable.png'),
  resource: require('../../assets/images/placeholders/resource.png'),
};

interface Props {
  type: ItemType;
  size?: number;
  style?: ImageStyle;
}

export function PlaceholderIcon({ type, size = 80, style }: Props) {
  return (
    <Image
      source={images[type] ?? images.resource}
      style={[{ width: size, height: size, borderRadius: 6 }, style]}
      resizeMode="contain"
    />
  );
}
