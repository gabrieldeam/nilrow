import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login/Login';
import LoginPhone from './pages/Auth/LoginPhone/LoginPhone';
import Signup from './pages/Auth/Signup/Signup';
import PasswordReset from './pages/Auth/PasswordReset/PasswordReset';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/Others/ProtectedRoute/ProtectedLoginRoute'; 
import './styles/global.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <NotificationProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}><Login /></ProtectedRoute>
                        }
                    />
                    <Route path="/login-phone" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}><LoginPhone /></ProtectedRoute>
                        }
                    />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/password-reset" element={<PasswordReset />} />
                </Routes>
            </Router>
        </NotificationProvider>
    );
}

export default App;
