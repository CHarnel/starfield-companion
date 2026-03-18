import galaxy from '../data/json/galaxy.json';
import stars from '../data/json/stars.json';
import resources from '../data/json/resources.json';

interface Planet {
  system: string;
  name: string;
  resources: string[];
  domesticable: { name: string; resource: string }[];
  gatherable: { name: string; resource: string }[];
}

interface Star {
  name: string;
  x: number;
  y: number;
  z: number;
}

interface ResourceDef {
  resource: string;
  shortName: string;
  type: 'organic' | 'inorganic' | 'manufactured';
  rarity: string;
}

export type SourceType = 'mineral' | 'fauna' | 'flora';

export interface ResourceSource {
  type: SourceType;
  name?: string;
}

export interface PlanetSource {
  planet: string;
  sources: ResourceSource[];
}

export interface SystemResult {
  system: string;
  distance: number;
  planets: PlanetSource[];
}

type Coords = { x: number; y: number; z: number };

interface IndexEntry {
  system: string;
  planet: string;
  source: ResourceSource;
}

const typedGalaxy = galaxy as unknown as Planet[];
const typedStars = stars as unknown as Star[];
const typedResources = resources as unknown as ResourceDef[];

let starCoords: Map<string, Coords> | null = null;
let reverseIndex: Map<string, IndexEntry[]> | null = null;

function getStarCoords(): Map<string, Coords> {
  if (starCoords) return starCoords;
  starCoords = new Map();
  for (const star of typedStars) {
    starCoords.set(star.name, { x: star.x, y: star.y, z: star.z });
  }
  return starCoords;
}

function getReverseIndex() {
  if (reverseIndex) return reverseIndex;
  reverseIndex = new Map();

  const organicOnPlanet = new Set<string>();

  for (const planet of typedGalaxy) {
    organicOnPlanet.clear();

    for (const entry of planet.domesticable) {
      const key = `${planet.name}::${entry.resource}`;
      organicOnPlanet.add(key);
      const entries = reverseIndex.get(entry.resource) ?? [];
      entries.push({ system: planet.system, planet: planet.name, source: { type: 'fauna', name: entry.name } });
      reverseIndex.set(entry.resource, entries);
    }
    for (const entry of planet.gatherable) {
      const key = `${planet.name}::${entry.resource}`;
      organicOnPlanet.add(key);
      const entries = reverseIndex.get(entry.resource) ?? [];
      entries.push({ system: planet.system, planet: planet.name, source: { type: 'flora', name: entry.name } });
      reverseIndex.set(entry.resource, entries);
    }

    for (const shortName of planet.resources) {
      const key = `${planet.name}::${shortName}`;
      if (organicOnPlanet.has(key)) continue;
      const entries = reverseIndex.get(shortName) ?? [];
      entries.push({ system: planet.system, planet: planet.name, source: { type: 'mineral' } });
      reverseIndex.set(shortName, entries);
    }
  }

  return reverseIndex;
}

function euclidean(a: Coords, b: Coords): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
}

export function findResource(resourceShortName: string, originSystem: string): SystemResult[] {
  const coords = getStarCoords();
  const index = getReverseIndex();

  const origin = coords.get(originSystem);
  if (!origin) return [];

  const entries = index.get(resourceShortName);
  if (!entries) return [];

  const systemMap = new Map<string, Map<string, ResourceSource[]>>();
  for (const entry of entries) {
    let planetMap = systemMap.get(entry.system);
    if (!planetMap) {
      planetMap = new Map();
      systemMap.set(entry.system, planetMap);
    }
    const sources = planetMap.get(entry.planet) ?? [];
    sources.push(entry.source);
    planetMap.set(entry.planet, sources);
  }

  const results: SystemResult[] = [];
  for (const [system, planetMap] of systemMap) {
    const systemCoords = coords.get(system);
    if (!systemCoords) continue;
    const planets: PlanetSource[] = [];
    for (const [planet, sources] of planetMap) {
      planets.push({ planet, sources });
    }
    results.push({
      system,
      distance: Math.round(euclidean(origin, systemCoords) * 100) / 100,
      planets,
    });
  }

  results.sort((a, b) => a.distance - b.distance);
  return results;
}

let locatableCache: ResourceDef[] | null = null;

export function getLocatableResources(): ResourceDef[] {
  if (locatableCache) return locatableCache;
  locatableCache = typedResources.filter((r) => r.type === 'organic' || r.type === 'inorganic');
  return locatableCache;
}

export function getAllSystemNames(): string[] {
  return typedStars.map((s) => s.name);
}
