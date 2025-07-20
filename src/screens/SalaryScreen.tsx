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
import PDFLanguageModal from '../components/PDFLanguageModal';
import { apiService } from '../services/api';
import { SalaryRecord } from '../types';
import { getTranslatedMonth, getCurrentMonthNumber, getCurrentMonthName } from '../utils/dateUtils';
import { useDebounce } from '../hooks/useDebounce';

export const SalaryScreen: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // Debounce search query to prevent too many re-renders
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadSalaryRecords();
  }, []);

  // Memoized filtered records using debounced search query
  const filteredRecords = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return salaryRecords;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return salaryRecords.filter(record => {
      // Safe string operations with fallback to empty string
      const userName = (record?.userId?.name || '').toLowerCase();
      const userEmail = (record?.userId?.email || '').toLowerCase();
      const month = (record?.month || '').toLowerCase();
      const year = (record?.year || '').toString();
      const status = record?.isPaid ? 'paid' : 'pending';
      const totalSalary = (record?.totalSalary || 0).toString();

      return userName.includes(query) ||
             userEmail.includes(query) ||
             month.includes(query) ||
             year.includes(query) ||
             status.includes(query) ||
             totalSalary.includes(query);
    });
  }, [salaryRecords, debouncedSearchQuery]);

  const loadSalaryRecords = useCallback(async () => {
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
  }, [user?.role, user?._id, t]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSalaryRecords();
  }, [loadSalaryRecords]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleExportPDF = useCallback(async (language: string) => {
    if (user?.role !== 'admin') return;

    try {
      setExporting(true);
      await apiService.exportAllSalariesPDF(language);
      Alert.alert(t('success'), t('salariesPDFExported'));
    } catch (error) {
      console.error('Error exporting salaries PDF:', error);
      Alert.alert(t('error'), t('failedToExportSalariesPDF'));
    } finally {
      setExporting(false);
      setShowLanguageModal(false);
    }
  }, [user?.role, t]);

  const handleGenerateMonthly = useCallback(() => {
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
  }, [t, loadSalaryRecords]);

  const handleMonthlyCheckout = useCallback((record: SalaryRecord) => {
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
  }, [user?.role, user?._id, t, loadSalaryRecords]);

  const handleMarkAsPaid = useCallback((record: SalaryRecord) => {
    if (user?.role !== 'admin') return;

    const monthNumber = new Date(`${record.month} 1, ${record.year}`).getMonth() + 1;
    const workerName = record.userId?.name || 'Unknown Worker';

    Alert.alert(
      t('markAsPaid'),
      `Mark ${workerName}'s salary for ${t(getTranslatedMonth(monthNumber))} ${record.year} as paid?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('markAsPaid'),
          style: 'default',
          onPress: async () => {
            try {
              const response = await apiService.markSalaryAsPaid(record._id);
              if (response.success) {
                Alert.alert(t('success'), `${workerName}'s salary has been marked as paid`);
                loadSalaryRecords();
              } else {
                Alert.alert(t('error'), response.error || t('failedToMarkAsPaid'));
              }
            } catch (error) {
              console.error('Error marking salary as paid:', error);
              Alert.alert(t('error'), t('failedToMarkAsPaid'));
            }
          },
        },
      ]
    );
  }, [user?.role, t, loadSalaryRecords]);

  const handleGenerateSalarySlip = useCallback((record: SalaryRecord) => {
    setSelectedSalaryId(record._id);
    setShowLanguageModal(true);
  }, []);

  const handleDownloadSalarySlipWithLanguage = useCallback(async (language: string) => {
    if (!selectedSalaryId) return;

    try {
      setDownloadingId(selectedSalaryId);
      await apiService.downloadIndividualSalarySlipPDF(selectedSalaryId, language);
      Alert.alert(t('success'), t('salarySlipDownloaded'));
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      Alert.alert(t('error'), t('failedToDownloadSalarySlip'));
    } finally {
      setDownloadingId(null);
      setSelectedSalaryId(null);
      setShowLanguageModal(false);
    }
  }, [selectedSalaryId, t]);

  const formatCurrency = useCallback((amount: number) => {
    return `${(amount || 0).toLocaleString()} DH`;
  }, []);

  const SalaryCard = React.memo<{ record: SalaryRecord }>(({ record }) => {
    const monthNumber = new Date(`${record?.month || 'January'} 1, ${record?.year || new Date().getFullYear()}`).getMonth() + 1;
    const isDownloading = downloadingId === record._id;
    
    return (
      <ThemedCard style={styles.salaryCard}>
        <View style={styles.cardHeader}>
          <View style={styles.periodInfo}>
            <Text style={[styles.periodText, { color: colors.text }]}>
              {t(getTranslatedMonth(monthNumber))} {record?.year || ''}
            </Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: record?.isPaid ? colors.success : colors.warning 
            }]}>
              <Text style={styles.statusText}>
                {record?.isPaid ? t('paid') : t('pending')}
              </Text>
            </View>
          </View>
          {user?.role === 'admin' && record?.userId && (
            <Text style={[styles.workerName, { color: colors.secondary }]}>
              {record.userId.name || 'Unknown Worker'}
            </Text>
          )}
          {record?.isPaid && record?.paidAt && (
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
              {record?.presentDays || 0}/{record?.totalWorkingDays || 0}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('absentDays')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.error }]}>
              {record?.absentDays || 0}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('dailyRate')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.text }]}>
              {record?.presentDays && record?.baseSalary ? formatCurrency(record.baseSalary / record.presentDays) : '0 DH'}/{t('perDay')}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
              {t('earnedSalary')}:
            </Text>
            <Text style={[styles.salaryValue, { color: colors.success }]}>
              {formatCurrency(record?.baseSalary || 0)}
            </Text>
          </View>

          {(record?.deductions || 0) > 0 && (
            <View style={styles.salaryRow}>
              <Text style={[styles.salaryLabel, { color: colors.secondary }]}>
                {t('missedSalary')}:
              </Text>
              <Text style={[styles.salaryValue, { color: colors.error }]}>
                -{formatCurrency(record.deductions)}
              </Text>
            </View>
          )}

          {(record?.bonuses || 0) > 0 && (
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
              {formatCurrency(record?.totalSalary || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {user?.role === 'admin' && !record?.isPaid && (
            <ThemedButton
              title={t('markAsPaid')}
              onPress={() => handleMarkAsPaid(record)}
              size="small"
              variant="outline"
              style={styles.actionButton}
            />
          )}
          
          {user?.role === 'worker' && !record?.isPaid && (
            <ThemedButton
              title={t('dailyCheckout')}
              onPress={() => handleMonthlyCheckout(record)}
              size="small"
              style={styles.actionButton}
            />
          )}

          <ThemedButton
            title={isDownloading ? t('downloading') : t('generateSalarySlip')}
            onPress={() => handleGenerateSalarySlip(record)}
            size="small"
            variant="outline"
            style={styles.actionButton}
            disabled={isDownloading}
          />
        </View>
      </ThemedCard>
    );
  });

  // Calculate pending salaries total
  const pendingTotal = filteredRecords
    .filter(record => !record?.isPaid)
    .reduce((sum, record) => sum + (record?.totalSalary || 0), 0);

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
              onPress={() => {
                setSelectedSalaryId(null);
                setShowLanguageModal(true);
              }}
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

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder={`${t('search')} ${t('salary').toLowerCase()}...`}
        />
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.secondary }]}>
              {t('loading')}
            </Text>
          </View>
        ) : filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? `No salary records found for "${searchQuery}"` : t('noData')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {searchQuery ? 'Try a different search term' : (user?.role === 'admin' ? t('generateDaily') : t('noData'))}
            </Text>
          </View>
        ) : (
          <>
            {searchQuery && (
              <View style={styles.searchResults}>
                <Text style={[styles.searchResultsText, { color: colors.secondary }]}>
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} found
                </Text>
              </View>
            )}
            {filteredRecords.map((record) => (
              <SalaryCard key={`${record?.userId?._id || 'unknown'}-${record?.month || 'unknown'}-${record?.year || 'unknown'}`} record={record} />
            ))}
          </>
        )}
      </ScrollView>

      <PDFLanguageModal
        visible={showLanguageModal}
        onClose={() => {
          setShowLanguageModal(false);
          setSelectedSalaryId(null);
        }}
        onGenerate={selectedSalaryId ? handleDownloadSalarySlipWithLanguage : handleExportPDF}
        title={selectedSalaryId ? "Download Salary Slip" : "Export All Salaries"}
        loading={exporting || !!downloadingId}
      />
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
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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