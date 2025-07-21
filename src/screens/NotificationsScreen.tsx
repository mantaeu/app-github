import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';

export const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loading,
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'attendance':
        return 'time-outline';
      case 'salary':
        return 'card-outline';
      case 'success':
        return 'checkmark-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'close-circle-outline';
      case 'system':
        return 'settings-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'attendance':
        return '#3B82F6';
      case 'salary':
        return '#10B981';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'system':
        return '#8B5CF6';
      default:
        return colors.primary;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('justNow');
    if (diffInMinutes < 60) return `${diffInMinutes}m ${t('ago')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ${t('ago')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ${t('ago')}`;
    
    return date.toLocaleDateString();
  };

  // Helper function to translate notification messages with parameters
  const translateNotificationMessage = (messageKey: string, params?: Record<string, string>) => {
    try {
      if (!messageKey) {
        console.log('❌ No messageKey provided');
        return 'No message';
      }
      
      console.log('🔍 Translating messageKey:', messageKey);
      let translatedMessage = t(messageKey as any);
      console.log('📝 Translation result:', translatedMessage);
      
      // If translation not found, return the key itself
      if (!translatedMessage || translatedMessage === messageKey) {
        console.log('⚠️ Translation not found for:', messageKey);
        translatedMessage = messageKey;
      }
      
      // Replace parameters in the message if they exist
      if (params && Object.keys(params).length > 0) {
        console.log('🔄 Replacing params:', params);
        Object.entries(params).forEach(([key, value]) => {
          translatedMessage = translatedMessage.replace(`{${key}}`, value || '');
        });
      }
      
      console.log('✅ Final message:', translatedMessage);
      return translatedMessage;
    } catch (error) {
      console.error('❌ Error translating message:', error);
      return messageKey || 'Translation error';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = (notification: Notification) => {
    Alert.alert(
      t('deleteNotification'),
      t('areYouSureDeleteNotification'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      t('clearAllNotifications'),
      t('areYouSureClearAllNotifications'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
    console.log('🔔 Rendering notification:', notification);
    
    const titleTranslation = t(notification.titleKey as any);
    console.log('📋 Title translation for', notification.titleKey, ':', titleTranslation);
    
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(notification)}>
        <ThemedCard style={[
          styles.notificationCard,
          !notification.isRead && { backgroundColor: colors.primary + '05' }
        ]}>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <View style={[
                styles.notificationIcon,
                { backgroundColor: getNotificationColor(notification.type) + '15' }
              ]}>
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={20}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={[
                  styles.notificationTitle,
                  { color: colors.text },
                  !notification.isRead && { fontWeight: '700' }
                ]}>
                  {titleTranslation || notification.titleKey || 'No Title'}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.secondary }]}>
                  {formatTimeAgo(notification.createdAt)}
                </Text>
              </View>
              {!notification.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
              <TouchableOpacity
                onPress={() => handleDeleteNotification(notification)}
                style={styles.deleteButton}
              >
                <Ionicons name="close" size={18} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.notificationMessage, { color: colors.secondary }]}>
              {translateNotificationMessage(notification.messageKey, notification.messageParams)}
            </Text>
          </View>
        </ThemedCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('notifications')}
        </Text>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <View style={styles.actionButtons}>
          {unreadCount > 0 && (
            <ThemedButton
              title={t('markAllRead')}
              onPress={markAllAsRead}
              size="small"
              variant="outline"
              style={styles.actionButton}
            />
          )}
          <ThemedButton
            title={t('clearAll')}
            onPress={handleClearAll}
            size="small"
            variant="outline"
            style={[styles.actionButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {}} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.secondary }]}>
              {t('loading')}
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('noNotifications')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {t('notificationsWillAppearHere')}
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unreadBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationsList: {
    paddingBottom: 20,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 48,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});