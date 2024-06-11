import React, { useEffect, useContext, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import { NotificationProvider, NotificationContext } from './context/NotificationContext';
import { LocationProvider } from './context/LocationContext';
import Notification from './components/UI/Notification/Notification';
import ProtectedLoginRoute from './components/Others/ProtectedRoute/ProtectedLoginRoute';
import ProtectedLink from './components/Others/ProtectedRoute/ProtectedLink';
import MainHeader from './components/Main/MainHeader/MainHeader';
import AuthHeader from './components/Auth/AuthHeader/AuthHeader';
import AuthFooter from './components/Auth/AuthFooter/AuthFooter';
import MobileFooter from './components/Main/MobileFooter/MobileFooter';
import './styles/global.css';
import useAuth from './hooks/useAuth';
import LoadingSpinner from './components/UI/LoadingSpinner/LoadingSpinner';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Auth/Login/Login'));
const LoginPhone = lazy(() => import('./pages/Auth/LoginPhone/LoginPhone'));
const Signup = lazy(() => import('./pages/Auth/Signup/Signup'));
const PasswordReset = lazy(() => import('./pages/Auth/PasswordReset/PasswordReset'));
const Search = lazy(() => import('./pages/Main/Search/Search'));
const Create = lazy(() => import('./pages/Main/Create/Create'));
const Address = lazy(() => import('./pages/Main/Address/Address'));
const Bag = lazy(() => import('./pages/Main/Bag/Bag'));
const Chat = lazy(() => import('./pages/Main/Chat/Chat'));
const Profile = lazy(() => import('./pages/Main/Profile/Profile'));

const AppContent = () => {
    const { isAuthenticated } = useAuth();
    const { message, setMessage } = useContext(NotificationContext);
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        ReactGA.initialize('UA-000000-01');
        ReactGA.pageview(window.location.pathname + window.location.search);

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderHeader = () => {
        const authRoutes = ['/login', '/login-phone', '/signup', '/signup/contact-forms', '/signup/personal-data', '/signup/create-password', '/password-reset'];
        return authRoutes.includes(location.pathname) ? <AuthHeader /> : (!isMobile && <MainHeader />);
    };

    const renderFooter = () => {
        const authRoutes = ['/login', '/login-phone', '/signup', '/signup/contact-forms', '/signup/personal-data', '/signup/create-password', '/password-reset'];
        return authRoutes.includes(location.pathname) ? <AuthFooter /> : (isMobile && <MobileFooter />);
    };

    return (
        <>
            {renderHeader()}
            {message && <Notification message={message} onClose={() => setMessage('')} backgroundColor="#4FBF0A" />}
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={
                        <ProtectedLoginRoute isAuthenticated={isAuthenticated}><Login /></ProtectedLoginRoute>
                    } />
                    <Route path="/login-phone" element={
                        <ProtectedLoginRoute isAuthenticated={isAuthenticated}><LoginPhone /></ProtectedLoginRoute>
                    } />
                    <Route path="/signup/*" element={
                        <ProtectedLoginRoute isAuthenticated={isAuthenticated}><Signup /></ProtectedLoginRoute>
                    } />
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/create" element={
                        <ProtectedLink to="/create">
                            <Create />
                        </ProtectedLink>
                    } />
                    <Route path="/address" element={
                        <ProtectedLink to="/address">
                            <Address />
                        </ProtectedLink>
                    } />
                    <Route path="/bag" element={
                        <ProtectedLink to="/bag">
                            <Bag />
                        </ProtectedLink>
                    } />
                    <Route path="/chat" element={
                        <ProtectedLink to="/chat">
                            <Chat />
                        </ProtectedLink>
                    } />
                    <Route path="/profile" element={
                        <ProtectedLink to="/profile">
                            <Profile />
                        </ProtectedLink>
                    } />
                </Routes>
            </Suspense>
            {renderFooter()}
        </>
    );
};

function App() {
    return (
        <NotificationProvider>
            <LocationProvider>
                <Router>
                    <AppContent />
                </Router>
            </LocationProvider>
        </NotificationProvider>
    );
}

export default App;
