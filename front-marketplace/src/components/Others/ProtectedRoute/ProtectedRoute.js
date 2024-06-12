import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../../hooks/useAuth';
import LoadingSpinner from '../../UI/LoadingSpinner/LoadingSpinner'; // Importe o LoadingSpinner

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />; // Utilize o componente LoadingSpinner aqui
    }

    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
};

export default ProtectedRoute;
