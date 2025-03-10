// src/context/LocationContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  memo,
  useContext
} from 'react';
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

  /**
   * Atualiza a localização no estado e no localStorage
   */
  const setLocation = useCallback(
    (newLocation: Location) => {
      console.log('Atualizando localização com:', newLocation);
      setLocationState(newLocation);
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      setMessage('Endereço trocado com sucesso.', 'success');
    },
    [setMessage]
  );

  /**
   * Busca latitude e longitude a partir do endereço via Google Geocoding
   */
  const fetchLatLng = useCallback(async (address: string): Promise<{ lat: number; lng: number }> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!API_KEY) {
        console.error('Google API key não foi encontrada no .env');
        return { lat: 0, lng: 0 };
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log('Dados do Google Geocoding para o endereço:', address, data);

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        console.error('Nenhum resultado encontrado para o endereço:', address);
        return { lat: 0, lng: 0 };
      }
    } catch (error) {
      console.error('Erro ao buscar latitude/longitude:', error);
      return { lat: 0, lng: 0 };
    }
  }, []);

  /**
   * Busca a localização inicial:
   * - Se houver dados no localStorage, usa-os e, se lat/lng forem zero, chama fetchLatLng para atualizar.
   * - Se não houver, utiliza ipapi para buscar o endereço e, em seguida, chama fetchLatLng para obter lat/lng.
   */
  const fetchLocation = useCallback(async () => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        const parsedLocation: Location = JSON.parse(savedLocation);
        console.log('Localização carregada do localStorage:', parsedLocation);

        // Se latitude ou longitude estiverem zeradas, atualize-os usando fetchLatLng
        if (parsedLocation.latitude === 0 || parsedLocation.longitude === 0) {
          const addressStr = `${parsedLocation.city}, ${parsedLocation.state}, ${parsedLocation.zip}`;
          console.log('Lat/Lng zerados, chamando fetchLatLng com:', addressStr);
          const { lat, lng } = await fetchLatLng(addressStr);
          parsedLocation.latitude = lat;
          parsedLocation.longitude = lng;
          setLocationState(parsedLocation);
          localStorage.setItem('userLocation', JSON.stringify(parsedLocation));
        } else {
          setLocationState(parsedLocation);
        }
      } else {
        // Caso não haja dados no localStorage, busca pelo ipapi
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('Dados retornados do ipapi:', data);

        // Cria a localização inicial sem lat/lng
        const initialLocation: Location = {
          city: data.city,
          state: data.region,
          latitude: 0,
          longitude: 0,
          zip: data.postal,
        };

        // Constrói a string do endereço e obtém lat/lng pelo Google Geocoding
        const addressStr = `${initialLocation.city}, ${initialLocation.state}, ${initialLocation.zip}`;
        console.log('Chamando fetchLatLng com o endereço:', addressStr);
        const { lat, lng } = await fetchLatLng(addressStr);
        initialLocation.latitude = lat;
        initialLocation.longitude = lng;

        setLocationState(initialLocation);
        localStorage.setItem('userLocation', JSON.stringify(initialLocation));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }, [fetchLatLng]);

  useEffect(() => {
    console.log('LocationProvider montado, buscando localização...');
    fetchLocation();
  }, [fetchLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        fetchLatLng
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const LocationProvider = memo(LocationProviderComponent);
