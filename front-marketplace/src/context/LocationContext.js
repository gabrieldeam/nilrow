import React, { createContext, useState, useEffect, useCallback, memo } from 'react';

export const LocationContext = createContext();

const LocationProviderComponent = ({ children }) => {
    const [location, setLocation] = useState({
        city: '',
        state: '',
        latitude: 0,
        longitude: 0,
        zip: ''
    });

    const fetchLocation = useCallback(async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            setLocation({
                city: data.city,
                state: data.region,
                latitude: data.latitude,
                longitude: data.longitude,
                zip: data.postal
            });
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    }, []);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return (
        <LocationContext.Provider value={{ location }}>
            {children}
        </LocationContext.Provider>
    );
};

export const LocationProvider = memo(LocationProviderComponent);
