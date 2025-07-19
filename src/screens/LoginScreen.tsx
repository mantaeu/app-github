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
  TouchableOpacity,
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
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, adminLogin } = useAuth();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleUserLogin = async () => {
    if (!idCardNumber) {
      Alert.alert(t('error'), 'Please enter your ID card number');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Attempting user login with ID card...');
      await login(idCardNumber);
      console.log('✅ User login successful');
    } catch (error) {
      console.log('❌ User login failed:', error);
      Alert.alert(t('error'), 'Invalid ID card number');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Attempting admin login...');
      await adminLogin(email, password);
      console.log('✅ Admin login successful');
    } catch (error) {
      console.log('❌ Admin login failed:', error);
      Alert.alert(t('error'), 'Invalid email or password');
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

          {/* Login Type Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                loginType === 'user' && { backgroundColor: colors.primary },
                { borderColor: colors.primary }
              ]}
              onPress={() => setLoginType('user')}
            >
              <Text style={[
                styles.tabText,
                { color: loginType === 'user' ? '#fff' : colors.primary }
              ]}>
                Employee
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                loginType === 'admin' && { backgroundColor: colors.primary },
                { borderColor: colors.primary }
              ]}
              onPress={() => setLoginType('admin')}
            >
              <Text style={[
                styles.tabText,
                { color: loginType === 'admin' ? '#fff' : colors.primary }
              ]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          {loginType === 'user' ? (
            // User Login Form
            <View style={styles.formContainer}>
              <ThemedTextInput
                label="ID Card Number"
                value={idCardNumber}
                onChangeText={setIdCardNumber}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your ID card number"
              />

              <ThemedButton
                title="Login"
                onPress={handleUserLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </View>
          ) : (
            // Admin Login Form
            <View style={styles.formContainer}>
              <ThemedTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your email"
              />

              <ThemedTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your password"
              />

              <ThemedButton
                title="Login as Admin"
                onPress={handleAdminLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </View>
          )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
  },
});