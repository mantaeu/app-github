import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Show loading screen during auth state changes
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          presentation: 'card',
          animationTypeForReplace: 'push'
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: t('notifications'),
                headerStyle: {
                  backgroundColor: colors.card,
                  borderBottomColor: colors.border,
                  borderBottomWidth: 1,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};