import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { SalaryScreen } from '../screens/SalaryScreen';
import { ReceiptsScreen } from '../screens/ReceiptsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Salary':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Receipts':
              iconName = focused ? 'document' : 'document-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('dashboard'),
          headerTitle: t('dashboard'),
        }}
      />

      {isAdmin && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            title: t('users'),
            headerTitle: t('users'),
          }}
        />
      )}

      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          title: t('attendance'),
          headerTitle: t('attendance'),
        }}
      />

      <Tab.Screen
        name="Salary"
        component={SalaryScreen}
        options={{
          title: t('salary'),
          headerTitle: t('salary'),
        }}
      />

      <Tab.Screen
        name="Receipts"
        component={ReceiptsScreen}
        options={{
          title: t('receipts'),
          headerTitle: t('receipts'),
        }}
      />

      {!isAdmin && (
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t('profile'),
            headerTitle: t('profile'),
          }}
        />
      )}

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings'),
          headerTitle: t('settings'),
        }}
      />
    </Tab.Navigator>
  );
};