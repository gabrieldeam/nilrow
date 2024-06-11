import React, { createContext, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

const NotificationProviderComponent = ({ children }) => {
    const [message, setMessageState] = useState('');

    const setMessage = useCallback((newMessage) => {
        setMessageState(newMessage);
    }, []);

    return (
        <NotificationContext.Provider value={{ message, setMessage }}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationProviderComponent.propTypes = {
    children: PropTypes.node.isRequired,
};

export const NotificationProvider = memo(NotificationProviderComponent);
