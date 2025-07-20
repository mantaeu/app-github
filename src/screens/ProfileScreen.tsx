import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileHeaderContent}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.profileAvatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.profileRole, { color: colors.secondary }]}>
            {user?.position || t('worker')} • {user?.role === 'admin' ? t('admin') : t('worker')}
          </Text>
          <View style={styles.profileBadge}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusText, { color: '#10B981' }]}>
              {user?.isActive ? t('active') : t('inactive')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const QuickStatsCard = () => {
    const StatItem: React.FC<{
      label: string;
      value: string;
      icon: string;
      color: string;
    }> = ({ label, value, icon, color }) => (
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>{label}</Text>
        </View>
      </View>
    );

    return (
      <ThemedCard style={styles.quickStatsCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('quickOverview')}</Text>
        <View style={styles.statsContainer}>
          <StatItem
            label={t('dailyRate')}
            value={`${user?.salary || 0} DH/${t('perDay')}`}
            icon="card-outline"
            color="#10B981"
          />
          <StatItem
            label={t('workerType')}
            value={t('dailyWorker')}
            icon="time-outline"
            color="#3B82F6"
          />
          <StatItem
            label={t('employeeId')}
            value={user?.idCardNumber || 'N/A'}
            icon="id-card-outline"
            color="#8B5CF6"
          />
          <StatItem
            label={t('joinDate')}
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            icon="calendar-outline"
            color="#F59E0B"
          />
        </View>
      </ThemedCard>
    );
  };

  const PersonalInfoCard = () => {
    const InfoField: React.FC<{
      label: string;
      value: string;
      icon: string;
    }> = ({ label, value, icon }) => (
      <View style={styles.infoField}>
        <View style={styles.infoFieldHeader}>
          <View style={[styles.infoFieldIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name={icon as any} size={18} color={colors.primary} />
          </View>
          <Text style={[styles.infoFieldLabel, { color: colors.secondary }]}>{label}</Text>
        </View>
        <Text style={[styles.infoFieldValue, { color: colors.text }]}>
          {value || t('notProvided')}
        </Text>
      </View>
    );

    return (
      <ThemedCard style={styles.personalInfoCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('personalInformation')}</Text>
        <View style={styles.infoFieldsContainer}>
          <InfoField
            label={t('fullName')}
            value={user?.name || ''}
            icon="person-outline"
          />
          <InfoField
            label={t('idCardNumber')}
            value={user?.idCardNumber || t('notAssigned')}
            icon="id-card-outline"
          />
          <InfoField
            label={t('phoneNumber')}
            value={user?.phone || t('notProvided')}
            icon="call-outline"
          />
          <InfoField
            label={t('address')}
            value={user?.address || t('notProvided')}
            icon="location-outline"
          />
          <InfoField
            label={t('position')}
            value={user?.position || t('notAssigned')}
            icon="briefcase-outline"
          />
          <InfoField
            label={t('department')}
            value={t('general')}
            icon="business-outline"
          />
        </View>
      </ThemedCard>
    );
  };

  const WorkInfoCard = () => {
    const WorkInfoItem: React.FC<{
      label: string;
      value: string;
      icon: string;
      color: string;
    }> = ({ label, value, icon, color }) => (
      <View style={styles.workInfoItem}>
        <View style={[styles.workInfoIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <View style={styles.workInfoContent}>
          <Text style={[styles.workInfoLabel, { color: colors.secondary }]}>{label}</Text>
          <Text style={[styles.workInfoValue, { color: colors.text }]}>{value}</Text>
        </View>
      </View>
    );

    return (
      <ThemedCard style={styles.workInfoCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('workInformation')}</Text>
        <View style={styles.workInfoContainer}>
          <WorkInfoItem
            label={t('employeeStatus')}
            value={user?.isActive ? t('active') : t('inactive')}
            icon="checkmark-circle-outline"
            color="#10B981"
          />
          <WorkInfoItem
            label={t('role')}
            value={user?.role === 'admin' ? t('admin') : t('worker')}
            icon="person-circle-outline"
            color="#3B82F6"
          />
          <WorkInfoItem
            label={t('workSchedule')}
            value={t('mondayFriday')}
            icon="time-outline"
            color="#8B5CF6"
          />
          <WorkInfoItem
            label={t('workLocation')}
            value={t('mainOffice')}
            icon="location-outline"
            color="#F59E0B"
          />
        </View>
      </ThemedCard>
    );
  };

  const CompensationCard = () => {
    const CompensationItem: React.FC<{
      label: string;
      value: string;
      icon: string;
      color: string;
    }> = ({ label, value, icon, color }) => (
      <View style={styles.compensationItem}>
        <View style={[styles.compensationIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.compensationContent}>
          <Text style={[styles.compensationLabel, { color: colors.secondary }]}>{label}</Text>
          <Text style={[styles.compensationValue, { color: colors.text }]}>{value}</Text>
        </View>
      </View>
    );

    return (
      <ThemedCard style={styles.compensationCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('dailyRateDetails')}</Text>
        <View style={styles.compensationContainer}>
          <CompensationItem
            label={t('dailyRate')}
            value={`${user?.salary || 0} DH ${t('perDay')}`}
            icon="card-outline"
            color="#10B981"
          />
          <CompensationItem
            label={t('paymentMethod')}
            value={t('dailyAttendanceBased')}
            icon="time-outline"
            color="#3B82F6"
          />
        </View>
        <View style={styles.compensationNote}>
          <View style={[styles.noteIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.noteText, { color: colors.secondary }]}>
            You get paid {user?.salary || 0} DH for each day you attend work. No payment for missed days.
          </Text>
        </View>
      </ThemedCard>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader />
      
      <View style={styles.content}>
        <QuickStatsCard />
        <PersonalInfoCard />
        <WorkInfoCard />
        <CompensationCard />
      </View>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Profile Header
  profileHeader: {
    padding: 24,
    paddingBottom: 32,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileRole: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  content: {
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Quick Stats Card
  quickStatsCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: (width - 80) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Personal Info Card
  personalInfoCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoFieldsContainer: {
    gap: 20,
  },
  infoField: {
    gap: 12,
  },
  infoFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoFieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  infoFieldValue: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 44,
  },

  // Work Info Card
  workInfoCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workInfoContainer: {
    gap: 16,
  },
  workInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workInfoContent: {
    flex: 1,
  },
  workInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    opacity: 0.8,
  },
  workInfoValue: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Compensation Card
  compensationCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compensationContainer: {
    gap: 16,
    marginBottom: 20,
  },
  compensationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compensationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  compensationContent: {
    flex: 1,
  },
  compensationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    opacity: 0.8,
  },
  compensationValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  compensationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  noteIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  bottomPadding: {
    height: 20,
  },
});