import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';
import { apiService } from '../services/api';
import { User } from '../types';

export const UsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker',
    position: '',
    salary: '',
    hourlyRate: '',
    phone: '',
    address: '',
  });

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
      Alert.alert(t('error'), 'Failed to load users');
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
      `Are you sure you want to delete ${userName}?`,
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
        Alert.alert(t('success'), 'User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert(t('error'), 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'worker',
      position: '',
      salary: '',
      hourlyRate: '',
      phone: '',
      address: '',
    });
    setEditingUser(null);
  };

  const openAddUserModal = () => {
    resetForm();
    setShowUserModal(true);
  };

  const openEditUserModal = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      position: user.position || '',
      salary: user.salary?.toString() || '',
      hourlyRate: user.hourlyRate?.toString() || '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert(t('error'), 'Name and email are required');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      Alert.alert(t('error'), 'Password is required for new users');
      return;
    }

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        position: formData.position.trim() || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        ...(formData.password.trim() && { password: formData.password }),
      };

      let response;
      if (editingUser) {
        response = await apiService.updateUser(editingUser._id, userData);
      } else {
        response = await apiService.createUser({ ...userData, password: formData.password });
      }

      if (response.success) {
        Alert.alert(t('success'), editingUser ? 'User updated successfully' : 'User created successfully');
        setShowUserModal(false);
        resetForm();
        loadUsers();
      } else {
        Alert.alert(t('error'), response.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert(t('error'), 'Failed to save user');
    }
  };

  const UserFormModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowUserModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowUserModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingUser ? 'Edit User' : 'Add User'}
          </Text>
          <TouchableOpacity onPress={handleSaveUser}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter full name"
              placeholderTextColor={colors.secondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email address"
              placeholderTextColor={colors.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Password {!editingUser && '*'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
              placeholderTextColor={colors.secondary}
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  { backgroundColor: formData.role === 'worker' ? colors.primary : colors.card },
                ]}
                onPress={() => setFormData({ ...formData, role: 'worker' })}
              >
                <Text style={[styles.roleText, { color: formData.role === 'worker' ? '#ffffff' : colors.text }]}>
                  Worker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  { backgroundColor: formData.role === 'admin' ? colors.primary : colors.card },
                ]}
                onPress={() => setFormData({ ...formData, role: 'admin' })}
              >
                <Text style={[styles.roleText, { color: formData.role === 'admin' ? '#ffffff' : colors.text }]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Position</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.position}
              onChangeText={(text) => setFormData({ ...formData, position: text })}
              placeholder="Enter job position"
              placeholderTextColor={colors.secondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Monthly Salary</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.salary}
              onChangeText={(text) => setFormData({ ...formData, salary: text })}
              placeholder="Enter monthly salary"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Hourly Rate</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.hourlyRate}
              onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
              placeholder="Enter hourly rate"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor={colors.secondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter address"
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
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
            {user.email}
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
  );

  if (currentUser?.role !== 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={colors.secondary} />
          <Text style={[styles.accessDeniedText, { color: colors.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.accessDeniedSubtext, { color: colors.secondary }]}>
            Admin privileges required
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

      <UserFormModal />
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
});