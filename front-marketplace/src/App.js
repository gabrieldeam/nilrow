import React, { useEffect, useContext, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import { HelmetProvider } from 'react-helmet-async';
import { NotificationProvider, NotificationContext } from './context/NotificationContext';
import { LocationProvider } from './context/LocationContext';
import Notification from './components/UI/Notification/Notification';
import ProtectedLoginRoute from './components/Others/ProtectedRoute/ProtectedLoginRoute';
import ProtectedRoute from './components/Others/ProtectedRoute/ProtectedRoute';
import MainHeader from './components/Main/MainHeader/MainHeader';
import AuthHeader from './components/Auth/AuthHeader/AuthHeader';
import AuthFooter from './components/Auth/AuthFooter/AuthFooter';
import MobileFooter from './components/Main/MobileFooter/MobileFooter';
import './styles/global.css';
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
const EmailValidatedSuccess = lazy(() => import('./pages/Auth/EmailValidatedSuccess/EmailValidatedSuccess'));
const EmailValidationFailed = lazy(() => import('./pages/Auth/EmailValidationFailed/EmailValidationFailed'));
const Orders = lazy(() => import('./pages/Main/Orders/Orders'));
const Blocked = lazy(() => import('./pages/Main/Blocked/Blocked'));
const Likes = lazy(() => import('./pages/Main/Likes/Likes'));
const Notifications = lazy(() => import('./pages/Main/Notifications/Notifications'));
const Data = lazy(() => import('./pages/Main/Data/Data'));

const AppContent = () => {
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
        const authRoutes = ['/login', '/login-phone', '/signup', '/signup/contact-forms', '/signup/personal-data', '/signup/create-password', '/password-reset', '/email-validated-success', '/email-validation-failed'];
        return authRoutes.includes(location.pathname) ? <AuthHeader /> : (!isMobile && <MainHeader />);
    };

    const renderFooter = () => {
        const authRoutes = ['/login', '/login-phone', '/signup', '/signup/contact-forms', '/signup/personal-data', '/signup/create-password', '/password-reset', '/email-validated-success', '/email-validation-failed'];
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
                        <ProtectedLoginRoute><Login /></ProtectedLoginRoute>
                    } />
                    <Route path="/login-phone" element={
                        <ProtectedLoginRoute><LoginPhone /></ProtectedLoginRoute>
                    } />
                    <Route path="/signup/*" element={
                        <ProtectedLoginRoute><Signup /></ProtectedLoginRoute>
                    } />
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/create" element={
                        <ProtectedRoute element={<Create />} />
                    } />
                    <Route path="/address" element={
                        <ProtectedRoute element={<Address />} />
                    } />
                    <Route path="/bag" element={
                        <ProtectedRoute element={<Bag />} />
                    } />
                    <Route path="/chat" element={
                        <ProtectedRoute element={<Chat />} />
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute element={<Profile />} />
                    } />
                    <Route path="/email-validated-success" element={<EmailValidatedSuccess />} />
                    <Route path="/email-validation-failed" element={<EmailValidationFailed />} />
                    <Route path="/orders" element={
                        <ProtectedRoute element={<Orders />} />
                    } />
                    <Route path="/blocked" element={
                        <ProtectedRoute element={<Blocked />} />
                    } />
                    <Route path="/likes" element={
                        <ProtectedRoute element={<Likes />} />
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute element={<Notifications />} />
                    } />
                    <Route path="/data" element={
                        <ProtectedRoute element={<Data />} />
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
                <HelmetProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </HelmetProvider>
            </LocationProvider>
        </NotificationProvider>
    );
}

export default App;
