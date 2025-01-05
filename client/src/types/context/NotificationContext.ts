export interface Notification {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }
  
  export interface NotificationContextProps {
    notification: Notification;
    setMessage: (message: string, type?: Notification['type']) => void;
  }
  