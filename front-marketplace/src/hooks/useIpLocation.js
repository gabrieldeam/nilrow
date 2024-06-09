import { useState, useEffect } from 'react';

const useIpLocation = () => {
    const [location, setLocation] = useState({ city: '', zip: '' });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('http://ip-api.com/json/');
                const data = await response.json();
                if (data.status === 'success') {
                    setLocation({ city: data.city, zip: data.zip });
                }
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        };

        fetchLocation();
    }, []);

    return location;
};

export default useIpLocation;
