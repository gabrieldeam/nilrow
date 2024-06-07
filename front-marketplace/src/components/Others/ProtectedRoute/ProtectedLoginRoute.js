import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { NotificationContext } from '../../../context/NotificationContext';

const ProtectedLoginRoute = ({ isAuthenticated, children }) => {
    const { setMessage } = useContext(NotificationContext);

    useEffect(() => {
        if (isAuthenticated) {
            setMessage('Você já está autenticado.');
        }
    }, [isAuthenticated, setMessage]);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default ProtectedLoginRoute;
