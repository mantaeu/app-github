import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedButton } from '../components/ThemedButton';
import { ThemedCard } from '../components/ThemedCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the type for the root stack
// If you have a types file for navigation, import it instead
type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // No navigation here! AppNavigator will show Main/TabNavigator automatically
    } catch (error) {
      Alert.alert(t('error'), t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Mantaevert</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            {t('welcome')}
          </Text>
        </View>

        <ThemedCard style={styles.formCard}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('login')}
          </Text>

          <ThemedTextInput
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('email')}
          />

          <ThemedTextInput
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={t('password')}
          />

          <ThemedButton
            title={t('login')}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </ThemedCard>

        <Text style={[styles.footer, { color: colors.secondary }]}>
          Mantaevert v1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
  },
});