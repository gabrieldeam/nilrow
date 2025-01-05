export interface Location {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    zip: string;
  }
  
  export interface LocationContextProps {
    location: Location;
    setLocation: (newLocation: Location) => void;
  }
  