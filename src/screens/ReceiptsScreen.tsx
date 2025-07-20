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
import { CreateReceiptModal } from '../components/CreateReceiptModal';
import PDFLanguageModal from '../components/PDFLanguageModal';
import { apiService } from '../services/api';
import { Receipt, User } from '../types';
import { useDebounce } from '../hooks/useDebounce';

export const ReceiptsScreen: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // Debounce search query to prevent too many re-renders
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadReceipts();
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, []);

  // Memoized filtered receipts using debounced search query
  const filteredReceipts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return receipts;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return receipts.filter(receipt => {
      // Safe string operations with fallback to empty string
      const userName = (receipt?.userId?.name || '').toLowerCase();
      const userEmail = (receipt?.userId?.email || '').toLowerCase();
      const type = (receipt?.type || '').toLowerCase();
      const description = (receipt?.description || '').toLowerCase();
      const amount = (receipt?.amount || 0).toString();
      const date = receipt?.date ? new Date(receipt.date).toLocaleDateString().toLowerCase() : '';

      return userName.includes(query) ||
             userEmail.includes(query) ||
             type.includes(query) ||
             description.includes(query) ||
             amount.includes(query) ||
             date.includes(query);
    });
  }, [receipts, debouncedSearchQuery]);

  const loadReceipts = useCallback(async () => {
    try {
      const response = await apiService.getReceipts(
        user?.role === 'worker' ? user._id : undefined
      );
      if (response.success && response.data) {
        // Handle nested response structure
        const actualData = response.data.data || response.data;
        if (Array.isArray(actualData)) {
          setReceipts(actualData);
        } else {
          setReceipts([]);
        }
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      setReceipts([]);
      Alert.alert(t('error'), t('failedToLoadReceipts'));
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
          setUsers(actualData);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReceipts();
  }, [loadReceipts]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleExportPDF = useCallback(async (language: string) => {
    if (user?.role !== 'admin') return;

    try {
      setExporting(true);
      await apiService.exportAllReceiptsPDF(language);
      Alert.alert(t('success'), t('receiptsPDFExported'));
    } catch (error) {
      console.error('Error exporting receipts PDF:', error);
      Alert.alert(t('error'), t('failedToExportReceiptsPDF'));
    } finally {
      setExporting(false);
      setShowLanguageModal(false);
    }
  }, [user?.role, t]);

  const handleDownloadReceipt = useCallback(async (receipt: Receipt) => {
    setSelectedReceiptId(receipt._id);
    setShowLanguageModal(true);
  }, []);

  const handleDownloadReceiptWithLanguage = useCallback(async (language: string) => {
    if (!selectedReceiptId) return;

    try {
      setDownloadingId(selectedReceiptId);
      await apiService.downloadIndividualReceiptPDF(selectedReceiptId, language);
      Alert.alert(t('success'), t('receiptPDFDownloaded'));
    } catch (error) {
      console.error('Error downloading receipt PDF:', error);
      Alert.alert(t('error'), t('failedToDownloadReceiptPDF'));
    } finally {
      setDownloadingId(null);
      setSelectedReceiptId(null);
      setShowLanguageModal(false);
    }
  }, [selectedReceiptId, t]);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleReceiptCreated = useCallback(() => {
    loadReceipts();
  }, [loadReceipts]);

  const formatCurrency = useCallback((amount: number) => {
    return `${(amount || 0).toLocaleString()} DH`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const ReceiptCard = React.memo<{ receipt: Receipt }>(({ receipt }) => {
    const isDownloading = downloadingId === receipt._id;
    
    return (
      <ThemedCard style={styles.receiptCard}>
        <View style={styles.cardHeader}>
          <View style={styles.typeSection}>
            <View style={[styles.typeIcon, { backgroundColor: colors.success }]}>
              <Ionicons
                name={receipt?.type === 'salary' ? 'card' : receipt?.type === 'invoice' ? 'document' : 'cash'}
                size={20}
                color="#ffffff"
              />
            </View>
            <View style={styles.receiptInfo}>
              <Text style={[styles.receiptType, { color: colors.text }]}>
                {receipt?.type === 'payment' ? t('payment') : 
                 receipt?.type === 'invoice' ? t('invoice') : 
                 (receipt?.type || '').charAt(0).toUpperCase() + (receipt?.type || '').slice(1)}
              </Text>
              <Text style={[styles.receiptDate, { color: colors.secondary }]}>
                {receipt?.date ? formatDate(receipt.date) : 'Unknown Date'}
              </Text>
              {user?.role === 'admin' && receipt?.userId && (
                <Text style={[styles.userName, { color: colors.secondary }]}>
                  {receipt.userId.name || 'Unknown User'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatCurrency(receipt?.amount || 0)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDownloadReceipt(receipt)}
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
        </View>

        <Text style={[styles.description, { color: colors.text }]}>
          {receipt?.description || 'No description'}
        </Text>

        {receipt?.metadata && (
          <View style={styles.metadata}>
            <Text style={[styles.metadataLabel, { color: colors.secondary }]}>
              {t('additionalInfo')}:
            </Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>
              {typeof receipt.metadata === 'object' 
                ? JSON.stringify(receipt.metadata, null, 2)
                : receipt.metadata}
            </Text>
          </View>
        )}
      </ThemedCard>
    );
  });

  // Calculate totals for summary
  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + (receipt?.amount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('receipts')}
        </Text>
        
        {user?.role === 'admin' && (
          <View style={styles.headerButtons}>
            <ThemedButton
              title={t('exportPDF')}
              onPress={() => {
                setSelectedReceiptId(null);
                setShowLanguageModal(true);
              }}
              size="small"
              style={styles.exportButton}
              variant="outline"
              loading={exporting}
              disabled={exporting}
            />
            <ThemedButton
              title={t('createReceipt')}
              onPress={openCreateModal}
              size="small"
              style={styles.createButton}
            />
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder={`${t('search')} ${t('receipts').toLowerCase()}...`}
        />
      </View>

      {/* Summary Card */}
      {filteredReceipts.length > 0 && (
        <View style={styles.summaryContainer}>
          <ThemedCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="stats-chart" size={24} color={colors.primary} />
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {t('paymentSummary')}
              </Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.secondary }]}>
                  {t('totalPayments')}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {filteredReceipts.length}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.secondary }]}>
                  {t('totalAmount')}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
            </View>
            <View style={styles.typeBreakdown}>
              <View style={styles.typeItem}>
                <View style={[styles.typeIndicator, { backgroundColor: colors.success }]} />
                <Text style={[styles.typeText, { color: colors.text }]}>
                  {searchQuery ? 'Filtered' : t('allPayments')}: {filteredReceipts.length}
                </Text>
              </View>
            </View>
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
        ) : filteredReceipts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? `No receipts found for "${searchQuery}"` : t('noData')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {searchQuery ? 'Try a different search term' : t('noPaymentReceipts')}
            </Text>
          </View>
        ) : (
          <>
            {searchQuery && (
              <View style={styles.searchResults}>
                <Text style={[styles.searchResultsText, { color: colors.secondary }]}>
                  {filteredReceipts.length} {filteredReceipts.length === 1 ? 'receipt' : 'receipts'} found
                </Text>
              </View>
            )}
            {filteredReceipts.map((receipt) => (
              <ReceiptCard key={receipt._id} receipt={receipt} />
            ))}
          </>
        )}
      </ScrollView>

      <CreateReceiptModal
        visible={showCreateModal}
        users={users}
        onClose={closeCreateModal}
        onSuccess={handleReceiptCreated}
      />
      
      <PDFLanguageModal
        visible={showLanguageModal}
        onClose={() => {
          setShowLanguageModal(false);
          setSelectedReceiptId(null);
        }}
        onGenerate={selectedReceiptId ? handleDownloadReceiptWithLanguage : handleExportPDF}
        title={selectedReceiptId ? "Download Receipt" : "Export All Receipts"}
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
  createButton: {
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
    marginBottom: 0,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  typeBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  receiptCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  receiptDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  userName: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 11,
    fontFamily: 'monospace',
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