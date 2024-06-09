// LocationContext.js
import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState({
        city: '',
        state: '',
        latitude: 0,
        longitude: 0,
        zip: ''
    });

    useEffect(() => {
        const fetchLocation = async () => {
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
        };

        fetchLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ location }}>
            {children}
        </LocationContext.Provider>
    );
};
