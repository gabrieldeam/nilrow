import React, { useContext, useEffect, useCallback, memo } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { NotificationContext } from '../../../context/NotificationContext';

const ProtectedLoginRoute = ({ isAuthenticated, children }) => {
    const { setMessage } = useContext(NotificationContext);

    useEffect(() => {
        if (isAuthenticated) {
            setMessage('Você já está autenticado.');
        }
    }, [isAuthenticated, setMessage]);

    const renderContent = useCallback(() => {
        if (isAuthenticated) {
            return <Navigate to="/" replace />;
        }
        return children;
    }, [isAuthenticated, children]);

    return renderContent();
};

ProtectedLoginRoute.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
};

export default memo(ProtectedLoginRoute);
