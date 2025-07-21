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
import { SearchBar } from '../components/SearchBar';
import { UserFormModal } from '../components/UserFormModal';
import { apiService } from '../services/api';
import { User } from '../types';
import { getTranslatedMonth, getCurrentMonthNumber, getCurrentMonthName } from '../utils/dateUtils';

export const UsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        if (Array.isArray(actualData)) {
          setUsers(actualData);
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      Alert.alert(t('error'), t('failedToLoadUsers'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(user => {
      // Safe string operations with fallback to empty string
      const name = (user?.name || '').toLowerCase();
      const email = (user?.email || '').toLowerCase();
      const position = (user?.position || '').toLowerCase();
      const idCardNumber = (user?.idCardNumber || '').toLowerCase();
      const phone = (user?.phone || '').toLowerCase();
      const role = (user?.role || '').toLowerCase();

      return name.includes(query) ||
             email.includes(query) ||
             position.includes(query) ||
             idCardNumber.includes(query) ||
             phone.includes(query) ||
             role.includes(query);
    });
    setFilteredUsers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const deleteUser = (userId: string, userName: string) => {
    Alert.alert(
      t('deleteUser'),
      `${t('areYouSureDeleteUser')} ${userName}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => confirmDeleteUser(userId),
        },
      ]
    );
  };

  /* Salary checkout functionality temporarily disabled */
  /*
  const handleCheckout = (userId: string, userName: string) => {
    const currentDate = new Date();
    const currentMonthNumber = getCurrentMonthNumber();
    const currentMonthName = getCurrentMonthName();
    const currentYear = currentDate.getFullYear();

    Alert.alert(
      t('checkoutSalary'),
      t('processSalaryCheckout', { 
        name: userName, 
        month: t(getTranslatedMonth(currentMonthNumber)), 
        year: currentYear.toString() 
      }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('checkout'),
          style: 'default',
          onPress: () => processCheckout(userId, userName, currentMonthName, currentYear),
        },
      ]
    );
  };

  const processCheckout = async (userId: string, userName: string, month: string, year: number) => {
    try {
      setLoading(true);
      const response = await apiService.checkoutMonthlySalary(userId, month, year);
      
      if (response.success) {
        Alert.alert(
          t('success'),
          t('salaryCheckoutCompleted', { name: userName }),
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          t('error'),
          response.error || t('failedToProcessCheckout')
        );
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      Alert.alert(
        t('error'),
        t('errorProcessingCheckout')
      );
    } finally {
      setLoading(false);
    }
  };
  */

  const confirmDeleteUser = async (userId: string) => {
    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        Alert.alert(t('success'), t('userDeletedSuccessfully'));
        loadUsers(); // Reload users after deletion
      } else {
        Alert.alert(t('error'), response.error || t('failedToDeleteUser'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert(t('error'), t('failedToDeleteUser'));
    }
  };

  const handleUserSaved = useCallback(() => {
    setShowUserModal(false);
    setEditingUser(null);
    loadUsers(); // Reload users after save
  }, []);

  const UserCard: React.FC<{ user: User }> = React.memo(({ user }) => (
    <ThemedCard style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || 'Unknown User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.secondary }]}>
            {user?.email || 'No email'}
          </Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleTag, { 
              backgroundColor: user?.role === 'admin' ? colors.warning : colors.success 
            }]}>
              <Text style={styles.roleText}>
                {user?.role === 'admin' ? t('admin') : t('worker')}
              </Text>
            </View>
            {user?.position && (
              <Text style={[styles.userPosition, { color: colors.secondary }]}>
                {user.position}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Salary display temporarily disabled */}
      {/* {user?.salary && (
        <Text style={[styles.userSalary, { color: colors.text }]}>
          {t('dailyRate')}: {user.salary} DH/{t('perDay')}
        </Text>
      )} */}

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => openEditUserModal(user)}
        >
          <Ionicons name="pencil" size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>{t('edit')}</Text>
        </TouchableOpacity>

        {/* Salary checkout temporarily disabled */}
        {/* {user?.role === 'worker' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => handleCheckout(user._id, user.name || 'User')}
          >
            <Ionicons name="card" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>{t('checkout')}</Text>
          </TouchableOpacity>
        )} */}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => deleteUser(user._id, user.name || 'User')}
        >
          <Ionicons name="trash" size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </ThemedCard>
  ));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('users')}
        </Text>
        
        {user?.role === 'admin' && (
          <ThemedButton
            title={t('addUser')}
            onPress={openAddUserModal}
            size="small"
            style={styles.addButton}
          />
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`${t('search')} ${t('users').toLowerCase()}...`}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.secondary }]}>
              {t('loading')}
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? `No users found for "${searchQuery}"` : t('noData')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {searchQuery ? 'Try a different search term' : (user?.role === 'admin' ? t('addUser') : t('noData'))}
            </Text>
          </View>
        ) : (
          <>
            {searchQuery && (
              <View style={styles.searchResults}>
                <Text style={[styles.searchResultsText, { color: colors.secondary }]}>
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </Text>
              </View>
            )}
            {filteredUsers.map((userItem) => (
              <UserCard key={userItem._id} user={userItem} />
            ))}
          </>
        )}
      </ScrollView>

      <UserFormModal
        visible={showUserModal}
        editingUser={editingUser}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSave={handleUserSaved}
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
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchResults: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  searchResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
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
    fontSize: 18,
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
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userPosition: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  userSalary: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});