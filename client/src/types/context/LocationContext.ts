// src/types/context/LocationContext.ts

export interface Location {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  zip: string;
}

export interface LocationContextProps {
  location: Location;
  setLocation: (location: Location) => void;

  // A propriedade fetchLatLng PRECISA estar definida aqui:
  fetchLatLng: (address: string) => Promise<{ lat: number; lng: number }>;
}
