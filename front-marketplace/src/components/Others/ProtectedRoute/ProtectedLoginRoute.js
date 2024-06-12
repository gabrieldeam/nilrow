import React, { useContext, useEffect, useCallback, memo } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { NotificationContext } from '../../../context/NotificationContext';
import useAuth from '../../../hooks/useAuth';
import LoadingSpinner from '../../UI/LoadingSpinner/LoadingSpinner'; // Importe o LoadingSpinner

const ProtectedLoginRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const { setMessage } = useContext(NotificationContext);

    useEffect(() => {
        if (isAuthenticated) {
            setMessage('Você já está autenticado.');
        }
    }, [isAuthenticated, setMessage]);

    const renderContent = useCallback(() => {
        if (loading) {
            return <LoadingSpinner />; // Utilize o componente LoadingSpinner aqui
        }

        if (isAuthenticated) {
            return <Navigate to="/" replace />;
        }

        return children;
    }, [isAuthenticated, loading, children]);

    return renderContent();
};

ProtectedLoginRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default memo(ProtectedLoginRoute);
