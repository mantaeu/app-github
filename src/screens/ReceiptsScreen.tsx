import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';
import { apiService } from '../services/api';
import { Receipt, User } from '../types';

export const ReceiptsScreen: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'payment',
    amount: '',
    description: '',
  });

  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadReceipts();
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, []);

  const loadReceipts = async () => {
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
  };

  const loadUsers = async () => {
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
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  const handleExportPDF = async () => {
    if (user?.role !== 'admin') return;

    try {
      setExporting(true);
      await apiService.exportAllReceiptsPDF();
      Alert.alert(t('success'), t('receiptsPDFExported'));
    } catch (error) {
      console.error('Error exporting receipts PDF:', error);
      Alert.alert(t('error'), t('failedToExportReceiptsPDF'));
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadReceipt = async (receipt: Receipt) => {
    try {
      setDownloadingId(receipt._id);
      await apiService.downloadIndividualReceiptPDF(receipt._id);
      Alert.alert(t('success'), t('receiptPDFDownloaded'));
    } catch (error) {
      console.error('Error downloading receipt PDF:', error);
      Alert.alert(t('error'), t('failedToDownloadReceiptPDF'));
    } finally {
      setDownloadingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      type: 'payment',
      amount: '',
      description: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleCreateReceipt = async () => {
    if (!formData.userId || !formData.amount || !formData.description) {
      Alert.alert(t('error'), t('fillAllRequiredFields'));
      return;
    }

    try {
      const receiptData = {
        userId: formData.userId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
      };

      const response = await apiService.createReceipt(receiptData);

      if (response.success) {
        Alert.alert(t('success'), t('receiptCreatedSuccessfully'));
        setShowCreateModal(false);
        resetForm();
        loadReceipts();
      } else {
        Alert.alert(t('error'), response.error || t('failedToCreateReceipt'));
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      Alert.alert(t('error'), t('failedToCreateReceipt'));
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} DH`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const CreateReceiptModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t('createReceipt')}
          </Text>
          <TouchableOpacity onPress={handleCreateReceipt}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>{t('create')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('user')} *</Text>
            <View style={styles.userSelector}>
              {users.map((userItem) => (
                <TouchableOpacity
                  key={userItem._id}
                  style={[
                    styles.userOption,
                    {
                      backgroundColor: formData.userId === userItem._id ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, userId: userItem._id })}
                >
                  <Text
                    style={[
                      styles.userOptionText,
                      { color: formData.userId === userItem._id ? '#ffffff' : colors.text },
                    ]}
                  >
                    {userItem.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('type')} *</Text>
            <View style={styles.typeContainer}>
              {['payment', 'salary', 'invoice'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: formData.type === type ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: formData.type === type ? '#ffffff' : colors.text },
                    ]}
                  >
                    {type === 'payment' ? t('payment') : 
                     type === 'invoice' ? t('invoice') : 
                     type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('amount')} *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              placeholder={t('enterAmount')}
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('description')} *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder={t('enterDescription')}
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const ReceiptCard: React.FC<{ receipt: Receipt }> = ({ receipt }) => {
    const isDownloading = downloadingId === receipt._id;
    
    return (
      <ThemedCard style={styles.receiptCard}>
        <View style={styles.cardHeader}>
          <View style={styles.typeSection}>
            <View style={[styles.typeIcon, { backgroundColor: colors.success }]}>
              <Ionicons
                name={receipt.type === 'salary' ? 'card' : receipt.type === 'invoice' ? 'document' : 'cash'}
                size={20}
                color="#ffffff"
              />
            </View>
            <View style={styles.receiptInfo}>
              <Text style={[styles.receiptType, { color: colors.text }]}>
                {receipt.type === 'payment' ? t('payment') : 
                 receipt.type === 'invoice' ? t('invoice') : 
                 receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}
              </Text>
              <Text style={[styles.receiptDate, { color: colors.secondary }]}>
                {formatDate(receipt.date)}
              </Text>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatCurrency(receipt.amount)}
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
          {receipt.description}
        </Text>

        {receipt.metadata && (
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
  };

  // Calculate totals for summary
  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

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
              onPress={handleExportPDF}
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

      {/* Summary Card */}
      {receipts.length > 0 && (
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
                  {receipts.length}
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
                  {t('allPayments')}: {receipts.length}
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
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.secondary }]}>
              {t('loading')}
            </Text>
          </View>
        ) : receipts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document" size={64} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('noData')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {t('noPaymentReceipts')}
            </Text>
          </View>
        ) : (
          Array.isArray(receipts) ? receipts.map((receipt) => (
            <ReceiptCard key={receipt._id} receipt={receipt} />
          )) : null
        )}
      </ScrollView>

      <CreateReceiptModal />
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  userSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  userOption: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  userOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});