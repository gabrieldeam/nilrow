import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';
import { checkAuth } from '../services/api';

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
        if (isAuthenticated && (window.location.pathname === '/login' || window.location.pathname === '/login-phone')) {
            setMessage('Você já está autenticado.');
            navigate('/');
        }
    }, [isAuthenticated, navigate, setMessage]);

    return isAuthenticated;
};

export default useAuth;
