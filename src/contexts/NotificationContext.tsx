import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
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

  useEffect(() => {
    // Generate sample notifications for demo purposes
    if (user && notifications.length === 0) {
      generateSampleNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const storedNotifications = await AsyncStorage.getItem(`notifications_${user._id}`);
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
      }
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

  const generateSampleNotifications = () => {
    if (!user) return;

    const sampleNotifications: Notification[] = [];
    const now = new Date();

    if (user.role === 'admin') {
      // Admin notifications
      sampleNotifications.push(
        {
          id: '1',
          title: 'New User Registration',
          message: 'John Doe has been added to the system',
          type: 'info',
          isRead: false,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          userId: user._id,
        },
        {
          id: '2',
          title: 'Attendance Alert',
          message: '3 workers are absent today',
          type: 'warning',
          isRead: false,
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          userId: user._id,
        },
        {
          id: '3',
          title: 'Monthly Report Ready',
          message: 'December attendance report is ready for review',
          type: 'success',
          isRead: true,
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          userId: user._id,
        },
        {
          id: '4',
          title: 'System Update',
          message: 'System maintenance scheduled for tonight',
          type: 'system',
          isRead: false,
          createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          userId: user._id,
        },
        {
          id: '5',
          title: 'Salary Processing',
          message: 'Monthly salaries have been processed successfully',
          type: 'salary',
          isRead: true,
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          userId: user._id,
        }
      );
    } else {
      // Worker notifications
      sampleNotifications.push(
        {
          id: '1',
          title: 'Attendance Reminder',
          message: 'Don\'t forget to check in when you arrive',
          type: 'attendance',
          isRead: false,
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          userId: user._id,
        },
        {
          id: '2',
          title: 'Salary Slip Available',
          message: 'Your December salary slip is ready for download',
          type: 'salary',
          isRead: false,
          createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          userId: user._id,
        },
        {
          id: '3',
          title: 'Schedule Update',
          message: 'Your work schedule for next week has been updated',
          type: 'info',
          isRead: true,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          userId: user._id,
        },
        {
          id: '4',
          title: 'Holiday Notice',
          message: 'Office will be closed on New Year\'s Day',
          type: 'info',
          isRead: false,
          createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          userId: user._id,
        }
      );
    }

    setNotifications(sampleNotifications);
    saveNotifications(sampleNotifications);
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: user?._id,
    };

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