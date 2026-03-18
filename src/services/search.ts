import Fuse from 'fuse.js';
import { categories } from '../data/registry';
import { SearchResult } from '../data/types';

interface IndexedItem {
  _categoryId: string;
  _categoryLabel: string;
  _index: number;
  _displayName: string;
  [key: string]: unknown;
}

let fuse: Fuse<IndexedItem> | null = null;
let allItems: IndexedItem[] | null = null;

function buildIndex(): { fuse: Fuse<IndexedItem>; items: IndexedItem[] } {
  const items: IndexedItem[] = [];
  const allSearchFields = new Set<string>();

  for (const cat of categories) {
    const data = cat.data();
    for (const field of cat.searchFields) {
      allSearchFields.add(field);
    }

    data.forEach((item, index) => {
      items.push({
        ...item,
        _categoryId: cat.id,
        _categoryLabel: cat.label,
        _index: index,
        _displayName: String(item[cat.nameField] ?? ''),
      });
    });
  }

  const instance = new Fuse(items, {
    keys: ['_displayName', ...allSearchFields],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return { fuse: instance, items };
}

function ensureIndex() {
  if (!fuse || !allItems) {
    const result = buildIndex();
    fuse = result.fuse;
    allItems = result.items;
  }
  return { fuse: fuse!, items: allItems! };
}

export function search(query: string, limit = 50): SearchResult[] {
  if (!query || query.length < 2) return [];

  const { fuse: index } = ensureIndex();
  const results = index.search(query, { limit });

  return results.map((r) => ({
    item: r.item as Record<string, unknown>,
    categoryId: r.item._categoryId,
    categoryLabel: r.item._categoryLabel,
    index: r.item._index,
    score: r.score ?? 1,
  }));
}