import whereToBuy from '../data/json/where_to_buy.json';
import { getStarCoords, euclidean } from './resourceLocator';

interface Vendor {
  npc: string;
  shop: string;
  location: string;
  system: string;
  qty: number;
  minLevel: number;
  chance: string;
}

export interface VendorResult extends Vendor {
  distance: number;
}

const typedData = whereToBuy as Record<string, { vendors: Vendor[] }>;

export function getVendorsForItem(itemName: string, originSystem: string): VendorResult[] {
  const entry = typedData[itemName];
  if (!entry?.vendors?.length) return [];

  const coords = getStarCoords();
  const origin = coords.get(originSystem);
  if (!origin) return [];

  const results: VendorResult[] = entry.vendors.map((v) => {
    const systemCoords = coords.get(v.system);
    const distance = systemCoords
      ? Math.round(euclidean(origin, systemCoords) * 100) / 100
      : Infinity;
    return { ...v, distance };
  });

  results.sort((a, b) => a.distance - b.distance);
  return results;
}
