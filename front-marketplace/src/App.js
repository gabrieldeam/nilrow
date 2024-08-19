import React, { useEffect, useContext, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import { HelmetProvider } from 'react-helmet-async';
import { NotificationProvider, NotificationContext } from './context/NotificationContext';
import { LocationProvider } from './context/LocationContext';
import { SearchProvider } from './context/SearchContext';
import Notification from './components/UI/Notification/Notification';
import ProtectedLoginRoute from './components/Others/ProtectedRoute/ProtectedLoginRoute';
import ProtectedRoute from './components/Others/ProtectedRoute/ProtectedRoute';
import AdminProtectedRoute from './components/Others/ProtectedRoute/AdminProtectedRoute'; // Importe o novo AdminProtectedRoute
import NicknameRoute from './components/Others/ProtectedRoute/NicknameRoute';
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
const Bag = lazy(() => import('./pages/Main/Bag/Bag'));
const Chat = lazy(() => import('./pages/Main/Chat/Chat'));
const Profile = lazy(() => import('./pages/Main/Profile-Pages/Profile/Profile'));
const EmailValidatedSuccess = lazy(() => import('./pages/Auth/EmailValidatedSuccess/EmailValidatedSuccess'));
const EmailValidationFailed = lazy(() => import('./pages/Auth/EmailValidationFailed/EmailValidationFailed'));
const Data = lazy(() => import('./pages/Main/Profile-Pages/Data/Data'));
const Cards = lazy(() => import('./pages/Main/Profile-Pages/Cards/Cards'));
const Privacy = lazy(() => import('./pages/Main/Profile-Pages/Privacy/Privacy'));
const EditProfile = lazy(() => import('./pages/Main/Profile-Pages/EditProfile/EditProfile'));
const EditData = lazy(() => import('./pages/Main/Profile-Pages/EditData/EditData'));
const ZipCodeSearch = lazy(() => import('./pages/Main/ZipCodeSearch/ZipCodeSearch'));
const Address = lazy(() => import('./pages/Main/Profile-Pages/Address/Address'));
const AddAddress = lazy(() => import('./pages/Main/Profile-Pages/AddAddress/AddAddress'));
const EditAddress = lazy(() => import('./pages/Main/Profile-Pages/EditAddress/EditAddress'));
const AddChannel = lazy(() => import('./pages/Main/Channel-Pages/AddChannel/AddChannel'));
const EditChannel = lazy(() => import('./pages/Main/Channel-Pages/EditChannel/EditChannel'));
const MyChannel = lazy(() => import('./pages/Main/Channel-Pages/MyChannel/MyChannel'));
const AboutChannel = lazy(() => import('./pages/Main/Channel-Pages/AboutChannel/AboutChannel'));
const About = lazy(() => import('./pages/Main/Channel-Pages/About/About'));
const StoreSearch = lazy(() => import('./pages/Main/StoreSearch/StoreSearch'));
const MyFollowing = lazy(() => import('./pages/Main/Channel-Pages/MyFollowing/MyFollowing'));
const ChannelFollow = lazy(() => import('./pages/Main/Channel-Pages/ChannelFollow/ChannelFollow'));
const EditAbout = lazy(() => import('./pages/Main/Channel-Pages/EditAbout/EditAbout'));
const CreateAbout = lazy(() => import('./pages/Main/Channel-Pages/CreateAbout/CreateAbout'));
const AddFAQ = lazy(() => import('./pages/Main/Channel-Pages/AddFAQ/AddFAQ'));
const EditFAQ = lazy(() => import('./pages/Main/Channel-Pages/EditFAQ/EditFAQ'));
const Catalog = lazy(() => import('./pages/Main/Catalog-Pages/Catalog/Catalog'));
const AddCatalog = lazy(() => import('./pages/Main/Catalog-Pages/AddCatalog/AddCatalog'));
const Administration = lazy(() => import('./pages/Admin/Administration/Administration'));
const MyCatalog = lazy(() => import('./pages/Main/Catalog-Pages/MyCatalog/MyCatalog'));
const EditCatalog = lazy(() => import('./pages/Main/Catalog-Pages/EditCatalog/EditCatalog'));
const Visualization = lazy(() => import('./pages/Main/Catalog-Pages/Visualization/Visualization'));

const AppContent = () => {
    const { isAuthenticated } = useAuth();
    const { notification, setMessage } = useContext(NotificationContext);
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
        const authRoutes = [
            '/login', '/login-phone', '/signup', '/signup/contact-forms', '/signup/personal-data', '/signup/create-password', '/password-reset', 
            '/email-validated-success', '/email-validation-failed'
        ];
        return authRoutes.includes(location.pathname) ? <AuthHeader /> : (!isMobile && <MainHeader />);
    };

    const renderFooter = () => {
        const authRoutes = [
            '/login', '/login-phone', '/signup', '/signup/contact-forms', '/signup/personal-data', '/signup/create-password', '/password-reset', 
            '/email-validated-success', '/email-validation-failed'
        ];
        return authRoutes.includes(location.pathname) ? <AuthFooter /> : (isMobile && <MobileFooter />);
    };

    const renderAuthFooter = () => {
        const specificRoutes = [
            '/profile', '/edit-profile', '/data', '/edit-data', '/privacy', '/address', '/add-address'
        ];
        return specificRoutes.includes(location.pathname) && !isMobile ? <AuthFooter /> : null;
    };

    return (
        <>
            {renderHeader()}
            {notification.message && (
                <Notification
                    message={notification.message}
                    onClose={() => setMessage('')}
                    backgroundColor={notification.type === 'success' ? '#4FBF0A' : '#DF1414'}
                />
            )}
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/following" element={<Home initialSection="following" />} />
                    <Route path="/ontherise" element={<Home initialSection="ontherise" />} />
                    <Route path="/curation" element={<Home initialSection="curation" />} />
                    <Route path="/login" element={<ProtectedLoginRoute isAuthenticated={isAuthenticated}><Login /></ProtectedLoginRoute>} />
                    <Route path="/login-phone" element={<ProtectedLoginRoute isAuthenticated={isAuthenticated}><LoginPhone /></ProtectedLoginRoute>} />
                    <Route path="/signup/*" element={<ProtectedLoginRoute isAuthenticated={isAuthenticated}><Signup /></ProtectedLoginRoute>} />
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/create" element={<ProtectedRoute element={<Create />} />} />
                    <Route path="/address" element={<ProtectedRoute element={<Address />} />} />
                    <Route path="/bag" element={<ProtectedRoute element={<Bag />} />} />
                    <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
                    <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                    <Route path="/email-validated-success" element={<EmailValidatedSuccess />} />
                    <Route path="/email-validation-failed" element={<EmailValidationFailed />} />
                    <Route path="/data" element={<ProtectedRoute element={<Data />} />} />
                    <Route path="/cards" element={<ProtectedRoute element={<Cards />} />} />
                    <Route path="/privacy" element={<ProtectedRoute element={<Privacy />} />} />
                    <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile />} />} />
                    <Route path="/edit-data" element={<ProtectedRoute element={<EditData />} />} />
                    <Route path="/zip-code-search" element={<ZipCodeSearch />} />
                    <Route path="/add-address" element={<ProtectedRoute element={<AddAddress />} />} />
                    <Route path="/edit-address/:id" element={<ProtectedRoute element={<EditAddress />} />} />
                    <Route path="/add-channel" element={<ProtectedRoute element={<AddChannel />} />} />
                    <Route path="/edit-channel/:id" element={<ProtectedRoute element={<EditChannel />} />} />
                    <Route path="/*" element={<NicknameRoute />} />
                    <Route path="/my-channel" element={<ProtectedRoute element={<MyChannel />} />} />
                    <Route path="/about-channel" element={<ProtectedRoute element={<AboutChannel />} />}/>
                    <Route path="/store-search" element={<ProtectedRoute element={<StoreSearch />} />} />
                    <Route path="/my-following" element={<ProtectedRoute element={<MyFollowing />} />} />
                    <Route path="/channel-follow/:nickname" element={<ChannelFollow />}  />
                    <Route path="/:nickname/about" element={<About/>} />
                    <Route path="/edit-about" element={<ProtectedRoute element={<EditAbout/>} />} />
                    <Route path="/create-about" element={<ProtectedRoute element={<CreateAbout/>} />} />
                    <Route path="/add-faq" element={<ProtectedRoute element={<AddFAQ />} />} />
                    <Route path="/edit-faq/:id" element={<ProtectedRoute element={<EditFAQ/>} />} />
                    <Route path="/catalog" element={<ProtectedRoute element={<Catalog/>} />} />
                    <Route path="/add-catalog" element={<ProtectedRoute element={<AddCatalog/>} />} />
                    <Route path="/admin" element={<AdminProtectedRoute element={<Administration/>} />} /> 
                    <Route path="/my-catalog" element={<ProtectedRoute element={<MyCatalog />} />} />
                    <Route path="/edit-catalog/:id" element={<ProtectedRoute element={<EditCatalog/>} />} />
                    <Route path="/visualization" element={<ProtectedRoute element={<Visualization/>} />} />
                </Routes>
            </Suspense>
            {renderFooter()}
            {renderAuthFooter()}
        </>
    );
};

function App() {
    return (
        <NotificationProvider>
            <LocationProvider>
                <SearchProvider>
                    <HelmetProvider>
                        <Router>
                            <AppContent />
                        </Router>
                    </HelmetProvider>
                </SearchProvider>
            </LocationProvider>
        </NotificationProvider>
    );
}

export default App;
