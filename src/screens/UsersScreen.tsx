import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';
import { UserFormModal } from '../components/UserFormModal';
import { apiService } from '../services/api';
import { User } from '../types';

export const UsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('🔍 Loading users...');
      const response = await apiService.getUsers();
      console.log('🔍 Users API response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure
        const actualData = response.data.data || response.data;
        console.log('🔍 Actual users data:', actualData);
        
        if (Array.isArray(actualData)) {
          setUsers(actualData);
        } else {
          setUsers([]); // Set empty array if not an array
        }
      } else {
        setUsers([]); // Set empty array if no data
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]); // Set empty array on error
      Alert.alert(t('error'), t('failedToLoadUsers'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      t('deleteUser'),
      `${t('areYouSureDeleteUser')} ${userName}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteUser(userId),
        },
      ]
    );
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        setUsers(Array.isArray(users) ? users.filter(user => user._id !== userId) : []);
        Alert.alert(t('success'), t('userDeletedSuccessfully'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert(t('error'), t('failedToDeleteUser'));
    }
  };

  const openAddUserModal = useCallback(() => {
    setEditingUser(null);
    setShowUserModal(true);
  }, []);

  const openEditUserModal = useCallback((user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowUserModal(false);
    setEditingUser(null);
  }, []);

  const handleModalSave = useCallback(() => {
    setShowUserModal(false);
    setEditingUser(null);
    loadUsers(); // Reload users after save
  }, []);

  const UserCard: React.FC<{ user: User }> = React.memo(({ user }) => (
    <ThemedCard style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.secondary }]}>
            ID: {user.idCardNumber}
          </Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>
            {user.role === 'admin' ? t('admin') : t('worker')}
          </Text>
        </View>
      </View>

      {user.position && (
        <Text style={[styles.userPosition, { color: colors.secondary }]}>
          {user.position}
        </Text>
      )}

      {user.salary && (
        <Text style={[styles.userSalary, { color: colors.text }]}>
          {t('salary')}: ${user.salary}
        </Text>
      )}

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => openEditUserModal(user)}
        >
          <Ionicons name="create" size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>{t('edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteUser(user._id, user.name)}
        >
          <Ionicons name="trash" size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </ThemedCard>
  ));

  if (currentUser?.role !== 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={colors.secondary} />
          <Text style={[styles.accessDeniedText, { color: colors.text }]}>
            {t('accessDenied')}
          </Text>
          <Text style={[styles.accessDeniedSubtext, { color: colors.secondary }]}>
            {t('adminPrivilegesRequired')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('users')}
        </Text>
        <ThemedButton
          title={t('addUser')}
          onPress={openAddUserModal}
          size="small"
          style={styles.addButton}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.secondary }]}>
              {t('loading')}
            </Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('noData')}
            </Text>
          </View>
        ) : (
          Array.isArray(users) ? users.map((user) => <UserCard key={user._id} user={user} />) : null
        )}
      </ScrollView>

      <UserFormModal
        visible={showUserModal}
        editingUser={editingUser}
        onClose={closeModal}
        onSave={handleModalSave}
      />
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userPosition: {
    fontSize: 14,
    marginBottom: 8,
  },
  userSalary: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 0.45,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    marginTop: 8,
  },
});