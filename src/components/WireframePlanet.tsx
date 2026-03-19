import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
}

const LONGITUDE_COUNT = 8;
const LATITUDE_COUNT = 5;
const ROTATION_SPEED = 0.3;

function buildLatitudePath(
  cx: number,
  cy: number,
  radius: number,
  latAngle: number,
): { rx: number; ry: number; y: number } {
  const r = radius * Math.cos(latAngle);
  const y = cy + radius * Math.sin(latAngle);
  return { rx: r, ry: r * 0.3, y };
}

function buildMeridianPath(
  cx: number,
  cy: number,
  radius: number,
  lonAngle: number,
): string {
  const points: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x3d = radius * Math.cos(t) * Math.sin(lonAngle);
    const z3d = radius * Math.cos(t) * Math.cos(lonAngle);
    const y3d = radius * Math.sin(t);
    const x2d = cx + x3d;
    const y2d = cy - y3d;
    const opacity = z3d >= 0 ? 1 : 0;
    if (i === 0) {
      points.push(`M ${x2d} ${y2d}`);
    } else {
      points.push(`L ${x2d} ${y2d}`);
    }
  }
  return points.join(' ');
}

interface MeridianSegment {
  d: string;
  front: boolean;
}

function buildMeridianSegments(
  cx: number,
  cy: number,
  radius: number,
  lonAngle: number,
): MeridianSegment[] {
  const segments: MeridianSegment[] = [];
  const steps = 64;
  let currentPath = '';
  let currentFront = true;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x3d = radius * Math.cos(t) * Math.sin(lonAngle);
    const z3d = radius * Math.cos(t) * Math.cos(lonAngle);
    const y3d = radius * Math.sin(t);
    const x2d = cx + x3d;
    const y2d = cy - y3d;
    const front = z3d >= 0;

    if (i === 0) {
      currentFront = front;
      currentPath = `M ${x2d} ${y2d}`;
    } else if (front !== currentFront) {
      segments.push({ d: currentPath, front: currentFront });
      currentPath = `M ${x2d} ${y2d}`;
      currentFront = front;
    } else {
      currentPath += ` L ${x2d} ${y2d}`;
    }
  }
  if (currentPath) {
    segments.push({ d: currentPath, front: currentFront });
  }
  return segments;
}

export function WireframePlanet({ size = 200 }: Props) {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      setAngle((a) => a + ROTATION_SPEED * dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  const latitudes = [];
  for (let i = 1; i <= LATITUDE_COUNT; i++) {
    const lat = ((i / (LATITUDE_COUNT + 1)) * Math.PI) - Math.PI / 2;
    latitudes.push(buildLatitudePath(cx, cy, r, lat));
  }

  const meridianSegments: MeridianSegment[] = [];
  for (let i = 0; i < LONGITUDE_COUNT; i++) {
    const lon = angle + (i / LONGITUDE_COUNT) * Math.PI;
    const segs = buildMeridianSegments(cx, cy, r, lon);
    meridianSegments.push(...segs);
  }

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.primary}
          strokeWidth={1.2}
          fill="none"
          opacity={0.6}
        />

        {latitudes.map((lat, i) => (
          <Ellipse
            key={`lat-${i}`}
            cx={cx}
            cy={lat.y}
            rx={lat.rx}
            ry={lat.ry}
            stroke={colors.primaryMuted}
            strokeWidth={0.7}
            fill="none"
            opacity={0.4}
          />
        ))}

        {meridianSegments.map((seg, i) => (
          <Path
            key={`mer-${i}`}
            d={seg.d}
            stroke={seg.front ? colors.primary : colors.primaryMuted}
            strokeWidth={seg.front ? 1 : 0.6}
            fill="none"
            opacity={seg.front ? 0.7 : 0.2}
          />
        ))}
      </Svg>
    </View>
  );
}
