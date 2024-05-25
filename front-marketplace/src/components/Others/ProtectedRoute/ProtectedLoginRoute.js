import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { NotificationContext } from '../../../context/NotificationContext';

const ProtectedLoginRoute = ({ children, isAuthenticated }) => {
    const { setMessage } = useContext(NotificationContext);

    useEffect(() => {
        if (isAuthenticated) {
            setMessage('Você já está logado');
        }
    }, [isAuthenticated, setMessage]);

    return isAuthenticated ? <Navigate to="/" /> : children;
};

export default ProtectedLoginRoute;
