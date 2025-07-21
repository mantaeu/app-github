import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';
import { SearchBar } from '../components/SearchBar';
import { apiService } from '../services/api';
import { AttendanceRecord, User } from '../types';
import { useDebounce } from '../hooks/useDebounce';

export const AttendanceScreen: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // Debounce search query to prevent too many re-renders
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadAttendance();
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, []);

  // Memoized filtered data using debounced search query
  const filteredAttendance = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return attendance;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return attendance.filter(record => {
      const userName = (record?.userId?.name || '').toLowerCase();
      const userEmail = (record?.userId?.email || '').toLowerCase();
      const status = (record?.status || '').toLowerCase();
      const date = record?.date ? new Date(record.date).toLocaleDateString().toLowerCase() : '';

      return userName.includes(query) ||
             userEmail.includes(query) ||
             status.includes(query) ||
             date.includes(query);
    });
  }, [attendance, debouncedSearchQuery]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return users;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return users.filter(user => {
      const name = (user?.name || '').toLowerCase();
      const email = (user?.email || '').toLowerCase();
      const position = (user?.position || '').toLowerCase();
      const idCardNumber = (user?.idCardNumber || '').toLowerCase();

      return name.includes(query) ||
             email.includes(query) ||
             position.includes(query) ||
             idCardNumber.includes(query);
    });
  }, [users, debouncedSearchQuery]);

  const loadAttendance = useCallback(async () => {
    try {
      const response = await apiService.getAttendance(
        user?.role === 'worker' ? user._id : undefined
      );
      
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        
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
      Alert.alert(t('error'), t('noAttendanceRecords'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role, user?._id, t]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await apiService.getUsers();
      
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        
        if (Array.isArray(actualData)) {
          // Filter only workers for attendance management
          const workers = actualData.filter(u => u?.role === 'worker');
          setUsers(workers);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAttendance();
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [loadAttendance, loadUsers, user?.role]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCheckIn = useCallback(async (userId: string, userName: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const response = await apiService.createAttendance({
        userId: userId,
        date: today.toISOString(),
        checkIn: now.toISOString(),
        status: 'present',
      });

      if (response.success) {
        Alert.alert(t('success'), t('checkedInSuccessfully', { name: userName }));
        await loadAttendance();
      } else {
        if (response.error?.includes('already recorded')) {
          Alert.alert(t('error'), t('alreadyCheckedInToday', { name: userName }));
        } else {
          Alert.alert(t('error'), response.error || t('failedToCheckIn'));
        }
      }
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert(t('error'), t('failedToCheckIn'));
    }
  }, [user?.role, t, loadAttendance]);

  const handleCheckOut = useCallback(async (attendanceId: string, userName?: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      const now = new Date();
      
      const response = await apiService.updateAttendance(attendanceId, {
        checkOut: now.toISOString(),
      });

      if (response.success) {
        Alert.alert(t('success'), t('checkedOutSuccessfully', { name: userName || t('user') }));
        await loadAttendance();
      } else {
        Alert.alert(t('error'), response.error || t('failedToCheckOut'));
      }
    } catch (error) {
      console.error('Error checking out:', error);
      Alert.alert(t('error'), t('failedToCheckOut'));
    }
  }, [user?.role, t, loadAttendance]);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getStatusColor = useCallback((status: string) => {
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
  }, [colors]);

  const getStatusIcon = useCallback((status: string) => {
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
  }, []);

  // Get today's attendance for a specific user
  const getTodayAttendance = useCallback((userId: string) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    
    return attendanceArray.find(record => {
      if (!record?.userId || !record?.date) return false;
      
      const recordUserId = typeof record.userId === 'string' ? record.userId : record.userId._id || record.userId;
      const recordDate = new Date(record.date);
      
      return recordUserId === userId && recordDate >= todayStart && recordDate < todayEnd;
    });
  }, [attendance]);

  // Memoized components
  const AttendanceCard = React.memo<{ record: AttendanceRecord }>(({ record }) => (
    <ThemedCard style={styles.attendanceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateSection}>
          <Text style={[styles.date, { color: colors.text }]}>
            {record?.date ? formatDate(record.date) : 'Unknown Date'}
          </Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(record?.status || '') as any}
              size={16}
              color={getStatusColor(record?.status || '')}
            />
            <Text style={[styles.status, { color: getStatusColor(record?.status || '') }]}>
              {record?.status ? t(record.status as any) : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.timeSection}>
        {record?.checkIn && (
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, { color: colors.secondary }]}>
              {t('checkIn')}
            </Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatTime(record.checkIn)}
            </Text>
          </View>
        )}

        {record?.checkOut && (
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, { color: colors.secondary }]}>
              {t('checkOut')}
            </Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatTime(record.checkOut)}
            </Text>
          </View>
        )}
      </View>

      {(record?.hoursWorked || 0) > 0 && (
        <View style={styles.hoursSection}>
          <Text style={[styles.hoursLabel, { color: colors.secondary }]}>
            {t('hoursWorked')}: 
          </Text>
          <Text style={[styles.hoursValue, { color: colors.text }]}>
            {(record.hoursWorked || 0).toFixed(1)}h
          </Text>
          
          {(record?.overtime || 0) > 0 && (
            <>
              <Text style={[styles.hoursLabel, { color: colors.secondary }]}>
                {' • '}{t('overtime')}: 
              </Text>
              <Text style={[styles.overtimeValue, { color: colors.warning }]}>
                {(record.overtime || 0).toFixed(1)}h
              </Text>
            </>
          )}
        </View>
      )}
    </ThemedCard>
  ));

  const UserAttendanceCard = React.memo<{ user: User }>(({ user: userItem }) => {
    const todayAttendance = getTodayAttendance(userItem._id);
    
    return (
      <ThemedCard style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {(userItem?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {userItem?.name || 'Unknown User'}
            </Text>
            <Text style={[styles.userPosition, { color: colors.secondary }]}>
              {userItem?.position || t('worker')}
            </Text>
          </View>
          
          <View style={styles.attendanceActions}>
            {todayAttendance ? (
              <View style={styles.attendanceStatus}>
                <View style={styles.statusContainer}>
                  <Ionicons
                    name={getStatusIcon(todayAttendance.status) as any}
                    size={16}
                    color={getStatusColor(todayAttendance.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                    {t(todayAttendance.status as any)}
                  </Text>
                </View>
                
                {todayAttendance.checkIn && (
                  <Text style={[styles.timeText, { color: colors.secondary }]}>
                    {t('in')}: {formatTime(todayAttendance.checkIn)}
                  </Text>
                )}
                
                <View style={styles.actionButtonsRow}>
                  {todayAttendance.checkOut ? (
                    <Text style={[styles.timeText, { color: colors.secondary }]}>
                      {t('out')}: {formatTime(todayAttendance.checkOut)}
                    </Text>
                  ) : todayAttendance.checkIn ? (
                    <ThemedButton
                      title={t('checkOut')}
                      onPress={() => handleCheckOut(todayAttendance._id, userItem?.name)}
                      size="small"
                      variant="outline"
                      style={styles.actionButton}
                    />
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.noAttendanceActions}>
                <ThemedButton
                  title={t('checkIn')}
                  onPress={() => handleCheckIn(userItem._id, userItem?.name || 'User')}
                  size="small"
                  style={styles.actionButton}
                />
              </View>
            )}
          </View>
        </View>
      </ThemedCard>
    );
  });

  if (user?.role === 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('attendanceManagement')}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder={`${t('search')} workers...`}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('todayAttendance')}</Text>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
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
                {searchQuery ? `No workers found for "${searchQuery}"` : t('noWorkersFound')}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                {searchQuery ? 'Try a different search term' : t('addWorkersToManageAttendance')}
              </Text>
            </View>
          ) : (
            <>
              {searchQuery && (
                <View style={styles.searchResults}>
                  <Text style={[styles.searchResultsText, { color: colors.secondary }]}>
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'worker' : 'workers'} found
                  </Text>
                </View>
              )}
              {filteredUsers.map((userItem) => (
                <UserAttendanceCard key={userItem._id} user={userItem} />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // Worker View
  const attendanceArray = Array.isArray(filteredAttendance) ? filteredAttendance : [];
  const todayAttendance = getTodayAttendance(user?._id || '');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('attendance')}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder={`${t('search')} ${t('attendance').toLowerCase()}...`}
        />
      </View>

      {/* Today's Status Card */}
      <ThemedCard style={styles.todayStatusCard}>
        <View style={styles.todayStatusHeader}>
          <Ionicons name="today" size={24} color={colors.primary} />
          <Text style={[styles.todayStatusTitle, { color: colors.text }]}>
            {t('todayStatus')}
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
                {t(todayAttendance.status as any)}
              </Text>
            </View>
            
            {todayAttendance.checkIn && (
              <Text style={[styles.timeText, { color: colors.text }]}>
                {t('checkedIn')}: {formatTime(todayAttendance.checkIn)}
              </Text>
            )}
            
            {todayAttendance.checkOut && (
              <Text style={[styles.timeText, { color: colors.text }]}>
                {t('checkedOut')}: {formatTime(todayAttendance.checkOut)}
              </Text>
            )}
            
            {!todayAttendance.checkOut && todayAttendance.checkIn && (
              <Text style={[styles.activeText, { color: colors.warning }]}>
                {t('currentlyCheckedIn')}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Ionicons name="time" size={20} color={colors.secondary} />
            <Text style={[styles.statusText, { color: colors.secondary }]}>
              {t('notCheckedInToday')}
            </Text>
          </View>
        )}
      </ThemedCard>

      {/* Recent Attendance History */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentHistory')}</Text>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
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
              {searchQuery ? `No attendance records found for "${searchQuery}"` : t('noAttendanceRecords')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {searchQuery ? 'Try a different search term' : 'Check your attendance in the Attendance tab'}
            </Text>
          </View>
        ) : (
          <>
            {searchQuery && (
              <View style={styles.searchResults}>
                <Text style={[styles.searchResultsText, { color: colors.secondary }]}>
                  {attendanceArray.length} {attendanceArray.length === 1 ? 'record' : 'records'} found
                </Text>
              </View>
            )}
            {attendanceArray.slice(0, 10).map((record) => (
              <AttendanceCard key={record._id} record={record} />
            ))}
          </>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
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