import React from 'react';
import Svg, {
  Rect,
  Path,
  Circle,
  Line,
  Ellipse,
  Polygon,
  Text as SvgText,
  G,
} from 'react-native-svg';
import type { ItemType } from '../data/imageRegistry';

interface Props {
  type: ItemType | 'skill';
  size?: number;
}

const FILL = '#141924';
const STROKE = '#2A3548';
const ACCENT = '#5B9FE3';
const MUTED = '#576275';

function WeaponPlaceholder({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="8" fill={FILL} />
      <G stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M40 105 L130 105 L145 100 L160 100" />
        <Path d="M40 105 L40 115 L55 115 L55 105" />
        <Path d="M130 105 L130 115 L115 115 L115 105" />
        <Path d="M145 100 L145 95 L160 95 L160 100" />
        <Path d="M40 105 L25 120" />
        <Path d="M40 115 L30 125 L25 120" />
        <Path d="M80 105 L80 120 L95 120 L95 105" />
        <Path d="M100 95 L100 90 L120 90 L120 95" />
        <Circle cx="110" cy="90" r="3" />
      </G>
      <SvgText x="100" y="160" textAnchor="middle" fill={MUTED} fontSize="12">
        Weapon
      </SvgText>
    </Svg>
  );
}

function ApparelPlaceholder({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="8" fill={FILL} />
      <G stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M80 55 C80 40, 120 40, 120 55" />
        <Path d="M80 55 L75 80 L80 85" />
        <Path d="M120 55 L125 80 L120 85" />
        <Ellipse cx="100" cy="65" rx="15" ry="10" stroke={ACCENT} strokeOpacity="0.4" />
        <Path d="M80 85 L75 90 L65 95 L65 135 L80 140 L120 140 L135 135 L135 95 L125 90 L120 85" />
        <Line x1="100" y1="90" x2="100" y2="130" />
        <Path d="M85 100 L115 100" />
        <Path d="M65 95 L50 110 L55 115" />
        <Path d="M135 95 L150 110 L145 115" />
        <Path d="M75 130 L125 130" />
      </G>
      <SvgText x="100" y="170" textAnchor="middle" fill={MUTED} fontSize="12">
        Apparel
      </SvgText>
    </Svg>
  );
}

function ConsumablePlaceholder({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="8" fill={FILL} />
      <G stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="85" y="55" width="30" height="80" rx="4" />
        <Line x1="95" y1="55" x2="95" y2="45" />
        <Line x1="105" y1="55" x2="105" y2="45" />
        <Line x1="90" y1="45" x2="110" y2="45" />
        <Line x1="100" y1="135" x2="100" y2="155" />
        <Line x1="90" y1="75" x2="110" y2="75" strokeOpacity="0.5" />
        <Line x1="90" y1="90" x2="110" y2="90" strokeOpacity="0.5" />
        <Line x1="90" y1="105" x2="110" y2="105" strokeOpacity="0.5" />
        <Line x1="90" y1="120" x2="110" y2="120" strokeOpacity="0.5" />
        <Line x1="96" y1="95" x2="104" y2="95" stroke={ACCENT} strokeOpacity="0.4" />
        <Line x1="100" y1="91" x2="100" y2="99" stroke={ACCENT} strokeOpacity="0.4" />
      </G>
      <SvgText x="100" y="180" textAnchor="middle" fill={MUTED} fontSize="12">
        Consumable
      </SvgText>
    </Svg>
  );
}

function ResourcePlaceholder({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="8" fill={FILL} />
      <G stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Polygon points="100,40 115,75 108,78 100,55 92,78 85,75" />
        <Polygon points="75,65 85,75 80,100 65,90" />
        <Polygon points="125,65 115,75 120,100 135,90" />
        <Path d="M60 100 L65 90 L80 100 L85 75 L92 78 L100 55 L108 78 L115 75 L120 100 L135 90 L140 100 L135 120 L60 120 Z" />
        <Line x1="100" y1="55" x2="100" y2="78" strokeOpacity="0.4" />
        <Line x1="75" y1="75" x2="80" y2="95" strokeOpacity="0.4" />
        <Line x1="125" y1="75" x2="120" y2="95" strokeOpacity="0.4" />
      </G>
      <Circle cx="100" cy="65" r="2" fill={ACCENT} fillOpacity="0.3" />
      <Circle cx="80" cy="85" r="1.5" fill={ACCENT} fillOpacity="0.2" />
      <Circle cx="120" cy="85" r="1.5" fill={ACCENT} fillOpacity="0.2" />
      <SvgText x="100" y="155" textAnchor="middle" fill={MUTED} fontSize="12">
        Resource
      </SvgText>
    </Svg>
  );
}

function SkillPlaceholder({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect width="200" height="200" rx="8" fill={FILL} />
      <G stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Polygon points="100,35 145,60 145,110 100,135 55,110 55,60" />
        <Polygon points="100,50 135,70 135,105 100,125 65,105 65,70" strokeOpacity="0.5" />
        <Polygon
          points="100,65 106,80 122,82 110,93 113,108 100,100 87,108 90,93 78,82 94,80"
          stroke={ACCENT}
          strokeOpacity="0.4"
        />
      </G>
      <SvgText x="100" y="165" textAnchor="middle" fill={MUTED} fontSize="12">
        Skill
      </SvgText>
    </Svg>
  );
}

export function PlaceholderIcon({ type, size = 80 }: Props) {
  switch (type) {
    case 'weapon':
      return <WeaponPlaceholder size={size} />;
    case 'apparel':
      return <ApparelPlaceholder size={size} />;
    case 'consumable':
      return <ConsumablePlaceholder size={size} />;
    case 'resource':
      return <ResourcePlaceholder size={size} />;
    case 'skill':
      return <SkillPlaceholder size={size} />;
    default:
      return <ResourcePlaceholder size={size} />;
  }
}
