import React, { createContext, useState, useEffect, useCallback, memo, useContext } from 'react';
import { Location, LocationContextProps } from '../types/context/LocationContext';
import { useNotification } from '../hooks/useNotification';

export const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const useLocationContext = (): LocationContextProps => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

const LocationProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<Location>({
    city: '',
    state: '',
    latitude: 0,
    longitude: 0,
    zip: '',
  });

  const { setMessage } = useNotification();

  const setLocation = useCallback((newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    setMessage('Endereço trocado com sucesso.', 'success');
  }, [setMessage]);

  const fetchLocation = useCallback(async () => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        setLocationState(JSON.parse(savedLocation));
      } else {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const initialLocation: Location = {
          city: data.city,
          state: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
          zip: data.postal,
        };
        setLocationState(initialLocation);
        localStorage.setItem('userLocation', JSON.stringify(initialLocation));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const LocationProvider = memo(LocationProviderComponent);
