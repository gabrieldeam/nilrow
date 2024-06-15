import React, { createContext, useState, useEffect, useCallback, memo } from 'react';

export const LocationContext = createContext();

const LocationProviderComponent = ({ children }) => {
    const [location, setLocationState] = useState({
        city: '',
        state: '',
        latitude: 0,
        longitude: 0,
        zip: ''
    });

    const setLocation = useCallback((newLocation) => {
        setLocationState(newLocation);
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
    }, []);

    const fetchLocation = useCallback(async () => {
        try {
            const savedLocation = localStorage.getItem('userLocation');
            if (savedLocation) {
                setLocationState(JSON.parse(savedLocation));
            } else {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const initialLocation = {
                    city: data.city,
                    state: data.region,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    zip: data.postal
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
