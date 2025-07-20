
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
import { apiService } from '../services/api';
import { Receipt } from '../types';

export const ReceiptsScreen: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const response = await apiService.get('/receipts');
      if (response.success) {
        setReceipts(response.data);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      Alert.alert(t('error'), t('failedToLoadReceipts'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  const handleViewReceipt = (receiptId: string) => {
    // Handle viewing the receipt, e.g., by opening a PDF viewer
    console.log('Viewing receipt:', receiptId);
  };

  const ReceiptCard: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
    <View style={[styles.receiptCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.receiptText, { color: colors.text }]}>
        {t('receiptId')}: {receipt._id}
      </Text>
      <Text style={[styles.receiptText, { color: colors.text }]}>
        {t('date')}: {new Date(receipt.date).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={[styles.viewButton, { backgroundColor: colors.primary }]}
        onPress={() => handleViewReceipt(receipt._id)}
      >
        <Text style={styles.viewButtonText}>{t('viewReceipt')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('receipts')}</Text>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={{ color: colors.text }}>{t('loading')}</Text>
        ) : (
          receipts.map(receipt => (
            <ReceiptCard key={receipt._id} receipt={receipt} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  receiptCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  receiptText: {
    fontSize: 16,
    marginBottom: 8,
  },
  viewButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
