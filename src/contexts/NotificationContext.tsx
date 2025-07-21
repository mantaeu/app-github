import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  titleKey: string; // Translation key for title
  messageKey: string; // Translation key for message
  messageParams?: Record<string, string>; // Parameters for message interpolation
  type: 'info' | 'success' | 'warning' | 'error' | 'attendance' | 'salary' | 'system';
  isRead: boolean;
  createdAt: string;
  userId?: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Clear any existing notifications to start fresh with new format
      await AsyncStorage.removeItem(`notifications_${user._id}`);
      
      // Add a test notification with simple keys
      const testNotification: Notification = {
        id: 'test_' + Date.now(),
        titleKey: 'welcome', // This should translate to "Welcome"
        messageKey: 'loading', // This should translate to "Loading..."
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: user._id,
        metadata: { type: 'test' }
      };
      
      setNotifications([testNotification]);
      await AsyncStorage.setItem(`notifications_${user._id}`, JSON.stringify([testNotification]));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async (notificationList: Notification[]) => {
    try {
      if (user) {
        await AsyncStorage.setItem(`notifications_${user._id}`, JSON.stringify(notificationList));
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: user?._id,
    };

    console.log('🔔 Adding notification:', newNotification.titleKey, '-', newNotification.messageKey);

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      return updated;
    });
  }, [user]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};