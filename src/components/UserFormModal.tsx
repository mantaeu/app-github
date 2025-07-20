import React, { useState, useEffect } from 'react';
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

interface UserFormModalProps {
  visible: boolean;
  editingUser: User | null;
  onClose: () => void;
  onSave: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  editingUser,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    idCardNumber: '',
    role: 'worker' as 'worker' | 'admin',
    position: '',
    salary: '',
    phone: '',
    address: '',
  });

  const { colors } = useTheme();
  const { t } = useLanguage();

  // Reset form when modal opens/closes or editing user changes
  useEffect(() => {
    if (visible) {
      if (editingUser) {
        setFormData({
          name: editingUser.name || '',
          idCardNumber: editingUser.idCardNumber || '',
          role: editingUser.role || 'worker',
          position: editingUser.position || '',
          salary: editingUser.salary?.toString() || '',
          phone: editingUser.phone || '',
          address: editingUser.address || '',
        });
      } else {
        setFormData({
          name: '',
          idCardNumber: '',
          role: 'worker',
          position: '',
          salary: '',
          phone: '',
          address: '',
        });
      }
    }
  }, [visible, editingUser]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.idCardNumber.trim()) {
      Alert.alert(t('error'), t('nameAndIdCardRequired'));
      return;
    }

    try {
      const userData = {
        name: formData.name.trim(),
        idCardNumber: formData.idCardNumber.trim(),
        role: formData.role,
        position: formData.position.trim() || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      let response;
      if (editingUser) {
        response = await apiService.updateUser(editingUser._id, userData);
      } else {
        response = await apiService.createUser(userData);
      }

      if (response.success) {
        Alert.alert(
          t('success'), 
          editingUser ? t('userUpdatedSuccessfully') : t('userCreatedSuccessfully')
        );
        onSave(); // This will trigger parent to reload users and close modal
      } else {
        // Handle specific error messages
        let errorMessage = response.error || t('failedToSaveUser');
        
        // Check for duplicate ID card number error
        if (errorMessage.toLowerCase().includes('duplicate') || 
            errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('unique') ||
            errorMessage.toLowerCase().includes('e11000')) {
          errorMessage = `${t('idCardNumber')} "${formData.idCardNumber}" is already in use. Please choose a different ID card number.`;
        }
        
        Alert.alert(t('error'), errorMessage);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Handle network or other errors
      let errorMessage = t('failedToSaveUser');
      
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('duplicate') || 
            error.message.toLowerCase().includes('unique') ||
            error.message.toLowerCase().includes('e11000')) {
          errorMessage = `${t('idCardNumber')} "${formData.idCardNumber}" is already in use. Please choose a different ID card number.`;
        }
      }
      
      Alert.alert(t('error'), errorMessage);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {editingUser ? t('editUser') : t('addUser')}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              {t('save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('name')} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder={t('enterFullName')}
              placeholderTextColor={colors.secondary}
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('idCardNumber')} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={formData.idCardNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, idCardNumber: text }))}
              placeholder={t('enterUniqueIdCardNumber')}
              placeholderTextColor={colors.secondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={[styles.helpText, { color: colors.secondary }]}>
              {t('idCardLoginHelp')}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('role')}
            </Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor: formData.role === 'worker' ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFormData(prev => ({ ...prev, role: 'worker' }))}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: formData.role === 'worker' ? '#ffffff' : colors.text },
                  ]}
                >
                  {t('worker')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor: formData.role === 'admin' ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: formData.role === 'admin' ? '#ffffff' : colors.text },
                  ]}
                >
                  {t('admin')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('position')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={formData.position}
              onChangeText={(text) => setFormData(prev => ({ ...prev, position: text }))}
              placeholder={t('enterJobPosition')}
              placeholderTextColor={colors.secondary}
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('dailyRate')} (DH)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={formData.salary}
              onChangeText={(text) => setFormData(prev => ({ ...prev, salary: text }))}
              placeholder={`${t('dailyRate')} (${t('perDay')})`}
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              returnKeyType="next"
            />
            <Text style={[styles.helpText, { color: colors.secondary }]}>
              {t('dailyRateDetails')}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('phone')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder={t('enterPhoneNumber')}
              placeholderTextColor={colors.secondary}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('address')}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder={t('enterAddress')}
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={3}
              autoCorrect={false}
              returnKeyType="done"
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
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
  content: {
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
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
});