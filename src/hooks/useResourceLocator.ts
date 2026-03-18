import { useState, useEffect, useMemo } from 'react';
import {
  findResource,
  getLocatableResources,
  getAllSystemNames,
  SystemResult,
} from '../services/resourceLocator';

const DEFAULT_ORIGIN = 'Alpha Centauri';

export function useResourceLocator() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [originSystem, setOriginSystem] = useState(DEFAULT_ORIGIN);
  const [results, setResults] = useState<SystemResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const locatableResources = useMemo(() => getLocatableResources(), []);
  const systemNames = useMemo(() => getAllSystemNames(), []);

  useEffect(() => {
    if (!selectedResource) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const id = setTimeout(() => {
      const found = findResource(selectedResource, originSystem);
      setResults(found);
      setIsSearching(false);
    }, 0);

    return () => clearTimeout(id);
  }, [selectedResource, originSystem]);

  return {
    selectedResource,
    setResource: setSelectedResource,
    originSystem,
    setOrigin: setOriginSystem,
    results,
    isSearching,
    locatableResources,
    systemNames,
  };
}
