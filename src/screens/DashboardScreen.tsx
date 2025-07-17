import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemedCard } from '../components/ThemedCard';
import { apiService } from '../services/api';

interface DashboardStats {
  totalUsers: number;
  monthlyAttendance: number;
  pendingSalaries: number;
  recentActivity: any[];
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
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        const actualStats = response.data.data || response.data;
        setAdminStats(actualStats);
      } else {
        setAdminStats({
          totalUsers: 3,
          monthlyAttendance: 54,
          pendingSalaries: 6,
          recentActivity: [],
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const loadWorkerStats = async () => {
    try {
      if (!user?._id) return;
      
      // Load worker's personal stats
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
      
      // Calculate on-time percentage (assuming 9 AM is on time)
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

  // Admin Dashboard
  const AdminDashboard = () => {
    const StatCard: React.FC<{
      title: string;
      value: string | number;
      icon: string;
      color: string;
    }> = ({ title, value, icon, color }) => (
      <ThemedCard style={styles.statCard}>
        <View style={styles.statContent}>
          <View style={[styles.statIcon, { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={24} color="#ffffff" />
          </View>
          <View style={styles.statText}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: colors.secondary }]}>{title}</Text>
          </View>
        </View>
      </ThemedCard>
    );

    const QuickAction: React.FC<{
      title: string;
      icon: string;
      onPress: () => void;
    }> = ({ title, icon, onPress }) => (
      <TouchableOpacity onPress={onPress}>
        <ThemedCard style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Ionicons name={icon as any} size={32} color={colors.primary} />
            <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
          </View>
        </ThemedCard>
      </TouchableOpacity>
    );

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
            {t('admin')} Dashboard
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title={t('totalUsers')}
            value={adminStats.totalUsers}
            icon="people"
            color={colors.primary}
          />
          <StatCard
            title={t('monthlyAttendance')}
            value={adminStats.monthlyAttendance}
            icon="calendar"
            color={colors.success}
          />
          <StatCard
            title={t('pendingSalaries')}
            value={adminStats.pendingSalaries}
            icon="card"
            color={colors.warning}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <QuickAction
              title={t('addUser')}
              icon="person-add"
              onPress={() => {}}
            />
            <QuickAction
              title={t('attendance')}
              icon="time"
              onPress={() => {}}
            />
            <QuickAction
              title={t('salary')}
              icon="card"
              onPress={() => {}}
            />
            <QuickAction
              title={t('receipts')}
              icon="document"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('recentActivity')}
          </Text>
          <ThemedCard>
            <Text style={[styles.noData, { color: colors.secondary }]}>
              {t('noData')}
            </Text>
          </ThemedCard>
        </View>
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
            Welcome back, {user?.name}!
          </Text>
          <Text style={[styles.role, { color: colors.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {user?.position || 'Employee'}
          </Text>
        </View>

        {/* Today's Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Status</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
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
            Loading...
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  // Admin styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  
  // Worker styles
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
});