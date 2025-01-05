import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation'; 
import { checkAuth, logout } from '../services/authService';
import { useNotification } from './useNotification';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setMessage } = useNotification();
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    const authenticate = async () => {
      try {
        const response = await checkAuth();
        setIsAuthenticated(response.isAuthenticated);
      } catch (error) {
        console.error('Erro na autenticação: ', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      ['/login', '/login-phone', '/signup', '/password-reset'].includes(pathname)
    ) {
      setMessage('Você já está autenticado.', 'info');
      router.push('/');
    }
  }, [isAuthenticated, pathname, router, setMessage]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout: ', error);
    }
  }, [router]);

  return { isAuthenticated, loading, handleLogout };
};
