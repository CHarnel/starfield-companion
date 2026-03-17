import { useMemo } from 'react';
import { getCategory } from '../data/registry';

export function useCategory(id: string) {
  const category = useMemo(() => getCategory(id), [id]);
  const data = useMemo(() => category?.data() ?? [], [category]);

  return { category, data };
}
