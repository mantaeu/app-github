import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = () => {
    // In a real app, you would call an API to update the user
    Alert.alert(
      'Profile Updated',
      'Your profile has been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const InfoRow: React.FC<{
    label: string;
    value: string;
    icon: string;
    editable?: boolean;
    onChangeText?: (text: string) => void;
  }> = ({ label, value, icon, editable = false, onChangeText }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.secondary }]}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={[styles.infoInput, { color: colors.text, borderColor: colors.border }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={label}
            placeholderTextColor={colors.secondary}
          />
        ) : (
          <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'Not provided'}</Text>
        )}
      </View>
    </View>
  );

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <ThemedCard style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="#ffffff" />
        </View>
        <View style={styles.statText}>
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: colors.secondary }]}>{title}</Text>
        </View>
      </View>
    </ThemedCard>
  );

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userRole, { color: colors.secondary }]}>
          {user?.position || 'Employee'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.secondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Base Salary"
            value={formatCurrency(user?.salary || 0)}
            icon="card"
            color={colors.success}
          />
          <StatCard
            title="Hourly Rate"
            value={`$${user?.hourlyRate || 0}/hr`}
            icon="time"
            color={colors.primary}
          />
          <StatCard
            title="Employee ID"
            value={user?._id?.slice(-6).toUpperCase() || 'N/A'}
            icon="id-card"
            color={colors.info}
          />
          <StatCard
            title="Join Date"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            icon="calendar"
            color={colors.warning}
          />
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            style={[styles.editButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons 
              name={isEditing ? 'checkmark' : 'create'} 
              size={16} 
              color="#ffffff" 
            />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <ThemedCard>
          <InfoRow
            label="Full Name"
            value={editedUser.name}
            icon="person"
            editable
            onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
          />
          <InfoRow
            label="Email Address"
            value={editedUser.email}
            icon="mail"
            editable
            onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
          />
          <InfoRow
            label="Phone Number"
            value={editedUser.phone}
            icon="call"
            editable
            onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
          />
          <InfoRow
            label="Address"
            value={editedUser.address}
            icon="location"
            editable
            onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
          />
          <InfoRow
            label="Position"
            value={user?.position || 'Not assigned'}
            icon="briefcase"
          />
          <InfoRow
            label="Department"
            value="General"
            icon="business"
          />
        </ThemedCard>
      </View>

      {/* Work Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Work Information</Text>
        <ThemedCard>
          <InfoRow
            label="Employee Status"
            value={user?.isActive ? 'Active' : 'Inactive'}
            icon="checkmark-circle"
          />
          <InfoRow
            label="Work Schedule"
            value="Monday - Friday, 9:00 AM - 5:30 PM"
            icon="time"
          />
          <InfoRow
            label="Reporting Manager"
            value="Admin User"
            icon="person-circle"
          />
          <InfoRow
            label="Work Location"
            value="Main Office"
            icon="location"
          />
        </ThemedCard>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <ThemedCard style={styles.actionCard}>
              <Ionicons name="key" size={24} color={colors.warning} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Change Password
              </Text>
            </ThemedCard>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <ThemedCard style={styles.actionCard}>
              <Ionicons name="notifications" size={24} color={colors.info} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Notifications
              </Text>
            </ThemedCard>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <ThemedCard style={styles.actionCard}>
              <Ionicons name="help-circle" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Help & Support
              </Text>
            </ThemedCard>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <ThemedCard style={styles.actionCard}>
              <Ionicons name="log-out" size={24} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Logout
              </Text>
            </ThemedCard>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cancel Edit Button */}
      {isEditing && (
        <View style={styles.section}>
          <ThemedButton
            title="Cancel"
            onPress={() => {
              setIsEditing(false);
              setEditedUser({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || '',
              });
            }}
            variant="outline"
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  infoInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionItem: {
    width: '48%',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  actionCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});