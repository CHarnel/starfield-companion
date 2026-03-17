const keyCache = new Map<string, string>();

export function humanizeKey(key: string): string {
  const cached = keyCache.get(key);
  if (cached) return cached;

  const result = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  keyCache.set(key, result);
  return result;
}
