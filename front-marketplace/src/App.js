import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login/Login';
import LoginPhone from './pages/Auth/LoginPhone/LoginPhone';
import Signup from './pages/Auth/Signup/Signup';
import PasswordReset from './pages/Auth/PasswordReset/PasswordReset';
import { NotificationProvider, NotificationContext } from './context/NotificationContext';
import Notification from './components/UI/Notification/Notification';
import ProtectedLoginRoute from './components/Others/ProtectedRoute/ProtectedLoginRoute';
import { checkAuth } from './services/api';
import './styles/global.css';

const AppContent = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { message, setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();

    useEffect(() => {
        const authenticate = async () => {
            try {
                const response = await checkAuth();
                if (response) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Erro na autenticação: ', error);
                setIsAuthenticated(false);
            }
        };
        authenticate();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000); // Duração da notificação
            return () => clearTimeout(timer); // Limpar o timer ao desmontar
        }
    }, [message, setMessage]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            {message && <Notification message={message} onClose={() => setMessage('')} backgroundColor="#4FBF0A" />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                    <ProtectedLoginRoute isAuthenticated={isAuthenticated}><Login /></ProtectedLoginRoute>
                    }
                />
                <Route path="/login-phone" element={
                    <ProtectedLoginRoute isAuthenticated={isAuthenticated}><LoginPhone /></ProtectedLoginRoute>
                    }
                />
                <Route path="/signup/*" element={<Signup />} />
                <Route path="/password-reset" element={<PasswordReset />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <NotificationProvider>
            <Router>
                <AppContent />
            </Router>
        </NotificationProvider>
    );
}

export default App;
