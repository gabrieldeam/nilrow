import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login/Login';
import LoginPhone from './pages/Auth/LoginPhone/LoginPhone';
import Signup from './pages/Auth/Signup/Signup';
import PasswordReset from './pages/Auth/PasswordReset/PasswordReset';
import { NotificationProvider, NotificationContext } from './context/NotificationContext';
import Notification from './components/UI/Notification/Notification';
import ProtectedLoginRoute from './components/Others/ProtectedRoute/ProtectedLoginRoute';
import './styles/global.css';
import useAuth from './hooks/useAuth';

const AppContent = () => {
    const isAuthenticated = useAuth();
    const { message, setMessage } = useContext(NotificationContext);

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
                <Route path="/signup/*" element={
                    <ProtectedLoginRoute isAuthenticated={isAuthenticated}><Signup /></ProtectedLoginRoute>
                    }
                />
                <Route path="/password-reset" element={<PasswordReset />} />
            </Routes>
        </>
    );
};

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
