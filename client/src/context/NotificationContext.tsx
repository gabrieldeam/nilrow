import React, { createContext, useState, useCallback, ReactNode, memo } from 'react';
import { Notification, NotificationContextProps } from '../types/context/NotificationContext'; // Importa as interfaces

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationProviderComponent: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notification>({ message: '', type: 'success' });

  const setMessage = useCallback((newMessage: string, type: Notification['type'] = 'success') => {
    setNotification({ message: newMessage, type });
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, setMessage }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationProvider = memo(NotificationProviderComponent);
