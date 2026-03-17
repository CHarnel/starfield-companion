import { useState, useMemo } from 'react';
import { CategoryDefinition } from '../data/types';

export function useFilteredList(
  data: Record<string, unknown>[],
  category: CategoryDefinition | undefined
) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter || !category) return data;
    const lowerFilter = filter.toLowerCase();
    return data.filter((item) => {
      const name = String(item[category.nameField] ?? '').toLowerCase();
      if (name.includes(lowerFilter)) return true;
      return category.searchFields.some((field) =>
        String(item[field] ?? '').toLowerCase().includes(lowerFilter)
      );
    });
  }, [data, filter, category]);

  return { filter, setFilter, filtered };
}
