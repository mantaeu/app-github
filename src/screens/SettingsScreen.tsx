import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedButton } from '../components/ThemedButton';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const { t, language, setLanguage, isRTL } = useLanguage();

  const handleLanguageChange = () => {
    Alert.alert(
      t('language'),
      'Select Language',
      [
        { text: 'English', onPress: () => setLanguage('en') },
        { text: 'Français', onPress: () => setLanguage('fr') },
        { text: 'العربية', onPress: () => setLanguage('ar') },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to logout?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    icon: string;
    onPress: () => void;
    showArrow?: boolean;
  }> = ({ title, subtitle, icon, onPress, showArrow = true }) => (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
        <View style={styles.settingLeft}>
          <Ionicons name={icon as any} size={24} color={colors.primary} />
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.settingSubtitle, { color: colors.secondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {showArrow && (
          <Ionicons 
            name={isRTL ? "chevron-back" : "chevron-forward"} 
            size={20} 
            color={colors.secondary} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const getLanguageName = () => {
    switch (language) {
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'ar': return 'العربية';
      default: return 'English';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.userEmail, { color: colors.secondary }]}>{user?.email}</Text>
        <Text style={[styles.userRole, { color: colors.primary }]}>
          {user?.role === 'admin' ? t('admin') : t('worker')}
        </Text>
      </View>

      <ThemedCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          Preferences
        </Text>
        
        <SettingItem
          title={t('language')}
          subtitle={getLanguageName()}
          icon="language"
          onPress={handleLanguageChange}
        />
        
        <SettingItem
          title={t('theme')}
          subtitle={theme === 'light' ? t('lightTheme') : t('darkTheme')}
          icon="color-palette"
          onPress={toggleTheme}
        />
      </ThemedCard>

      <ThemedCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          Account
        </Text>
        
        <SettingItem
          title={t('profile')}
          subtitle="Edit your profile information"
          icon="person"
          onPress={() => {}}
        />
        
        <SettingItem
          title="Change Password"
          subtitle="Update your password"
          icon="lock-closed"
          onPress={() => {}}
        />
      </ThemedCard>

      <ThemedCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          About
        </Text>
        
        <SettingItem
          title="Version"
          subtitle="1.0.0"
          icon="information-circle"
          onPress={() => {}}
          showArrow={false}
        />
        
        <SettingItem
          title="Support"
          subtitle="Get help and support"
          icon="help-circle"
          onPress={() => {}}
        />
      </ThemedCard>

      <View style={styles.logoutSection}>
        <ThemedButton
          title={t('logout')}
          onPress={handleLogout}
          variant="outline"
          style={[styles.logoutButton, { borderColor: colors.error }]}
          textStyle={{ color: colors.error }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.secondary }]}>
          Mantaevert © 2024
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  logoutButton: {
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
  },
});