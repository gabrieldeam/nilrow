import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';
import { checkAuth, logout } from '../services/api';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();

    useEffect(() => {
        const authenticate = async () => {
            try {
                const response = await checkAuth();
                setIsAuthenticated(response.isAuthenticated);
            } catch (error) {
                console.error('Erro na autenticação: ', error);
                setIsAuthenticated(false);
            }
        };
        authenticate();
    }, []);

    useEffect(() => {
        if (isAuthenticated && (window.location.pathname === '/login' || window.location.pathname === '/login-phone' || window.location.pathname.startsWith('/signup'))) {
            setMessage('Você já está autenticado.');
            navigate('/');
        }
    }, [isAuthenticated, navigate, setMessage]);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout: ', error);
        }
    }, [navigate]);

    return { isAuthenticated, handleLogout };
};

export default useAuth;
