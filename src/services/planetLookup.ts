import galaxy from '../data/json/galaxy.json';
import resources from '../data/json/resources.json';

export interface PlanetData {
  system: string;
  name: string;
  atmosphere: string;
  fauna: number;
  flora: number;
  gravity: number;
  hab_rank: number;
  magnetosphere: string;
  planet_length: number;
  temperature: string;
  type: string;
  water: string;
  biomes: { name: string; coverage: number }[];
  traits: string[];
  resources: string[];
  domesticable: { name: string; resource: string }[];
  gatherable: { name: string; resource: string }[];
}

export interface ResourceMeta {
  fullName: string;
  shortName: string;
  type: string;
  rarity: string;
}

interface SystemGroup {
  system: string;
  planets: PlanetData[];
}

const allPlanets = galaxy as PlanetData[];

let planetMap: Map<string, PlanetData> | null = null;
let resourceMap: Map<string, ResourceMeta> | null = null;
let systemGroups: SystemGroup[] | null = null;

function ensurePlanetMap(): Map<string, PlanetData> {
  if (!planetMap) {
    planetMap = new Map();
    for (const p of allPlanets) {
      planetMap.set(p.name, p);
    }
  }
  return planetMap;
}

function ensureResourceMap(): Map<string, ResourceMeta> {
  if (!resourceMap) {
    resourceMap = new Map();
    for (const r of resources as {
      resource: string;
      shortName: string;
      type: string;
      rarity: string;
    }[]) {
      resourceMap.set(r.shortName, {
        fullName: r.resource,
        shortName: r.shortName,
        type: r.type,
        rarity: r.rarity,
      });
    }
  }
  return resourceMap;
}

export function getPlanetByName(name: string): PlanetData | undefined {
  return ensurePlanetMap().get(name);
}

export function resolveResourceMeta(shortName: string): ResourceMeta | null {
  return ensureResourceMap().get(shortName) ?? null;
}

export function getSystemGroups(): SystemGroup[] {
  if (!systemGroups) {
    const map = new Map<string, PlanetData[]>();
    for (const p of allPlanets) {
      let list = map.get(p.system);
      if (!list) {
        list = [];
        map.set(p.system, list);
      }
      list.push(p);
    }
    systemGroups = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([system, planets]) => ({ system, planets }));
  }
  return systemGroups;
}
