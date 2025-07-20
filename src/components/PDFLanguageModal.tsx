import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { ThemedButton } from './ThemedButton';

interface PDFLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (language: string) => void;
  title: string;
  loading?: boolean;
}

const PDFLanguageModal: React.FC<PDFLanguageModalProps> = ({
  visible,
  onClose,
  onGenerate,
  title,
  loading = false
}) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleGenerate = () => {
    onGenerate(selectedLanguage);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: colors.surface || colors.background,
      borderRadius: 12,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    languageSelectorContainer: {
      marginBottom: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Choose the language for your PDF document
          </Text>
          
          <Text style={styles.sectionTitle}>PDF Language</Text>
          <View style={styles.languageSelectorContainer}>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </View>

          <View style={styles.buttonContainer}>
            <ThemedButton
              title={t('cancel')}
              onPress={onClose}
              variant="outline"
              style={styles.button}
              disabled={loading}
            />
            <ThemedButton
              title={loading ? t('loading') : t('exportPDF')}
              onPress={handleGenerate}
              style={styles.button}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PDFLanguageModal;