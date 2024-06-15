import React, { createContext, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

const NotificationProviderComponent = ({ children }) => {
    const [notification, setNotification] = useState({ message: '', type: '' });

    const setMessage = useCallback((newMessage, type = 'success') => {
        setNotification({ message: newMessage, type });
    }, []);

    return (
        <NotificationContext.Provider value={{ notification, setMessage }}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationProviderComponent.propTypes = {
    children: PropTypes.node.isRequired,
};

export const NotificationProvider = memo(NotificationProviderComponent);
