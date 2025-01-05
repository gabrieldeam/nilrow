'use client';

import './globals.css';
import { NotificationProvider } from '../context/NotificationContext';
import { LocationProvider } from '../context/LocationContext';
import { SearchProvider } from '../context/SearchContext';
import { AuthProvider } from '../context/AuthContext';
import { LoadingProvider } from '../context/LoadingContext';
import Notification from '../components/UI/Notification/Notification';
import { useNotification } from '../hooks/useNotification';
import MainHeader from '../components/Layout/MainHeader/MainHeader';
import AuthHeader from '../components/Layout/AuthHeader/AuthHeader';
import MobileFooter from '../components/Layout/MobileFooter/MobileFooter';
import AuthFooter from '../components/Layout/AuthFooter/AuthFooter';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';


const AUTH_ROUTES = [
  '/login',
  '/login-phone',
  '/signup',
  '/signup/contact-forms',
  '/signup/personal-data',
  '/signup/create-password',
  '/password-reset',
  '/email-validated-success',
  '/email-validation-failed',
];

const SPECIFIC_ROUTES = [
  '/profile',
  '/edit-profile',
  '/data',
  '/edit-data',
  '/privacy',
  '/address',
  '/add-address',
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderHeader = () => {
    if (AUTH_ROUTES.includes(pathname)) {
      return <AuthHeader />;
    }
    return !isMobile && <MainHeader />;
  };

  const renderFooter = () => {
    if (AUTH_ROUTES.includes(pathname)) {
      return <AuthFooter />;
    }
    return isMobile && <MobileFooter />;
  };

  const renderAuthFooter = () => {
    if (SPECIFIC_ROUTES.includes(pathname) && !isMobile) {
      return <AuthFooter />;
    }
    return null;
  };

  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <LocationProvider>
            <SearchProvider>
              <AuthProvider>
                <LoadingProvider>
                  <NotificationWrapper>
                    {renderHeader()}
                    <main>{children}</main>
                    {renderFooter()}
                    {renderAuthFooter()}
                  </NotificationWrapper>
                </LoadingProvider>
              </AuthProvider>
            </SearchProvider>
          </LocationProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  const { notification, setMessage } = useNotification();

  return (
    <>
      {notification.message && (
        <Notification
          message={notification.message}
          onClose={() => setMessage('')}
          backgroundColor={notification.type === 'success' ? '#4FBF0A' : '#DF1414'}
        />
      )}
      {children}
    </>
  );
}
