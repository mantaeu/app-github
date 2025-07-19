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

export const SalaryScreen: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadSalaryRecords();
  }, []);

  const loadSalaryRecords = async () => {
    try {
      console.log('🔍 Loading salary records...');
      const response = await apiService.getSalaryRecords(
        user?.role === 'worker' ? user._id : undefined
      );
      console.log('🔍 Salary API response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure
        const actualData = response.data.data || response.data;
        console.log('🔍 Actual salary data:', actualData);
        
        if (Array.isArray(actualData)) {
          setSalaryRecords(actualData);
        } else {
          setSalaryRecords([]); // Set empty array if not an array
        }
      } else {
        setSalaryRecords([]); // Set empty array if no data
      }
    } catch (error) {
      console.error('Error loading salary records:', error);
      setSalaryRecords([]); // Set empty array on error
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
      await apiService.exportAllSalariesPDF();
      Alert.alert(t('success'), t('salariesPDFExported'));
    } catch (error) {
      console.error('Error exporting salaries PDF:', error);
      Alert.alert(t('error'), t('failedToExportSalariesPDF'));
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateSalarySlip = async (record: SalaryRecord) => {
    try {
      setDownloadingId(record._id);
      await apiService.downloadIndividualSalarySlipPDF(record._id);
      Alert.alert(t('success'), t('salarySlipPDFDownloaded'));
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      Alert.alert(t('error'), t('failedToDownloadSalarySlip'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleMarkAsPaid = async (recordId: string) => {
    if (user?.role !== 'admin') return;

    try {
      const response = await apiService.markSalaryAsPaid(recordId);

      if (response.success) {
        Alert.alert(t('success'), t('salaryMarkedAsPaid'));
        loadSalaryRecords();
      } else {
        Alert.alert(t('error'), response.error || t('failedToUpdateSalaryStatus'));
      }
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      Alert.alert(t('error'), t('failedToUpdateSalaryStatus'));
    }
  };

  const handleGenerateMonthly = async () => {
    if (user?.role !== 'admin') return;

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    Alert.alert(
      t('generateMonthlySalaries'),
      `${t('generateSalaryRecordsFor')} ${currentMonth} ${currentYear}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('generate'),
          onPress: async () => {
            try {
              const response = await apiService.generateMonthlySalaries(currentMonth, currentYear);
              if (response.success) {
                Alert.alert(t('success'), t('monthlySalaryRecordsGenerated'));
                loadSalaryRecords();
              } else {
                Alert.alert(t('error'), response.error || t('failedToGenerateMonthlySalaries'));
              }
            } catch (error) {
              console.error('Error generating monthly salaries:', error);
              Alert.alert(t('error'), t('failedToGenerateMonthlySalaries'));
            }
          },
        },
      ]
    );
  };

  const handleMonthlyCheckout = async (record: SalaryRecord) => {
    const userId = user?.role === 'admin' ? record.userId : user?._id;
    if (!userId) return;

    Alert.alert(
      t('monthlyCheckout'),
      `${t('checkoutSalaryFor')} ${record.month} ${record.year}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('checkout'),
          onPress: async () => {
            try {
              const response = await apiService.checkoutMonthlySalary(
                userId.toString(),
                record.month,
                record.year
              );
              if (response.success) {
                Alert.alert(
                  t('success'),
                  t('monthlyCheckoutCompleted'),
                  [
                    {
                      text: t('viewReceipt'),
                      onPress: () => {
                        // Navigate to receipts or show receipt details
                        console.log('Receipt:', response.data?.receipt);
                      },
                    },
                    { text: 'OK' },
                  ]
                );
                loadSalaryRecords();
              } else {
                Alert.alert(t('error'), response.error || t('failedToCompleteMonthlycheckout'));
              }
            } catch (error) {
              console.error('Error during monthly checkout:', error);
              Alert.alert(t('error'), t('failedToCompleteMonthlycheckout'));
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const SalaryCard: React.FC<{ record: SalaryRecord }> = ({ record }) => {
    const isDownloading = downloadingId === record._id;
    
    return (
      <ThemedCard style={styles.salaryCard}>
        <View style={styles.cardHeader}>
          <View style={styles.periodSection}>
            <Text style={[styles.period, { color: colors.text }]}>
              {record.month} {record.year}
            </Text>
            <View style={styles.statusContainer}>
              <Ionicons
                name={record.isPaid ? 'checkmark-circle' : 'time'}
                size={16}
                color={record.isPaid ? colors.success : colors.warning}
              />
              <Text
                style={[
                  styles.status,
                  { color: record.isPaid ? colors.success : colors.warning },
                ]}
              >
                {record.isPaid ? t('paid') : t('pending')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleGenerateSalarySlip(record)}
            style={[
              styles.downloadButton, 
              { backgroundColor: isDownloading ? colors.secondary : colors.primary }
            ]}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Ionicons name="hourglass" size={16} color="#ffffff" />
            ) : (
              <Ionicons name="download" size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.salaryBreakdown}>
          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('baseSalary')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.text }]}>
              {formatCurrency(record.baseSalary)}
            </Text>
          </View>

          {record.overtime > 0 && (
            <View style={styles.salaryRow}>
              <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
                {t('overtime')}:
              </Text>
              <Text style={[styles.salaryValue, { color: colors.success }]}>
                +{formatCurrency(record.overtime)}
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

          {record.deductions > 0 && (
            <View style={styles.salaryRow}>
              <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
                {t('deductions')}:
              </Text>
              <Text style={[styles.salaryValue, { color: colors.error }]}>
                -{formatCurrency(record.deductions)}
              </Text>
            </View>
          )}

          <View style={[styles.salaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('totalSalary')}:
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(record.totalSalary)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {user?.role === 'admin' && !record.isPaid && (
            <ThemedButton
              title={t('markAsPaid')}
              onPress={() => handleMarkAsPaid(record._id)}
              size="small"
              variant="outline"
              style={styles.actionButton}
            />
          )}
          
          {user?.role === 'worker' && !record.isPaid && (
            <ThemedButton
              title={t('monthlyCheckout')}
              onPress={() => handleMonthlyCheckout(record)}
              size="small"
              style={styles.actionButton}
            />
          )}
        </View>

        {record.paidAt && (
          <Text style={[styles.paidDate, { color: colors.secondary }]}>
            {t('paidOn')} {new Date(record.paidAt).toLocaleDateString()}
          </Text>
        )}
      </ThemedCard>
    );
  };

  // Calculate total pending salary for workers - ensure salaryRecords is always an array
  const salaryArray = Array.isArray(salaryRecords) ? salaryRecords : [];
  const totalPending = salaryArray
    .filter(record => !record.isPaid)
    .reduce((sum, record) => sum + record.totalSalary, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('salary')}
        </Text>
        
        {user?.role === 'admin' && (
          <View style={styles.headerButtons}>
            <ThemedButton
              title={t('exportPDF')}
              onPress={handleExportPDF}
              size="small"
              style={styles.exportButton}
              variant="outline"
              loading={exporting}
              disabled={exporting}
            />
            <ThemedButton
              title={t('generateMonthly')}
              onPress={handleGenerateMonthly}
              size="small"
              style={styles.generateButton}
            />
          </View>
        )}
      </View>

      {user?.role === 'worker' && totalPending > 0 && (
        <ThemedCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="card" size={24} color={colors.primary} />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {t('pendingSalaries')}
            </Text>
          </View>
          <Text style={[styles.summaryAmount, { color: colors.primary }]}>
            {formatCurrency(totalPending)}
          </Text>
        </ThemedCard>
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
        ) : salaryArray.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('noData')}
            </Text>
          </View>
        ) : (
          salaryArray.map((record) => (
            <SalaryCard key={record._id} record={record} />
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
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  periodSection: {
    flex: 1,
  },
  period: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  actionButtons: {
    marginBottom: 12,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  paidDate: {
    fontSize: 12,
    fontStyle: 'italic',
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
});