import manifest from '../../docs/images/manifest.json';

const CDN_BASE = 'https://charnel.github.io/starfield-companion/images';

export type ItemType = 'weapon' | 'apparel' | 'consumable' | 'resource';

type SkillEntry = { tree: string; file: string; ranks: number[] };
type ItemEntry = { file: string; type: string };

const skills = manifest.skills as Record<string, SkillEntry>;
const items = manifest.items as Record<string, ItemEntry>;

export function getSkillImageUrl(
  skillName: string,
  rank: number = 0,
): string | null {
  const entry = skills[skillName];
  if (!entry || !entry.ranks.includes(rank)) return null;
  return `${CDN_BASE}/skills/${entry.file}_rank${rank}.png`;
}

export function getItemImageUrl(itemName: string): string | null {
  const entry = items[itemName];
  if (!entry) return null;
  return `${CDN_BASE}/items/${entry.file}`;
}

export function getItemType(itemName: string): ItemType | undefined {
  const entry = items[itemName];
  return entry?.type as ItemType | undefined;
}

export function hasSkillImage(skillName: string): boolean {
  const entry = skills[skillName];
  return !!entry && entry.ranks.length > 0;
}

export function hasItemImage(itemName: string): boolean {
  return itemName in items;
}

const categoryToImageType: Record<string, ItemType> = {
  weapons: 'weapon',
  pistols: 'weapon',
  shotguns: 'weapon',
  apparel: 'apparel',
  consumables: 'consumable',
  resources: 'resource',
};

export function getCategoryImageType(categoryId: string): ItemType | null {
  return categoryToImageType[categoryId] ?? null;
}
