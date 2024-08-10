import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../../hooks/useAuth';
import { isAdmin } from '../../../services/api';
import LoadingSpinner from '../../UI/LoadingSpinner/LoadingSpinner'; 

const AdminProtectedRoute = ({ element }) => {
    const { isAuthenticated, loading } = useAuth();
    const [isAdminUser, setIsAdminUser] = React.useState(null);

    React.useEffect(() => {
        const checkAdmin = async () => {
            if (isAuthenticated) {
                try {
                    const result = await isAdmin();
                    setIsAdminUser(result);
                } catch (error) {
                    setIsAdminUser(false);
                }
            }
        };
        checkAdmin();
    }, [isAuthenticated]);

    if (loading || isAdminUser === null) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return isAdminUser ? element : <Navigate to="/" replace />;
};

AdminProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
};

export default AdminProtectedRoute;
