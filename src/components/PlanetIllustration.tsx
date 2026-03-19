import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import Svg, {
  Circle,
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';
import type { PlanetData } from '../services/planetLookup';

interface Props {
  size?: number;
  planet: PlanetData;
}

const ROTATION_SPEED = 0.15;
const GAS_TYPES = new Set(['Gas giant', 'Hot gas giant', 'Ice giant']);

// ── Shaders ──────────────────────────────────────────────────
// Adapted from jsulpis/realtime-planet-shader (GPL-3.0)
// https://github.com/jsulpis/realtime-planet-shader
// Ported from WebGL2 → WebGL1 for expo-gl; uses hash-based 3D
// value noise instead of sampler3D, ray-sphere intersection for
// proper perspective, domain-warped FBM for organic terrain.

const VERT = `
attribute vec2 position;
varying vec2 vUV;
void main() {
  vUV = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUV;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_waterCol;
uniform float u_hasWater;
uniform vec3 u_atmoCol;
uniform float u_atmoDens;
uniform float u_pRadius;
uniform float u_gasGiant;

#define SUN_DIR vec3(0.6084, 0.3549, 0.7098)
#define CAM_DIST 2.5

// ── 3D value noise (no texture sampler needed) ──

float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.11369, 0.13787));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i),               hash31(i+vec3(1,0,0)), f.x),
        mix(hash31(i+vec3(0,1,0)),   hash31(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i+vec3(0,0,1)),   hash31(i+vec3(1,0,1)), f.x),
        mix(hash31(i+vec3(0,1,1)),   hash31(i+vec3(1,1,1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float v = 0.0, a = 0.5, n = 0.0;
  for (int i = 0; i < 5; i++) {
    v += a * noise3(p);
    n += a;
    a *= 0.5;
    p *= 2.17;
  }
  return v / n;
}

float warpedFBM(vec3 p) {
  float w = fbm(p + vec3(5.2, 1.3, 2.8));
  return fbm(p + w * 0.8);
}

// ── Ray-sphere intersection (from iq) ──

float sphIntersect(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float h = b * b - c;
  if (h < 0.0) return -1.0;
  return -b - sqrt(h);
}

// ── Stars (adapted from nimitz via jsulpis) ──

vec3 stars(vec3 rd, float res) {
  vec3 c = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    vec3 q = fract(rd * (0.15 * res)) - 0.5;
    vec3 id = floor(rd * (0.15 * res));
    float rn1 = hash31(id);
    float rn2 = hash31(id * 2.0 + 17.0);
    float c2 = 1.0 - smoothstep(0.0, 0.6, length(q));
    c2 *= step(rn1, 0.003 + float(i) * 0.0005);
    c += c2 * (mix(vec3(1.0, 0.5, 0.1), vec3(0.75, 0.9, 1.0), rn2) * 0.2 + 0.8);
    rd *= 1.8;
  }
  return c * c * 0.4;
}

void main() {
  vec2 p = vUV - 0.5;
  float res = min(u_resolution.x, u_resolution.y);

  vec3 ro = vec3(0.0, 0.0, CAM_DIST);
  vec3 rd = normalize(vec3(p.x, -p.y, -1.0));
  float pR = u_pRadius * CAM_DIST;

  // ── Background: exact app background (#0A0E17) + stars ──
  vec3 starDir = rd;
  starDir.x += u_seed * 0.01;
  vec3 color = vec3(0.03922, 0.05490, 0.09020) + stars(starDir, res * 0.35);

  // ── Outer atmosphere glow (multi-power, from jsulpis) ──
  float tClose = dot(-ro, rd);
  vec3 closePt = ro + rd * max(tClose, 0.0);
  float closeDist = length(closePt);
  float atmoR = pR * (1.0 + u_atmoDens * 0.5);

  if (closeDist < atmoR && u_atmoDens > 0.01) {
    float ae = 1.0 - closeDist / atmoR;
    float glow = pow(ae, 5.0)  * 0.2
               + pow(ae, 15.0) * 0.3
               + pow(ae, 50.0) * 0.5;
    float sf = dot(SUN_DIR, normalize(closePt)) * 0.3 + 0.7;
    color += u_atmoCol * glow * u_atmoDens * sf;
  }

  // ── Ray-sphere intersection ──
  float t = sphIntersect(ro, rd, pR);

  if (t > 0.0) {
    vec3 hitPos = ro + t * rd;
    vec3 N = normalize(hitPos);
    vec3 V = normalize(ro - hitPos);

    float ca = cos(u_time);
    float sa = sin(u_time);
    vec3 rN = vec3(N.x*ca + N.z*sa, N.y, -N.x*sa + N.z*ca);

    // ── Terrain noise (3D → no polar seam) ──
    vec3 nc = rN * 3.0 + u_seed * 0.013;
    float terrain = warpedFBM(nc);
    float detail  = fbm(nc * 4.0 + 42.0);

    // ── Surface color ──
    vec3 surfCol;

    if (u_gasGiant > 0.5) {
      float lat  = rN.y;
      float band = sin((lat + terrain * 2.0) * 10.0) * 0.5 + 0.5;
      surfCol = mix(u_color2, u_color1, band);
      surfCol = mix(surfCol, u_color3, smoothstep(0.7, 0.9, band) * 0.5);
      surfCol = mix(surfCol, u_color1 * 1.2, detail * 0.12);
    } else {
      float waterLine = 0.42;
      if (u_hasWater > 0.5 && terrain < waterLine) {
        float depth = smoothstep(waterLine, waterLine - 0.18, terrain);
        surfCol = mix(u_waterCol * 0.9, u_waterCol * 0.45, depth);
        surfCol += u_waterCol * 0.06 * detail;
      } else {
        float landAlt = smoothstep(waterLine - 0.05, 0.72, terrain);
        surfCol = mix(u_color2, u_color1, smoothstep(0.0, 0.4, landAlt));
        surfCol = mix(surfCol, u_color3, smoothstep(0.5, 0.9, landAlt));
        surfCol = mix(surfCol, u_color2 * 0.85, detail * 0.18);
      }
      float polar = abs(rN.y);
      surfCol = mix(surfCol, vec3(0.82, 0.88, 0.92),
                    smoothstep(0.72, 0.88, polar) * 0.5);
    }

    // ── Clouds (rocky planets with atmosphere) ──
    if (u_gasGiant < 0.5 && u_atmoDens > 0.1) {
      vec3 cc = rN * 2.5 + vec3(u_time * 0.12, 0.0, u_time * 0.04);
      float cl = fbm(cc);
      float cm = smoothstep(0.46, 0.64, cl) * u_atmoDens * 0.7;
      surfCol = mix(surfCol, vec3(1.0, 1.0, 0.97), cm);
    }

    // ── Diffuse (Lambert, soft terminator) ──
    float NdotL = dot(N, SUN_DIR);
    float diff  = smoothstep(-0.05, 0.2, NdotL);
    surfCol *= 0.06 + diff * 0.94;

    // ── Specular (Blinn-Phong, stronger on water) ──
    vec3  H    = normalize(SUN_DIR + V);
    float spec = pow(max(dot(N, H), 0.0), 40.0);
    float wSpc = step(terrain, 0.42) * u_hasWater * (1.0 - u_gasGiant);
    surfCol += vec3(1.0, 1.0, 0.9) * spec * mix(0.03, 0.18, wSpc) * diff;

    // ── Atmosphere rim ──
    float rim     = 1.0 - max(dot(N, V), 0.0);
    float rimGlow = pow(rim, 3.0) * u_atmoDens;
    float rimSun  = clamp(NdotL + 0.3, 0.0, 1.0);
    surfCol += u_atmoCol * rimGlow * rimSun * 0.5;

    // ── Saturation boost + tone mapping ──
    float lum = dot(surfCol, vec3(0.299, 0.587, 0.114));
    surfCol = mix(vec3(lum), surfCol, 1.35);
    surfCol = max(surfCol, 0.0);
    surfCol = surfCol * 1.5 / (1.0 + surfCol);
    surfCol = pow(surfCol, vec3(1.0 / 2.2));

    // ── Anti-aliased edge (resolution-aware) ──
    float aaW = 2.0 / (res * u_pRadius);
    float edgeMask = smoothstep(0.0, aaW, dot(N, V));
    color = mix(color, surfCol, edgeMask);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

// ── Color utilities ──────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function hexToNorm(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [r / 255, g / 255, b / 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [r, g, b]
      .map((v) => c(v).toString(16).padStart(2, '0'))
      .join('')
  );
}

function tintColor(hex: string, tint: [number, number, number]): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + tint[0], g + tint[1], b + tint[2]);
}

// ── Palette definitions ──────────────────────────────────────

interface TypePalette {
  base: string;
  dark: string;
  light: string;
}

const TYPE_PALETTES: Record<string, TypePalette> = {
  Rock: { base: '#8B7355', dark: '#5C4A35', light: '#A89070' },
  Barren: { base: '#5A5A5A', dark: '#3A3A3A', light: '#7A7A7A' },
  Ice: { base: '#A0C8E0', dark: '#6A98B8', light: '#D0E8F5' },
  'Gas giant': { base: '#C89040', dark: '#8A6020', light: '#E0B060' },
  'Hot gas giant': { base: '#C05030', dark: '#802818', light: '#E07050' },
  'Ice giant': { base: '#4A80A0', dark: '#2A5878', light: '#70A8C8' },
  Asteroid: { base: '#4A4845', dark: '#2E2C2A', light: '#686560' },
};

const TEMP_TINTS: Record<string, [number, number, number]> = {
  'deep freeze': [0, 0, 30],
  frozen: [0, 0, 20],
  cold: [0, 0, 10],
  temperate: [0, 0, 0],
  hot: [15, 5, -5],
  scorched: [25, 8, -10],
  inferno: [35, 10, -15],
};

const WATER_COLORS: Record<string, string> = {
  safe: '#2090D0',
  chemical: '#90B020',
  biological: '#30B868',
  radioactive: '#50C048',
  'heavy metal': '#B89030',
};

function parseAtmosphere(atmo: string): { density: number; color: string } {
  if (atmo === 'none') return { density: 0, color: '' };

  let density = 0.3;
  let gasType = atmo;

  if (atmo.startsWith('thin ')) {
    density = 0.15;
    gasType = atmo.slice(5);
  } else if (atmo.startsWith('std ')) {
    density = 0.3;
    gasType = atmo.slice(4);
  } else if (atmo.startsWith('high ')) {
    density = 0.45;
    gasType = atmo.slice(5);
  } else if (atmo.startsWith('extr ')) {
    density = 0.6;
    gasType = atmo.slice(5);
  }

  const GAS_COLORS: Record<string, string> = {
    o2: '#5080C0',
    co2: '#C0903A',
    n2: '#70A870',
    m: '#8060A0',
    h2: '#50A0C0',
  };

  return { density, color: GAS_COLORS[gasType] ?? '#6080A0' };
}

// ── Biome-aware palette ──────────────────────────────────────

const BIOME_PALETTES: Record<string, TypePalette> = {
  forest:   { base: '#2E8B1E', dark: '#1A6B0A', light: '#5AAE4A' },
  tropical: { base: '#1A7A24', dark: '#0C5A14', light: '#3CA03A' },
  savanna:  { base: '#A0AA2A', dark: '#788818', light: '#C4D048' },
  swamp:    { base: '#2A6A38', dark: '#1A4A26', light: '#4A8A5A' },
  frozen:   { base: '#90C8E0', dark: '#60A0C8', light: '#C0E4F8' },
  desert:   { base: '#C4A850', dark: '#9A8030', light: '#E4CC78' },
  volcanic: { base: '#8A2820', dark: '#5A1810', light: '#B04838' },
  rocky:    { base: '#7A7A7A', dark: '#585858', light: '#A0A0A0' },
  craters:  { base: '#686868', dark: '#484848', light: '#909090' },
  exotic:   { base: '#7A58B0', dark: '#5A3890', light: '#A080D0' },
};

function classifyBiome(name: string): string {
  const n = name.toLowerCase();
  if (n === 'ocean') return 'ocean';
  if (n.includes('frozen')) return 'frozen';
  if (n.includes('coniferous') || n.includes('deciduous')) return 'forest';
  if (n.includes('tropical')) return 'tropical';
  if (n.includes('savanna')) return 'savanna';
  if (n.includes('swamp') || n.includes('wetlands')) return 'swamp';
  if (n.includes('desert')) return 'desert';
  if (n.includes('volcanic')) return 'volcanic';
  if (n.includes('mountain') || n.includes('hills') || n.includes('plateau'))
    return 'rocky';
  if (n.includes('crater')) return 'craters';
  return 'exotic';
}

function biomePalette(
  biomes: { name: string; coverage: number }[],
): TypePalette | null {
  const land = biomes.filter((b) => classifyBiome(b.name) !== 'ocean');
  const total = land.reduce((s, b) => s + b.coverage, 0);
  if (total === 0) return null;

  let rB = 0, gB = 0, bB = 0;
  let rD = 0, gD = 0, bD = 0;
  let rL = 0, gL = 0, bL = 0;

  for (const biome of land) {
    const bp = BIOME_PALETTES[classifyBiome(biome.name)] ?? BIOME_PALETTES.exotic;
    const w = biome.coverage / total;
    const [rb, gb, bb] = hexToRgb(bp.base);
    rB += rb * w; gB += gb * w; bB += bb * w;
    const [rd, gd, bd] = hexToRgb(bp.dark);
    rD += rd * w; gD += gd * w; bD += bd * w;
    const [rl, gl, bl] = hexToRgb(bp.light);
    rL += rl * w; gL += gl * w; bL += bl * w;
  }

  return {
    base: rgbToHex(rB, gB, bB),
    dark: rgbToHex(rD, gD, bD),
    light: rgbToHex(rL, gL, bL),
  };
}

// ── Palette builder ──────────────────────────────────────────

interface PlanetPalette {
  base: string;
  dark: string;
  light: string;
  atmoColor: string;
  atmoDensity: number;
  waterColor: string;
}

function buildPalette(planet: PlanetData): PlanetPalette {
  const fallback = TYPE_PALETTES[planet.type] ?? TYPE_PALETTES.Rock;
  const tp =
    !GAS_TYPES.has(planet.type) && planet.biomes?.length
      ? biomePalette(planet.biomes) ?? fallback
      : fallback;
  const tint: [number, number, number] =
    TEMP_TINTS[planet.temperature] ?? [0, 0, 0];
  const atmo = parseAtmosphere(planet.atmosphere);

  return {
    base: tintColor(tp.base, tint),
    dark: tintColor(tp.dark, tint),
    light: tintColor(tp.light, tint),
    atmoColor: atmo.color,
    atmoDensity: atmo.density,
    waterColor: planet.biomes?.some((b) => b.name === 'Ocean')
      ? (WATER_COLORS[planet.water] ?? '')
      : '',
  };
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ZERO3: [number, number, number] = [0, 0, 0];

// ── GL helpers ───────────────────────────────────────────────

function compileShader(
  gl: ExpoWebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: ExpoWebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

// ── SVG wireframe fallback (old-GPU / simulator safety net) ──

function WireframeFallback({
  size,
  palette,
  seed,
}: {
  size: number;
  palette: PlanetPalette;
  seed: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastT = useRef(0);

  useEffect(() => {
    const tick = (t: number) => {
      if (lastT.current === 0) lastT.current = t;
      const dt = (t - lastT.current) / 1000;
      lastT.current = t;
      setPhase((p) => p + dt * 0.4);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hasAtmo = palette.atmoColor !== '';
  const lineColor = palette.light + '55';
  const lats = [-0.6, -0.3, 0, 0.3, 0.6];

  const lonCount = 5;
  const lons: number[] = [];
  for (let i = 0; i < lonCount; i++) {
    lons.push(((i / lonCount) * Math.PI + phase) % Math.PI);
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ alignSelf: 'center' }}
    >
      <Defs>
        <RadialGradient id="discGrad" cx="0.4" cy="0.35" r="0.65">
          <Stop offset="0" stopColor={palette.light} stopOpacity="0.9" />
          <Stop offset="0.7" stopColor={palette.base} stopOpacity="1" />
          <Stop offset="1" stopColor={palette.dark} stopOpacity="1" />
        </RadialGradient>
        <ClipPath id="discClip">
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
        {hasAtmo && (
          <RadialGradient id="atmoGrad" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0.7" stopColor={palette.atmoColor} stopOpacity="0" />
            <Stop offset="0.88" stopColor={palette.atmoColor} stopOpacity="0.15" />
            <Stop offset="1" stopColor={palette.atmoColor} stopOpacity="0" />
          </RadialGradient>
        )}
      </Defs>

      {hasAtmo && (
        <Circle cx={cx} cy={cy} r={r * 1.2} fill="url(#atmoGrad)" />
      )}

      <Circle cx={cx} cy={cy} r={r} fill="url(#discGrad)" />

      {lats.map((f, i) => {
        const ey = cy + f * r;
        const rx = Math.sqrt(Math.max(0, r * r - (f * r) * (f * r)));
        return (
          <Ellipse
            key={`lat-${i}`}
            cx={cx}
            cy={ey}
            rx={rx}
            ry={rx * 0.08}
            fill="none"
            stroke={lineColor}
            strokeWidth={1}
            clipPath="url(#discClip)"
          />
        );
      })}

      {lons.map((angle, i) => {
        const rx = Math.abs(Math.sin(angle)) * r;
        return (
          <Ellipse
            key={`lon-${i}`}
            cx={cx}
            cy={cy}
            rx={Math.max(rx, 1)}
            ry={r}
            fill="none"
            stroke={lineColor}
            strokeWidth={1}
            clipPath="url(#discClip)"
          />
        );
      })}

      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={palette.light + '44'}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// ── Component ────────────────────────────────────────────────

export function PlanetIllustration({ size = 200, planet }: Props) {
  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastTRef = useRef(0);

  const palette = useMemo(() => buildPalette(planet), [planet]);
  const seed = useMemo(() => hashString(planet.name) % 10000, [planet.name]);

  const dataRef = useRef({ palette, seed, planetType: planet.type });
  dataRef.current = { palette, seed, planetType: planet.type };

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = createProgram(gl, vs, fs);
    if (!prog) return;

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uSeed = gl.getUniformLocation(prog, 'u_seed');
    const uColor1 = gl.getUniformLocation(prog, 'u_color1');
    const uColor2 = gl.getUniformLocation(prog, 'u_color2');
    const uColor3 = gl.getUniformLocation(prog, 'u_color3');
    const uWaterCol = gl.getUniformLocation(prog, 'u_waterCol');
    const uHasWater = gl.getUniformLocation(prog, 'u_hasWater');
    const uAtmoCol = gl.getUniformLocation(prog, 'u_atmoCol');
    const uAtmoDens = gl.getUniformLocation(prog, 'u_atmoDens');
    const uPRadius = gl.getUniformLocation(prog, 'u_pRadius');
    const uGasGiant = gl.getUniformLocation(prog, 'u_gasGiant');

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    const render = (t: number) => {
      if (lastTRef.current === 0) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      timeRef.current += ROTATION_SPEED * dt;

      const { palette: pal, seed: s, planetType } = dataRef.current;
      const hasWater = pal.waterColor !== '';
      const hasAtmo = pal.atmoColor !== '';

      gl.useProgram(prog);
      gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(uTime, timeRef.current);
      gl.uniform1f(uSeed, s);
      gl.uniform3fv(uColor1, hexToNorm(pal.base));
      gl.uniform3fv(uColor2, hexToNorm(pal.dark));
      gl.uniform3fv(uColor3, hexToNorm(pal.light));
      gl.uniform3fv(uWaterCol, hasWater ? hexToNorm(pal.waterColor) : ZERO3);
      gl.uniform1f(uHasWater, hasWater ? 1.0 : 0.0);
      gl.uniform3fv(uAtmoCol, hasAtmo ? hexToNorm(pal.atmoColor) : ZERO3);
      gl.uniform1f(uAtmoDens, pal.atmoDensity);
      gl.uniform1f(uPRadius, planetType === 'Asteroid' ? 0.28 : 0.38);
      gl.uniform1f(uGasGiant, GAS_TYPES.has(planetType) ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.flush();
      gl.endFrameEXP();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const svgSize = Math.round(size * 0.85);
  const svgOffset = Math.round((size - svgSize) / 2);

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <View style={{ position: 'absolute', top: svgOffset, left: svgOffset }}>
        <WireframeFallback size={svgSize} palette={palette} seed={seed} />
      </View>
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}
