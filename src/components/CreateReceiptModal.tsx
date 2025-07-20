import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { User } from '../types';

interface CreateReceiptModalProps {
  visible: boolean;
  users: User[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  visible,
  users,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    type: 'payment',
    amount: '',
    description: '',
  });

  const { colors } = useTheme();
  const { t } = useLanguage();

  const resetForm = useCallback(() => {
    setFormData({
      userId: '',
      type: 'payment',
      amount: '',
      description: '',
    });
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleCreateReceipt = useCallback(async () => {
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
        resetForm();
        onClose();
        onSuccess();
      } else {
        Alert.alert(t('error'), response.error || t('failedToCreateReceipt'));
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      Alert.alert(t('error'), t('failedToCreateReceipt'));
    }
  }, [formData, t, resetForm, onClose, onSuccess]);

  const handleUserSelect = useCallback((userId: string) => {
    setFormData(prev => ({ ...prev, userId }));
  }, []);

  const handleTypeSelect = useCallback((type: string) => {
    setFormData(prev => ({ ...prev, type }));
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, amount: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  // Reset form when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t('createReceipt')}
          </Text>
          <TouchableOpacity onPress={handleCreateReceipt} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              {t('create')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
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
                  onPress={() => handleUserSelect(userItem._id)}
                >
                  <Text
                    style={[
                      styles.userOptionText,
                      { color: formData.userId === userItem._id ? '#ffffff' : colors.text },
                    ]}
                  >
                    {userItem?.name || 'Unknown User'}
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
                  onPress={() => handleTypeSelect(type)}
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
                { 
                  backgroundColor: colors.card, 
                  color: colors.text, 
                  borderColor: colors.border 
                },
              ]}
              value={formData.amount}
              onChangeText={handleAmountChange}
              placeholder={t('enterAmount')}
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              blurOnSubmit={false}
              selectTextOnFocus={false}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('description')} *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: colors.card, 
                  color: colors.text, 
                  borderColor: colors.border 
                },
              ]}
              value={formData.description}
              onChangeText={handleDescriptionChange}
              placeholder={t('enterDescription')}
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={3}
              blurOnSubmit={false}
              selectTextOnFocus={false}
              autoCorrect={false}
              autoCapitalize="sentences"
            />
          </View>

          {/* Add some bottom padding for better scrolling */}
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
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