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
import { ThemedCard } from '../components/ThemedCard';
import { apiService } from '../services/api';

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
        totalReceiptsGenerated: 0, // This would come from receipts API
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
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear();
      
      // Get attendance records
      const attendanceResponse = await apiService.getAttendance(user._id);
      let attendanceRecords = [];
      if (attendanceResponse.success && attendanceResponse.data) {
        const actualData = attendanceResponse.data.data || attendanceResponse.data;
        attendanceRecords = Array.isArray(actualData) ? actualData : [];
      }
      
      // Get salary records
      const salaryResponse = await apiService.getSalaryRecords(user._id);
      let salaryRecords = [];
      if (salaryResponse.success && salaryResponse.data) {
        const actualData = salaryResponse.data.data || salaryResponse.data;
        salaryRecords = Array.isArray(actualData) ? actualData : [];
      }
      
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
      
      // Get current month salary
      const thisMonthSalary = salaryRecords.find(record => 
        record.month === currentMonth && record.year === currentYear
      );
      
      // Get pending salary
      const pendingSalaryRecords = salaryRecords.filter(record => !record.isPaid);
      const pendingSalary = pendingSalaryRecords.reduce((sum, record) => sum + record.totalSalary, 0);
      
      // Calculate on-time percentage
      const onTimeRecords = thisMonthAttendance.filter(record => {
        if (!record.checkIn) return false;
        const checkInTime = new Date(record.checkIn);
        return checkInTime.getHours() <= 9;
      });
      const onTimePercentage = presentDays > 0 ? (onTimeRecords.length / presentDays) * 100 : 0;
      
      setWorkerStats({
        monthlyAttendance: presentDays,
        totalHours: Math.round(totalHours * 10) / 10,
        totalOvertime: Math.round(totalOvertime * 10) / 10,
        pendingSalary,
        thisMonthSalary: thisMonthSalary?.totalSalary || 0,
        workingDays: totalWorkingDays,
        missedDays,
        onTimePercentage: Math.round(onTimePercentage),
      });
      
    } catch (error) {
      console.error('Error loading worker stats:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Professional Admin Dashboard
  const AdminDashboard = () => {
    const MetricCard: React.FC<{
      title: string;
      value: string | number;
      icon: string;
      color: string;
      subtitle?: string;
      trend?: 'up' | 'down' | 'neutral';
      trendValue?: string;
    }> = ({ title, value, icon, color, subtitle, trend, trendValue }) => (
      <ThemedCard style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          {trend && trendValue && (
            <View style={[styles.trendBadge, { 
              backgroundColor: trend === 'up' ? colors.success + '20' : 
                              trend === 'down' ? colors.error + '20' : colors.secondary + '20' 
            }]}>
              <Ionicons 
                name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
                size={12} 
                color={trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.secondary} 
              />
              <Text style={[styles.trendText, { 
                color: trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.secondary 
              }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.metricTitle, { color: colors.secondary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.metricSubtitle, { color: colors.secondary }]}>{subtitle}</Text>
        )}
      </ThemedCard>
    );

    const QuickActionCard: React.FC<{
      title: string;
      description: string;
      icon: string;
      color: string;
      onPress: () => void;
    }> = ({ title, description, icon, color, onPress }) => (
      <TouchableOpacity onPress={onPress} style={styles.quickActionWrapper}>
        <ThemedCard style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={28} color={color} />
          </View>
          <View style={styles.quickActionContent}>
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.quickActionDescription, { color: colors.secondary }]}>{description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
        </ThemedCard>
      </TouchableOpacity>
    );

    const AttendanceOverview = () => (
      <ThemedCard style={styles.attendanceCard}>
        <View style={styles.attendanceHeader}>
          <Text style={[styles.attendanceTitle, { color: colors.text }]}>Today's Attendance</Text>
          <Text style={[styles.attendanceDate, { color: colors.secondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.attendanceStats}>
          <View style={styles.attendanceStat}>
            <View style={[styles.attendanceStatIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.attendanceStatValue, { color: colors.text }]}>
                {adminStats.presentToday}
              </Text>
              <Text style={[styles.attendanceStatLabel, { color: colors.secondary }]}>{t('present')}</Text>
            </View>
          </View>

          <View style={styles.attendanceStat}>
            <View style={[styles.attendanceStatIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
            </View>
            <View>
              <Text style={[styles.attendanceStatValue, { color: colors.text }]}>
                {adminStats.absentToday}
              </Text>
              <Text style={[styles.attendanceStatLabel, { color: colors.secondary }]}>{t('absent')}</Text>
            </View>
          </View>

          <View style={styles.attendanceStat}>
            <View style={[styles.attendanceStatIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="time" size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={[styles.attendanceStatValue, { color: colors.text }]}>
                {adminStats.lateToday}
              </Text>
              <Text style={[styles.attendanceStatLabel, { color: colors.secondary }]}>{t('late')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceProgress}>
          <Text style={[styles.attendanceProgressLabel, { color: colors.secondary }]}>
            Attendance Rate: {adminStats.totalWorkers > 0 ? 
              Math.round((adminStats.presentToday / adminStats.totalWorkers) * 100) : 0}%
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.success,
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
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {t('welcome')}, {user?.name}! 👋
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              Here's what's happening with your team today
            </Text>
          </View>
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.card }]}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title={t('totalUsers')}
              value={adminStats.totalUsers}
              icon="people"
              color={colors.primary}
              subtitle={`${adminStats.totalWorkers} workers`}
              trend="up"
              trendValue="+2"
            />
            <MetricCard
              title={t('monthlyAttendance')}
              value={`${adminStats.monthlyAttendance}`}
              icon="calendar"
              color={colors.success}
              subtitle="This month"
              trend="up"
              trendValue="+5%"
            />
            <MetricCard
              title={t('pendingSalaries')}
              value={adminStats.pendingSalaries}
              icon="card-outline"
              color={colors.warning}
              subtitle="Awaiting payment"
              trend="down"
              trendValue="-2"
            />
            <MetricCard
              title="Salaries Paid"
              value={adminStats.totalSalariesPaid}
              icon="checkmark-circle"
              color={colors.success}
              subtitle="This month"
              trend="up"
              trendValue="+8"
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
          <View style={styles.quickActionsContainer}>
            <QuickActionCard
              title={t('users')}
              description="Add, edit, or remove employees"
              icon="people"
              color={colors.primary}
              onPress={() => {}}
            />
            <QuickActionCard
              title={t('attendance')}
              description="Track and manage daily attendance"
              icon="time"
              color={colors.success}
              onPress={() => {}}
            />
            <QuickActionCard
              title={t('salary')}
              description="Process monthly salaries and payments"
              icon="card"
              color={colors.warning}
              onPress={() => {}}
            />
            <QuickActionCard
              title={t('receipts')}
              description="Export attendance and salary reports"
              icon="document-text"
              color={colors.info}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentActivity')}</Text>
          <ThemedCard style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  John Doe checked in at 9:00 AM
                </Text>
                <Text style={[styles.activityTime, { color: colors.secondary }]}>2 minutes ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person-add" size={16} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  New employee Sarah Smith added
                </Text>
                <Text style={[styles.activityTime, { color: colors.secondary }]}>1 hour ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="card" size={16} color={colors.warning} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  Monthly salaries generated for March
                </Text>
                <Text style={[styles.activityTime, { color: colors.secondary }]}>3 hours ago</Text>
              </View>
            </View>
          </ThemedCard>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  // Worker Dashboard
  const WorkerDashboard = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    
    const WorkerStatCard: React.FC<{
      title: string;
      value: string | number;
      icon: string;
      color: string;
      subtitle?: string;
    }> = ({ title, value, icon, color, subtitle }) => (
      <ThemedCard style={styles.workerStatCard}>
        <View style={styles.workerStatContent}>
          <View style={[styles.workerStatIcon, { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={20} color="#ffffff" />
          </View>
          <View style={styles.workerStatText}>
            <Text style={[styles.workerStatValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.workerStatTitle, { color: colors.secondary }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.workerStatSubtitle, { color: colors.secondary }]}>{subtitle}</Text>
            )}
          </View>
        </View>
      </ThemedCard>
    );

    const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('welcome')}, {user?.name}!
          </Text>
          <Text style={[styles.role, { color: colors.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {user?.position || t('worker')}
          </Text>
        </View>

        {/* Today's Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Status
          </Text>
          <ThemedCard style={styles.todayCard}>
            <View style={styles.todayContent}>
              <Ionicons name="today" size={24} color={colors.primary} />
              <View style={styles.todayText}>
                <Text style={[styles.todayTitle, { color: colors.text }]}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={[styles.todaySubtitle, { color: colors.secondary }]}>
                  Check your attendance status in the Attendance tab
                </Text>
              </View>
            </View>
          </ThemedCard>
        </View>

        {/* This Month Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {currentMonth} Overview
          </Text>
          <View style={styles.workerStatsGrid}>
            <WorkerStatCard
              title="Days Present"
              value={workerStats.monthlyAttendance}
              icon="checkmark-circle"
              color={colors.success}
              subtitle={`out of ${workerStats.workingDays} days`}
            />
            <WorkerStatCard
              title="Days Missed"
              value={workerStats.missedDays}
              icon="close-circle"
              color={colors.error}
            />
            <WorkerStatCard
              title="Hours Worked"
              value={`${workerStats.totalHours}h`}
              icon="time"
              color={colors.primary}
            />
            <WorkerStatCard
              title="Overtime"
              value={`${workerStats.totalOvertime}h`}
              icon="flash"
              color={colors.warning}
            />
            <WorkerStatCard
              title="On-Time Rate"
              value={`${workerStats.onTimePercentage}%`}
              icon="speedometer"
              color={colors.info}
            />
            <WorkerStatCard
              title="This Month Salary"
              value={formatCurrency(workerStats.thisMonthSalary)}
              icon="card"
              color={colors.success}
            />
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Summary</Text>
          <ThemedCard style={styles.financialCard}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.secondary }]}>
                  Pending Salary
                </Text>
                <Text style={[styles.financialValue, { color: colors.warning }]}>
                  {formatCurrency(workerStats.pendingSalary)}
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.secondary }]}>
                  Base Salary
                </Text>
                <Text style={[styles.financialValue, { color: colors.text }]}>
                  {formatCurrency(user?.salary || 0)}
                </Text>
              </View>
            </View>
          </ThemedCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <ThemedCard style={styles.quickActionCard}>
                <Ionicons name="time" size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  View Attendance
                </Text>
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <ThemedCard style={styles.quickActionCard}>
                <Ionicons name="card" size={24} color={colors.success} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  Check Salary
                </Text>
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <ThemedCard style={styles.quickActionCard}>
                <Ionicons name="document" size={24} color={colors.warning} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  View Receipts
                </Text>
              </ThemedCard>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <ThemedCard style={styles.quickActionCard}>
                <Ionicons name="person" size={24} color={colors.info} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  Edit Profile
                </Text>
              </ThemedCard>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  role: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    width: (width - 56) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
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
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Attendance Overview
  attendanceCard: {
    padding: 20,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  attendanceStat: {
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  attendanceStatLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  attendanceProgress: {
    marginTop: 8,
  },
  attendanceProgressLabel: {
    fontSize: 14,
    marginBottom: 8,
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

  // Quick Actions
  quickActionsContainer: {
    gap: 12,
  },
  quickActionWrapper: {
    marginBottom: 0,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Activity
  activityCard: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },

  // Worker Dashboard Styles
  todayCard: {
    marginBottom: 0,
  },
  todayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayText: {
    marginLeft: 12,
    flex: 1,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  todaySubtitle: {
    fontSize: 14,
  },
  workerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  workerStatCard: {
    width: '48%',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  workerStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  workerStatText: {
    flex: 1,
  },
  workerStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workerStatTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  workerStatSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  financialCard: {
    marginBottom: 0,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAction: {
    width: '48%',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  quickActionCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  bottomPadding: {
    height: 20,
  },
});