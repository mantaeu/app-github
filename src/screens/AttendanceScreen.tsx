import React, { useState, useEffect } from 'react';
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
import { apiService } from '../services/api';
import { AttendanceRecord, User } from '../types';

export const AttendanceScreen: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadAttendance();
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, []);

  const loadAttendance = async () => {
    try {
      console.log('🔍 Loading attendance records...');
      const response = await apiService.getAttendance(
        user?.role === 'worker' ? user._id : undefined
      );
      
      console.log('🔍 Attendance response:', response);
      
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        console.log('🔍 Actual attendance data:', actualData);
        
        if (Array.isArray(actualData)) {
          setAttendance(actualData);
        } else {
          setAttendance([]);
        }
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendance([]);
      Alert.alert(t('error'), 'Failed to load attendance records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('🔍 Loading users...');
      const response = await apiService.getUsers();
      console.log('🔍 Users response:', response);
      
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        console.log('🔍 Actual users data:', actualData);
        
        if (Array.isArray(actualData)) {
          // Filter only workers for attendance management
          const workers = actualData.filter(u => u.role === 'worker');
          setUsers(workers);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
    if (user?.role === 'admin') {
      loadUsers();
    }
  };

  const handleCheckIn = async (userId: string, userName: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      console.log('🔍 Starting check-in for:', { userId, userName });
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      console.log('🔍 Check-in data:', {
        userId,
        date: today.toISOString(),
        checkIn: now.toISOString(),
        status: 'present'
      });
      
      const response = await apiService.createAttendance({
        userId: userId,
        date: today.toISOString(),
        checkIn: now.toISOString(),
        status: 'present',
      });

      console.log('🔍 Check-in response:', response);

      if (response.success) {
        Alert.alert(t('success'), `${userName} checked in successfully`);
        await loadAttendance(); // Reload attendance data
      } else {
        console.error('Check-in failed:', response.error);
        if (response.error?.includes('already recorded')) {
          Alert.alert(t('error'), `${userName} has already checked in today`);
        } else {
          Alert.alert(t('error'), response.error || 'Failed to check in');
        }
      }
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert(t('error'), 'Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async (attendanceId: string, userName?: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      console.log('🔍 Starting check-out for:', { attendanceId, userName });
      
      const now = new Date();
      
      const response = await apiService.updateAttendance(attendanceId, {
        checkOut: now.toISOString(),
      });

      console.log('🔍 Check-out response:', response);

      if (response.success) {
        Alert.alert(t('success'), `${userName || 'User'} checked out successfully`);
        await loadAttendance(); // Reload attendance data
      } else {
        Alert.alert(t('error'), response.error || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      Alert.alert(t('error'), 'Failed to check out. Please try again.');
    }
  };

  const handleMarkAbsentWorkers = async () => {
    if (user?.role !== 'admin') return;

    Alert.alert(
      'Mark Absent Workers',
      'This will mark all workers who haven\'t checked in today as absent. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Absent',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.markAbsentWorkers();
              if (response.success) {
                Alert.alert(t('success'), 'Absent workers marked successfully');
                await loadAttendance();
              } else {
                Alert.alert(t('error'), response.error || 'Failed to mark absent workers');
              }
            } catch (error) {
              console.error('Error marking absent workers:', error);
              Alert.alert(t('error'), 'Failed to mark absent workers');
            }
          },
        },
      ]
    );
  };

  const handleChangeAttendanceStatus = async (userId: string, userName: string, currentStatus: string, attendanceId?: string) => {
    if (user?.role !== 'admin') return;

    const statusOptions = [
      { label: 'Present', value: 'present' },
      { label: 'Absent', value: 'absent' },
      { label: 'Late', value: 'late' },
    ];

    const availableOptions = statusOptions.filter(option => option.value !== currentStatus);

    Alert.alert(
      'Change Attendance Status',
      `Change ${userName}'s status from ${currentStatus} to:`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...availableOptions.map(option => ({
          text: option.label,
          onPress: () => updateAttendanceStatus(userId, userName, option.value, attendanceId),
        })),
      ]
    );
  };

  const updateAttendanceStatus = async (userId: string, userName: string, newStatus: string, attendanceId?: string) => {
    try {
      console.log('🔍 Updating attendance status:', { userId, userName, newStatus, attendanceId });

      if (attendanceId) {
        // Update existing attendance record
        const updateData: any = { status: newStatus };
        
        // If changing to absent, remove check-in/check-out times
        if (newStatus === 'absent') {
          updateData.checkIn = null;
          updateData.checkOut = null;
          updateData.hoursWorked = 0;
          updateData.overtime = 0;
        } else if (newStatus === 'present' && !getTodayAttendance(userId)?.checkIn) {
          // If changing to present and no check-in time, set current time
          updateData.checkIn = new Date().toISOString();
        }

        const response = await apiService.updateAttendance(attendanceId, updateData);
        
        if (response.success) {
          Alert.alert(t('success'), `${userName}'s status changed to ${newStatus}`);
          await loadAttendance();
        } else {
          Alert.alert(t('error'), response.error || 'Failed to update attendance status');
        }
      } else {
        // Create new attendance record
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const attendanceData: any = {
          userId: userId,
          date: today.toISOString(),
          status: newStatus,
        };

        // Only add check-in time if marking as present
        if (newStatus === 'present') {
          attendanceData.checkIn = now.toISOString();
        }

        const response = await apiService.createAttendance(attendanceData);
        
        if (response.success) {
          Alert.alert(t('success'), `${userName} marked as ${newStatus}`);
          await loadAttendance();
        } else {
          Alert.alert(t('error'), response.error || 'Failed to create attendance record');
        }
      }
    } catch (error) {
      console.error('Error updating attendance status:', error);
      Alert.alert(t('error'), 'Failed to update attendance status');
    }
  };

  const handleDeleteAttendance = async (attendanceId: string, userName: string) => {
    if (user?.role !== 'admin') return;

    Alert.alert(
      'Delete Attendance Record',
      `Are you sure you want to delete ${userName}'s attendance record for today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteAttendance(attendanceId);
              if (response.success) {
                Alert.alert(t('success'), 'Attendance record deleted successfully');
                await loadAttendance();
              } else {
                Alert.alert(t('error'), response.error || 'Failed to delete attendance record');
              }
            } catch (error) {
              console.error('Error deleting attendance:', error);
              Alert.alert(t('error'), 'Failed to delete attendance record');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return colors.success;
      case 'absent':
        return colors.error;
      case 'late':
        return colors.warning;
      default:
        return colors.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return 'checkmark-circle';
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  // Get today's attendance for a specific user
  const getTodayAttendance = (userId: string) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    
    console.log('🔍 Looking for today\'s attendance for user:', userId);
    console.log('🔍 Today range:', { start: todayStart.toISOString(), end: todayEnd.toISOString() });
    console.log('🔍 Available attendance records:', attendanceArray.map(r => ({
      id: r._id,
      userId: typeof r.userId === 'string' ? r.userId : r.userId?._id,
      date: r.date,
      status: r.status
    })));
    
    const todayRecord = attendanceArray.find(record => {
      if (!record.userId || !record.date) return false;
      
      // Handle both string and object userId
      const recordUserId = typeof record.userId === 'string' ? record.userId : record.userId._id || record.userId;
      const recordDate = new Date(record.date);
      
      const isMatch = recordUserId === userId && recordDate >= todayStart && recordDate < todayEnd;
      
      console.log('🔍 Checking record:', {
        recordUserId,
        targetUserId: userId,
        recordDate: recordDate.toISOString(),
        isUserMatch: recordUserId === userId,
        isDateMatch: recordDate >= todayStart && recordDate < todayEnd,
        isMatch
      });
      
      return isMatch;
    });
    
    console.log('🔍 Found today\'s attendance:', todayRecord);
    return todayRecord;
  };

  // Worker View - Show only their attendance status
  const WorkerView = () => {
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    const todayAttendance = getTodayAttendance(user?._id || '');

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('attendance')}
          </Text>
        </View>

        {/* Today's Status Card */}
        <ThemedCard style={styles.todayStatusCard}>
          <View style={styles.todayStatusHeader}>
            <Ionicons name="today" size={24} color={colors.primary} />
            <Text style={[styles.todayStatusTitle, { color: colors.text }]}>
              Today's Status
            </Text>
          </View>
          
          {todayAttendance ? (
            <View>
              <View style={styles.statusContainer}>
                <Ionicons
                  name={getStatusIcon(todayAttendance.status) as any}
                  size={20}
                  color={getStatusColor(todayAttendance.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                  {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
                </Text>
              </View>
              
              {todayAttendance.checkIn && (
                <Text style={[styles.timeText, { color: colors.text }]}>
                  Checked in: {formatTime(todayAttendance.checkIn)}
                </Text>
              )}
              
              {todayAttendance.checkOut && (
                <Text style={[styles.timeText, { color: colors.text }]}>
                  Checked out: {formatTime(todayAttendance.checkOut)}
                </Text>
              )}
              
              {!todayAttendance.checkOut && todayAttendance.checkIn && (
                <Text style={[styles.activeText, { color: colors.warning }]}>
                  Currently checked in
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Ionicons name="time" size={20} color={colors.secondary} />
              <Text style={[styles.statusText, { color: colors.secondary }]}>
                Not checked in today
              </Text>
            </View>
          )}
        </ThemedCard>

        {/* Recent Attendance History */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent History</Text>
        
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
          ) : attendanceArray.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar" size={64} color={colors.secondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No attendance records
              </Text>
            </View>
          ) : (
            attendanceArray.slice(0, 10).map((record) => (
              <AttendanceCard key={record._id} record={record} />
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  // Admin View - Show all users and manage their attendance
  const AdminView = () => {
    const usersArray = Array.isArray(users) ? users : [];

    const UserAttendanceCard: React.FC<{ user: User }> = ({ user: userItem }) => {
      const todayAttendance = getTodayAttendance(userItem._id);
      
      console.log('🔍 UserAttendanceCard for:', userItem.name, 'todayAttendance:', todayAttendance);
      
      return (
        <ThemedCard style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {userItem.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {userItem.name}
              </Text>
              <Text style={[styles.userPosition, { color: colors.secondary }]}>
                {userItem.position || 'Worker'}
              </Text>
            </View>
            
            <View style={styles.attendanceActions}>
              {todayAttendance ? (
                <View style={styles.attendanceStatus}>
                  <TouchableOpacity
                    style={styles.statusContainer}
                    onPress={() => handleChangeAttendanceStatus(
                      userItem._id,
                      userItem.name,
                      todayAttendance.status,
                      todayAttendance._id
                    )}
                  >
                    <Ionicons
                      name={getStatusIcon(todayAttendance.status) as any}
                      size={16}
                      color={getStatusColor(todayAttendance.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                      {todayAttendance.status}
                    </Text>
                    <Ionicons name="chevron-down" size={12} color={colors.secondary} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                  
                  {todayAttendance.checkIn && (
                    <Text style={[styles.timeText, { color: colors.secondary }]}>
                      In: {formatTime(todayAttendance.checkIn)}
                    </Text>
                  )}
                  
                  <View style={styles.actionButtonsRow}>
                    {todayAttendance.checkOut ? (
                      <Text style={[styles.timeText, { color: colors.secondary }]}>
                        Out: {formatTime(todayAttendance.checkOut)}
                      </Text>
                    ) : todayAttendance.checkIn ? (
                      <ThemedButton
                        title="Check Out"
                        onPress={() => handleCheckOut(todayAttendance._id, userItem.name)}
                        size="small"
                        variant="outline"
                        style={styles.actionButton}
                      />
                    ) : null}
                    
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                      onPress={() => handleDeleteAttendance(todayAttendance._id, userItem.name)}
                    >
                      <Ionicons name="trash" size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.noAttendanceActions}>
                  <ThemedButton
                    title="Check In"
                    onPress={() => handleCheckIn(userItem._id, userItem.name)}
                    size="small"
                    style={styles.actionButton}
                  />
                  <ThemedButton
                    title="Mark Absent"
                    onPress={() => updateAttendanceStatus(userItem._id, userItem.name, 'absent')}
                    size="small"
                    variant="outline"
                    style={[styles.actionButton, { marginTop: 4 }]}
                  />
                </View>
              )}
            </View>
          </View>
        </ThemedCard>
      );
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('attendance')} Management
          </Text>
          <ThemedButton
            title="Mark Absent"
            onPress={handleMarkAbsentWorkers}
            size="small"
            variant="outline"
            style={styles.markAbsentButton}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Attendance</Text>

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
          ) : usersArray.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={64} color={colors.secondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No workers found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                Add some workers to manage their attendance
              </Text>
            </View>
          ) : (
            usersArray.map((userItem) => (
              <UserAttendanceCard key={userItem._id} user={userItem} />
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  const AttendanceCard: React.FC<{ record: AttendanceRecord }> = ({ record }) => (
    <ThemedCard style={styles.attendanceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateSection}>
          <Text style={[styles.date, { color: colors.text }]}>
            {formatDate(record.date)}
          </Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(record.status) as any}
              size={16}
              color={getStatusColor(record.status)}
            />
            <Text style={[styles.status, { color: getStatusColor(record.status) }]}>
              {record.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.timeSection}>
        {record.checkIn && (
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, { color: colors.secondary }]}>
              Check In
            </Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatTime(record.checkIn)}
            </Text>
          </View>
        )}

        {record.checkOut && (
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, { color: colors.secondary }]}>
              Check Out
            </Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatTime(record.checkOut)}
            </Text>
          </View>
        )}
      </View>

      {record.hoursWorked > 0 && (
        <View style={styles.hoursSection}>
          <Text style={[styles.hoursLabel, { color: colors.secondary }]}>
            Hours Worked: 
          </Text>
          <Text style={[styles.hoursValue, { color: colors.text }]}>
            {record.hoursWorked.toFixed(1)}h
          </Text>
          
          {record.overtime > 0 && (
            <>
              <Text style={[styles.hoursLabel, { color: colors.secondary }]}>
                {' • Overtime: '}
              </Text>
              <Text style={[styles.overtimeValue, { color: colors.warning }]}>
                {record.overtime.toFixed(1)}h
              </Text>
            </>
          )}
        </View>
      )}
    </ThemedCard>
  );

  // Render based on user role
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {user?.role === 'admin' ? <AdminView /> : <WorkerView />}
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
    flex: 1,
  },
  markAbsentButton: {
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todayStatusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  todayStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userCard: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userPosition: {
    fontSize: 12,
  },
  attendanceActions: {
    alignItems: 'flex-end',
  },
  attendanceStatus: {
    alignItems: 'flex-end',
  },
  noAttendanceActions: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    padding: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 12,
    marginBottom: 2,
  },
  activeText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButton: {
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceCard: {
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  dateSection: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  hoursSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hoursLabel: {
    fontSize: 12,
  },
  hoursValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  overtimeValue: {
    fontSize: 12,
    fontWeight: '600',
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