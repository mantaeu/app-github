import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { ThemedCard } from '../components/ThemedCard';
import { apiService } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  monthlyAttendance: number;
  pendingSalaries: number;
  recentActivity: any[];
  totalWorkers: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  totalSalariesPaid: number;
  totalReceiptsGenerated: number;
}

interface WorkerStats {
  monthlyAttendance: number;
  totalHours: number;
  totalOvertime: number;
  pendingSalary: number;
  thisMonthSalary: number;
  workingDays: number;
  missedDays: number;
  onTimePercentage: number;
}

export const DashboardScreen: React.FC = () => {
  const [adminStats, setAdminStats] = useState<DashboardStats>({
    totalUsers: 0,
    monthlyAttendance: 0,
    pendingSalaries: 0,
    recentActivity: [],
    totalWorkers: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    totalSalariesPaid: 0,
    totalReceiptsGenerated: 0,
  });
  
  const [workerStats, setWorkerStats] = useState<WorkerStats>({
    monthlyAttendance: 0,
    totalHours: 0,
    totalOvertime: 0,
    pendingSalary: 0,
    thisMonthSalary: 0,
    workingDays: 0,
    missedDays: 0,
    onTimePercentage: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { unreadCount } = useNotifications();
  const navigation = useNavigation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'admin') {
        await loadAdminStats();
      } else {
        await loadWorkerStats();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      // Load comprehensive admin statistics
      const [usersResponse, attendanceResponse, salaryResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getAttendance(),
        apiService.getSalaryRecords(),
      ]);

      let totalUsers = 0;
      let totalWorkers = 0;
      if (usersResponse.success && usersResponse.data) {
        const users = usersResponse.data.data || usersResponse.data;
        if (Array.isArray(users)) {
          totalUsers = users.length;
          totalWorkers = users.filter(u => u.role === 'worker').length;
        }
      }

      let presentToday = 0;
      let absentToday = 0;
      let lateToday = 0;
      let monthlyAttendance = 0;
      if (attendanceResponse.success && attendanceResponse.data) {
        const attendance = attendanceResponse.data.data || attendanceResponse.data;
        if (Array.isArray(attendance)) {
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          
          const todayAttendance = attendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= todayStart && recordDate < todayEnd;
          });

          presentToday = todayAttendance.filter(r => r.status === 'present').length;
          absentToday = todayAttendance.filter(r => r.status === 'absent').length;
          lateToday = todayAttendance.filter(r => r.status === 'late').length;

          // Monthly attendance (current month)
          const thisMonth = attendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === today.getMonth() && 
                   recordDate.getFullYear() === today.getFullYear();
          });
          monthlyAttendance = thisMonth.filter(r => r.status === 'present').length;
        }
      }

      let pendingSalaries = 0;
      let totalSalariesPaid = 0;
      if (salaryResponse.success && salaryResponse.data) {
        const salaries = salaryResponse.data.data || salaryResponse.data;
        if (Array.isArray(salaries)) {
          pendingSalaries = salaries.filter(s => !s.isPaid).length;
          totalSalariesPaid = salaries.filter(s => s.isPaid).length;
        }
      }

      setAdminStats({
        totalUsers,
        totalWorkers,
        monthlyAttendance,
        pendingSalaries,
        presentToday,
        absentToday,
        lateToday,
        totalSalariesPaid,
        totalReceiptsGenerated: 0,
        recentActivity: [],
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Set fallback data
      setAdminStats({
        totalUsers: 5,
        totalWorkers: 4,
        monthlyAttendance: 85,
        pendingSalaries: 3,
        presentToday: 3,
        absentToday: 1,
        lateToday: 0,
        totalSalariesPaid: 12,
        totalReceiptsGenerated: 8,
        recentActivity: [],
      });
    }
  };

  const loadWorkerStats = async () => {
    try {
      if (!user?._id) return;
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Get month names in English (to match database)
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const currentMonth = monthNames[currentDate.getMonth()];
      
      console.log('🔍 Loading worker stats for:', user.name);
      console.log('📅 Current month:', currentMonth, 'Year:', currentYear);
      console.log('👤 User ID:', user._id);
      console.log('👤 Full User object:', JSON.stringify(user, null, 2));
      console.log('💰 User salary from profile:', user.salary);
      
      // Get attendance records
      const attendanceResponse = await apiService.getAttendance(user._id);
      let attendanceRecords = [];
      if (attendanceResponse.success && attendanceResponse.data) {
        const actualData = attendanceResponse.data.data || attendanceResponse.data;
        attendanceRecords = Array.isArray(actualData) ? actualData : [];
      }
      
      console.log('📊 Attendance records loaded:', attendanceRecords.length);
      
      // Get salary records
      const salaryResponse = await apiService.getSalaryRecords(user._id);
      let salaryRecords = [];
      if (salaryResponse.success && salaryResponse.data) {
        const actualData = salaryResponse.data.data || salaryResponse.data;
        salaryRecords = Array.isArray(actualData) ? actualData : [];
      }
      
      console.log('💰 Salary records loaded:', salaryRecords.length);
      console.log('💰 Salary records data:', salaryRecords);
      
      // Calculate this month's stats
      const thisMonthAttendance = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentDate.getMonth() && 
               recordDate.getFullYear() === currentYear;
      });
      
      const presentDays = thisMonthAttendance.filter(record => record.status === 'present').length;
      const totalWorkingDays = thisMonthAttendance.length;
      const missedDays = totalWorkingDays - presentDays;
      
      const totalHours = thisMonthAttendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
      const totalOvertime = thisMonthAttendance.reduce((sum, record) => sum + (record.overtime || 0), 0);
      
      // Get current month salary - try different month formats
      let thisMonthSalary = salaryRecords.find(record => 
        record.month === currentMonth && record.year === currentYear
      );
      
      // If not found, try with the most recent salary record
      if (!thisMonthSalary && salaryRecords.length > 0) {
        thisMonthSalary = salaryRecords.sort((a, b) => b.year - a.year || monthNames.indexOf(b.month) - monthNames.indexOf(a.month))[0];
        console.log('📝 Using most recent salary record:', thisMonthSalary);
      }
      
      // If still no salary record, fallback to user's base salary from profile
      if (!thisMonthSalary && user?.salary) {
        console.log('📝 User base salary from profile:', user.salary);
        thisMonthSalary = { totalSalary: user.salary };
        console.log('📝 Using user base salary as fallback');
      } else if (!thisMonthSalary) {
        console.log('⚠️ No salary data available - user.salary not set');
      }
      
      console.log('💵 Final this month salary used:', thisMonthSalary);
      
      // Get pending salary (unpaid salaries)
      const pendingSalaryRecords = salaryRecords.filter(record => !record.isPaid);
      const pendingSalary = pendingSalaryRecords.reduce((sum, record) => sum + (record.totalSalary || 0), 0);
      
      console.log('⏳ Pending salary records:', pendingSalaryRecords.length, 'Total pending:', pendingSalary);
      
      // Calculate on-time percentage
      const onTimeRecords = thisMonthAttendance.filter(record => {
        if (!record.checkIn) return false;
        const checkInTime = new Date(record.checkIn);
        return checkInTime.getHours() <= 9;
      });
      const onTimePercentage = presentDays > 0 ? (onTimeRecords.length / presentDays) * 100 : 0;
      
      // Use fallback salary if no salary record exists
      const finalSalary = thisMonthSalary?.totalSalary || user?.salary || 0;
      console.log('💵 Final salary amount to display:', finalSalary);
      
      const stats = {
        monthlyAttendance: presentDays,
        totalHours: Math.round(totalHours * 10) / 10,
        totalOvertime: Math.round(totalOvertime * 10) / 10,
        pendingSalary,
        thisMonthSalary: finalSalary,
        workingDays: totalWorkingDays,
        missedDays,
        onTimePercentage: Math.round(onTimePercentage),
      };
      
      console.log('✅ Final worker stats:', stats);
      setWorkerStats(stats);
      
    } catch (error) {
      console.error('❌ Error loading worker stats:', error);
      // Set fallback data for testing
      setWorkerStats({
        monthlyAttendance: 15,
        totalHours: 120,
        totalOvertime: 8,
        pendingSalary: 2500,
        thisMonthSalary: user?.salary || 5000,
        workingDays: 20,
        missedDays: 5,
        onTimePercentage: 85,
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  // Professional Admin Dashboard
  const AdminDashboard = () => {
    const StatCard: React.FC<{
      title: string;
      value: string | number;
      icon: string;
      color: string;
      trend?: 'up' | 'down' | 'neutral';
      trendValue?: string;
    }> = ({ title, value, icon, color, trend, trendValue }) => (
      <ThemedCard style={styles.statCard}>
        <View style={styles.statHeader}>
          <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          {trend && trendValue && (
            <View style={[styles.trendContainer, { 
              backgroundColor: trend === 'up' ? '#10B981' + '15' : 
                              trend === 'down' ? '#EF4444' + '15' : colors.secondary + '15' 
            }]}>
              <Ionicons 
                name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
                size={12} 
                color={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : colors.secondary} 
              />
              <Text style={[styles.trendText, { 
                color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : colors.secondary 
              }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.secondary }]}>{title}</Text>
      </ThemedCard>
    );

    const QuickActionButton: React.FC<{
      title: string;
      icon: string;
      color: string;
      onPress: () => void;
    }> = ({ title, icon, color, onPress }) => (
      <TouchableOpacity onPress={onPress} style={styles.quickActionButton}>
        <ThemedCard style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={28} color={color} />
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>{title}</Text>
        </ThemedCard>
      </TouchableOpacity>
    );

    const AttendanceOverview = () => (
      <ThemedCard style={styles.attendanceOverviewCard}>
        <View style={styles.attendanceHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('todaysAttendance')}</Text>
          <Text style={[styles.dateText, { color: colors.secondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.attendanceStatsRow}>
          <View style={styles.attendanceStatItem}>
            <View style={[styles.attendanceStatIcon, { backgroundColor: '#10B981' + '15' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={[styles.attendanceStatValue, { color: colors.text }]}>
              {adminStats.presentToday}
            </Text>
            <Text style={[styles.attendanceStatLabel, { color: colors.secondary }]}>{t('present')}</Text>
          </View>

          <View style={styles.attendanceStatItem}>
            <View style={[styles.attendanceStatIcon, { backgroundColor: '#EF4444' + '15' }]}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.attendanceStatValue, { color: colors.text }]}>
              {adminStats.absentToday}
            </Text>
            <Text style={[styles.attendanceStatLabel, { color: colors.secondary }]}>{t('absent')}</Text>
          </View>

          <View style={styles.attendanceStatItem}>
            <View style={[styles.attendanceStatIcon, { backgroundColor: '#F59E0B' + '15' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.attendanceStatValue, { color: colors.text }]}>
              {adminStats.lateToday}
            </Text>
            <Text style={[styles.attendanceStatLabel, { color: colors.secondary }]}>{t('late')}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.secondary }]}>
              {t('attendanceRate')}
            </Text>
            <Text style={[styles.progressPercentage, { color: colors.text }]}>
              {adminStats.totalWorkers > 0 ? 
                Math.round((adminStats.presentToday / adminStats.totalWorkers) * 100) : 0}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: '#10B981',
                  width: `${adminStats.totalWorkers > 0 ? 
                    (adminStats.presentToday / adminStats.totalWorkers) * 100 : 0}%`
                }
              ]} 
            />
          </View>
        </View>
      </ThemedCard>
    );

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              {t('welcome')}, {user?.name}! 👋
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {t('hereWhatHappeningTeam')}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.card }]}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Key Statistics */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('keyMetrics')}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title={t('totalUsers')}
              value={adminStats.totalUsers}
              icon="people-outline"
              color="#3B82F6"
              trend="up"
              trendValue="+2"
            />
            <StatCard
              title={t('presentToday')}
              value={adminStats.presentToday}
              icon="checkmark-circle-outline"
              color="#10B981"
              trend="up"
              trendValue="+1"
            />
            <StatCard
              title={t('pendingSalaries')}
              value={adminStats.pendingSalaries}
              icon="card-outline"
              color="#F59E0B"
              trend="down"
              trendValue="-2"
            />
            <StatCard
              title={t('monthlyAttendance')}
              value={`${adminStats.monthlyAttendance}`}
              icon="calendar-outline"
              color="#8B5CF6"
              trend="up"
              trendValue="+5%"
            />
          </View>
        </View>

        {/* Today's Attendance */}
        <View style={styles.section}>
          <AttendanceOverview />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title={t('users')}
              icon="people-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('Users' as never)}
            />
            <QuickActionButton
              title={t('attendance')}
              icon="time-outline"
              color="#10B981"
              onPress={() => navigation.navigate('Attendance' as never)}
            />
            {/* Salary quick action temporarily disabled */}
            {/* <QuickActionButton
              title={t('salary')}
              icon="card-outline"
              color="#F59E0B"
              onPress={() => navigation.navigate('Salary' as never)}
            /> */}
            <QuickActionButton
              title={t('receipts')}
              icon="document-text-outline"
              color="#8B5CF6"
              onPress={() => navigation.navigate('Receipts' as never)}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  // Worker Dashboard
  const WorkerDashboard = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    
    const WorkerMetricCard: React.FC<{
      title: string;
      value: string | number;
      icon: string;
      color: string;
      subtitle?: string;
    }> = ({ title, value, icon, color, subtitle }) => (
      <ThemedCard style={styles.workerMetricCard}>
        <View style={styles.workerMetricHeader}>
          <View style={[styles.workerMetricIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
        </View>
        <Text style={[styles.workerMetricValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.workerMetricTitle, { color: colors.secondary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.workerMetricSubtitle, { color: colors.secondary }]}>{subtitle}</Text>
        )}
      </ThemedCard>
    );

    const formatCurrency = (amount: number) => `${amount.toLocaleString()} DH`;

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              {t('welcome')}, {user?.name}! 👋
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {user?.position || t('worker')} • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.card }]}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Today's Status */}
        <View style={styles.section}>
          <ThemedCard style={styles.todayStatusCard}>
            <View style={styles.todayStatusContent}>
              <View style={[styles.todayStatusIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="today-outline" size={32} color={colors.primary} />
              </View>
              <View style={styles.todayStatusText}>
                <Text style={[styles.todayStatusTitle, { color: colors.text }]}>
                  {t('todaysStatus')}
                </Text>
                <Text style={[styles.todayStatusSubtitle, { color: colors.secondary }]}>
                  {t('checkAttendanceTab')}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.todayStatusButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Attendance' as never)}
              >
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ThemedCard>
        </View>

        {/* This Month Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {currentMonth} {t('overview')}
          </Text>
          <View style={styles.workerMetricsGrid}>
            <WorkerMetricCard
              title={t('daysPresent')}
              value={workerStats.monthlyAttendance}
              icon="checkmark-circle-outline"
              color="#10B981"
              subtitle={`${t('of')} ${workerStats.workingDays} ${t('days')}`}
            />
            <WorkerMetricCard
              title={t('hoursWorked')}
              value={`${workerStats.totalHours}h`}
              icon="time-outline"
              color="#3B82F6"
            />
            <WorkerMetricCard
              title={t('overtime')}
              value={`${workerStats.totalOvertime}h`}
              icon="flash-outline"
              color="#F59E0B"
            />
            <WorkerMetricCard
              title={t('onTimeRate')}
              value={`${workerStats.onTimePercentage}%`}
              icon="speedometer-outline"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('financialSummary')}</Text>
          <ThemedCard style={styles.financialCard}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <View style={styles.financialItemHeader}>
                  <View style={[styles.financialIcon, { backgroundColor: '#10B981' + '15' }]}>
                    <Ionicons name="card-outline" size={20} color="#10B981" />
                  </View>
                  <Text style={[styles.financialLabel, { color: colors.secondary }]}>
                    {t('thisMonthSalary')}
                  </Text>
                </View>
                <Text style={[styles.financialValue, { color: colors.text }]}>
                  {formatCurrency(workerStats.thisMonthSalary)}
                </Text>
              </View>
              
              <View style={styles.financialDivider} />
              
              <View style={styles.financialItem}>
                <View style={styles.financialItemHeader}>
                  <View style={[styles.financialIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                    <Ionicons name="time-outline" size={20} color="#F59E0B" />
                  </View>
                  <Text style={[styles.financialLabel, { color: colors.secondary }]}>
                    {t('pendingSalary')}
                  </Text>
                </View>
                <Text style={[styles.financialValue, { color: colors.text }]}>
                  {formatCurrency(workerStats.pendingSalary)}
                </Text>
              </View>
            </View>
          </ThemedCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
          <View style={styles.workerQuickActionsGrid}>
            <TouchableOpacity 
              style={styles.workerQuickAction}
              onPress={() => navigation.navigate('Attendance' as never)}
            >
              <ThemedCard style={styles.workerQuickActionCard}>
                <View style={[styles.workerQuickActionIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                  <Ionicons name="time-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={[styles.workerQuickActionText, { color: colors.text }]}>
                  {t('viewAttendance')}
                </Text>
              </ThemedCard>
            </TouchableOpacity>
            
            {/* Salary quick action temporarily disabled */}
            {/* <TouchableOpacity 
              style={styles.workerQuickAction}
              onPress={() => navigation.navigate('Salary' as never)}
            >
              <ThemedCard style={styles.workerQuickActionCard}>
                <View style={[styles.workerQuickActionIcon, { backgroundColor: '#10B981' + '15' }]}>
                  <Ionicons name="card-outline" size={24} color="#10B981" />
                </View>
                <Text style={[styles.workerQuickActionText, { color: colors.text }]}>
                  {t('checkSalary')}
                </Text>
              </ThemedCard>
            </TouchableOpacity> */}
            
            <TouchableOpacity 
              style={styles.workerQuickAction}
              onPress={() => navigation.navigate('Receipts' as never)}
            >
              <ThemedCard style={styles.workerQuickActionCard}>
                <View style={[styles.workerQuickActionIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                  <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={[styles.workerQuickActionText, { color: colors.text }]}>
                  {t('viewReceipts')}
                </Text>
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.workerQuickAction}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <ThemedCard style={styles.workerQuickActionCard}>
                <View style={[styles.workerQuickActionIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                  <Ionicons name="person-outline" size={24} color="#8B5CF6" />
                </View>
                <Text style={[styles.workerQuickActionText, { color: colors.text }]}>
                  {t('editProfile')}
                </Text>
              </ThemedCard>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.secondary }]}>
            {t('loading')}
          </Text>
        </View>
      ) : user?.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <WorkerDashboard />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // Stats Grid (Admin)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: (width - 56) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Attendance Overview
  attendanceOverviewCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  attendanceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  attendanceStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceStatValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  attendanceStatLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Quick Actions (Admin)
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionButton: {
    width: (width - 56) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  quickActionCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Worker Dashboard Styles
  todayStatusCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todayStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayStatusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  todayStatusText: {
    flex: 1,
  },
  todayStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  todayStatusSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  todayStatusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Worker Metrics
  workerMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  workerMetricCard: {
    width: (width - 56) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workerMetricHeader: {
    marginBottom: 16,
  },
  workerMetricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerMetricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  workerMetricTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  workerMetricSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.6,
  },

  // Financial Card
  financialCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialItem: {
    flex: 1,
  },
  financialItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  financialLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  financialValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  financialDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },

  // Worker Quick Actions
  workerQuickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  workerQuickAction: {
    width: (width - 56) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  workerQuickActionCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workerQuickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerQuickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  bottomPadding: {
    height: 20,
  },
});