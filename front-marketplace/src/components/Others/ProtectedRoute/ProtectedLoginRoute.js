import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { NotificationContext } from '../../../context/NotificationContext';

const ProtectedLoginRoute = ({ isAuthenticated, children }) => {
    const { setMessage } = useContext(NotificationContext);

    if (isAuthenticated) {
        setMessage('Você já fez login');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedLoginRoute;
