export type CategoryGroup =
  | 'character'
  | 'weapons'
  | 'shipParts'
  | 'world'
  | 'items'
  | 'crafting';

export const categoryGroupLabels: Record<CategoryGroup, string> = {
  character: 'CHARACTER',
  weapons: 'WEAPONS & GEAR',
  shipParts: 'SHIP PARTS',
  world: 'WORLD',
  items: 'ITEMS',
  crafting: 'CRAFTING',
};

export const categoryGroupOrder: CategoryGroup[] = [
  'character',
  'weapons',
  'shipParts',
  'world',
  'items',
  'crafting',
];

export interface CategoryDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  group: CategoryGroup;
  data: () => Record<string, unknown>[];
  nameField: string;
  searchFields: string[];
  listFields: string[];
}

export interface SearchResult {
  item: Record<string, unknown>;
  categoryId: string;
  categoryLabel: string;
  index: number;
  score: number;
}
