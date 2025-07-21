import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('attendance')}
        </Text>
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
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('attendanceFeatureComingSoon')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {t('checkBackLater')}
            </Text>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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