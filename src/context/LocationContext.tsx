import React, { createContext, useContext, useState, type ReactNode } from 'react';

const DEFAULT_SYSTEM = 'Alpha Centauri';

interface LocationContextValue {
  currentSystem: string;
  setCurrentSystem: (system: string) => void;
}

const LocationContext = createContext<LocationContextValue>({
  currentSystem: DEFAULT_SYSTEM,
  setCurrentSystem: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentSystem, setCurrentSystem] = useState(DEFAULT_SYSTEM);

  return (
    <LocationContext.Provider value={{ currentSystem, setCurrentSystem }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
