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
import { SalaryRecord } from '../types';
import { getTranslatedMonth, getCurrentMonthNumber, getCurrentMonthName } from '../utils/dateUtils';

export const SalaryScreen: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadSalaryRecords();
  }, []);

  const loadSalaryRecords = async () => {
    try {
      const response = await apiService.getSalaryRecords(
        user?.role === 'worker' ? user._id : undefined
      );
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        if (Array.isArray(actualData)) {
          setSalaryRecords(actualData);
        } else {
          setSalaryRecords([]);
        }
      } else {
        setSalaryRecords([]);
      }
    } catch (error) {
      console.error('Error loading salary records:', error);
      setSalaryRecords([]);
      Alert.alert(t('error'), t('failedToLoadSalaryRecords'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSalaryRecords();
  };

  const handleExportPDF = async () => {
    if (user?.role !== 'admin') return;

    try {
      setExporting(true);
      await apiService.exportAllSalariesPDF('en');
      Alert.alert(t('success'), t('salariesPDFExported'));
    } catch (error) {
      console.error('Error exporting salaries PDF:', error);
      Alert.alert(t('error'), t('failedToExportSalariesPDF'));
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateMonthly = () => {
    const currentDate = new Date();
    const currentMonthNumber = getCurrentMonthNumber();
    const currentMonthName = getCurrentMonthName();
    const currentYear = currentDate.getFullYear();

    Alert.alert(
      t('generateDailySalaries'),
      t('generateDailySalaryRecords', { 
        month: t(getTranslatedMonth(currentMonthNumber)), 
        year: currentYear.toString() 
      }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('generate'),
          style: 'default',
          onPress: async () => {
            try {
              const response = await apiService.generateMonthlySalaries(currentMonthName, currentYear);
              if (response.success) {
                Alert.alert(t('success'), t('dailySalaryRecordsGenerated'));
                loadSalaryRecords();
              } else {
                Alert.alert(t('error'), response.error || t('failedToGenerateDailySalaryRecords'));
              }
            } catch (error) {
              console.error('Error generating daily salaries:', error);
              Alert.alert(t('error'), t('failedToGenerateDailySalaryRecords'));
            }
          },
        },
      ]
    );
  };

  const handleMonthlyCheckout = (record: SalaryRecord) => {
    const userId = user?.role === 'admin' ? record.userId._id : user?._id;
    if (!userId) return;

    const monthNumber = new Date(`${record.month} 1, ${record.year}`).getMonth() + 1;

    Alert.alert(
      t('dailySalaryCheckout'),
      t('checkoutDailySalary', { 
        month: t(getTranslatedMonth(monthNumber)), 
        year: record.year.toString() 
      }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('checkout'),
          style: 'default',
          onPress: async () => {
            try {
              const response = await apiService.checkoutMonthlySalary(
                userId,
                record.month,
                record.year
              );
              if (response.success) {
                Alert.alert(
                  t('success'),
                  t('dailySalaryCheckoutCompleted'),
                  [
                    {
                      text: t('viewReceipt'),
                      onPress: () => {
                        // Navigate to receipts or show receipt
                        console.log('Navigate to receipt:', response.data?.receipt);
                      },
                    },
                    { text: 'OK' },
                  ]
                );
                loadSalaryRecords();
              } else {
                Alert.alert(t('error'), response.error || t('failedToCompleteDailySalaryCheckout'));
              }
            } catch (error) {
              console.error('Error during daily salary checkout:', error);
              Alert.alert(t('error'), t('failedToCompleteDailySalaryCheckout'));
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} DH`;
  };

  const SalaryCard: React.FC<{ record: SalaryRecord }> = ({ record }) => {
    const monthNumber = new Date(`${record.month} 1, ${record.year}`).getMonth() + 1;
    
    return (
      <ThemedCard style={styles.salaryCard}>
        <View style={styles.cardHeader}>
          <View style={styles.periodInfo}>
            <Text style={[styles.periodText, { color: colors.text }]}>
              {t(getTranslatedMonth(monthNumber))} {record.year}
            </Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: record.isPaid ? colors.success : colors.warning 
            }]}>
              <Text style={styles.statusText}>
                {record.isPaid ? t('paid') : t('pending')}
              </Text>
            </View>
          </View>
          {record.isPaid && record.paidAt && (
            <Text style={[styles.paidDate, { color: colors.secondary }]}>
              {t('paidOn')} {new Date(record.paidAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.salaryBreakdown}>
          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('presentDays')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.text }]}>
              {record.presentDays || 0}/{record.totalWorkingDays || 0}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('absentDays')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.error }]}>
              {record.absentDays || 0}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('dailyRate')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.text }]}>
              {record.presentDays ? formatCurrency(record.baseSalary / record.presentDays) : '0 DH'}/{t('perDay')}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('earnedSalary')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.success }]}>
              {formatCurrency(record.baseSalary)}
            </Text>
          </View>

          {record.deductions > 0 && (
            <View style={styles.salaryRow}>
              <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
                {t('missedSalary')}:
              </Text>
              <Text style={[styles.salaryValue, { color: colors.error }]}>
                -{formatCurrency(record.deductions)}
              </Text>
            </View>
          )}

          {record.bonuses > 0 && (
            <View style={styles.salaryRow}>
              <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
                {t('bonuses')}:
              </Text>
              <Text style={[styles.salaryValue, { color: colors.success }]}>
                +{formatCurrency(record.bonuses)}
              </Text>
            </View>
          )}

          <View style={[styles.salaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('totalPaid')}:
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(record.totalSalary)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {user?.role === 'admin' && !record.isPaid && (
            <ThemedButton
              title={t('markAsPaid')}
              onPress={() => {/* Handle mark as paid */}}
              size="small"
              variant="outline"
              style={styles.actionButton}
            />
          )}
          
          {user?.role === 'worker' && !record.isPaid && (
            <ThemedButton
              title={t('dailyCheckout')}
              onPress={() => handleMonthlyCheckout(record)}
              size="small"
              style={styles.actionButton}
            />
          )}

          <ThemedButton
            title={t('generateSalarySlip')}
            onPress={() => {/* Handle generate slip */}}
            size="small"
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </ThemedCard>
    );
  };

  // Calculate pending salaries total
  const pendingTotal = salaryRecords
    .filter(record => !record.isPaid)
    .reduce((sum, record) => sum + record.totalSalary, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('dailySalary')}
        </Text>
        
        {user?.role === 'admin' && (
          <View style={styles.headerButtons}>
            <ThemedButton
              title={t('exportPDF')}
              onPress={handleExportPDF}
              size="small"
              variant="outline"
              style={styles.exportButton}
              loading={exporting}
              disabled={exporting}
            />
            <ThemedButton
              title={t('generateDaily')}
              onPress={handleGenerateMonthly}
              size="small"
              style={styles.generateButton}
            />
          </View>
        )}
      </View>

      {pendingTotal > 0 && (
        <View style={styles.summaryContainer}>
          <ThemedCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="card" size={24} color={colors.primary} />
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {t('pendingDailySalaries')}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.primary }]}>
              {formatCurrency(pendingTotal)}
            </Text>
          </ThemedCard>
        </View>
      )}

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
        ) : salaryRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('noData')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {user?.role === 'admin' ? t('generateDaily') : t('noData')}
            </Text>
          </View>
        ) : (
          salaryRecords.map((record) => (
            <SalaryCard key={`${record.userId._id}-${record.month}-${record.year}`} record={record} />
          ))
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
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    paddingHorizontal: 12,
  },
  generateButton: {
    paddingHorizontal: 16,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  summaryCard: {
    padding: 20,
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  salaryCard: {
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  periodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  paidDate: {
    fontSize: 12,
  },
  salaryBreakdown: {
    marginBottom: 16,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  salaryLabel: {
    fontSize: 14,
  },
  salaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
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