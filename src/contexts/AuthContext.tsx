import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types';
import { apiService } from '../services/api';
import { Alert } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []); // Empty dependency array to run only once

  const loadStoredAuth = async () => {
    try {
      // Clear stored auth since we recreated the database with new user IDs
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      apiService.setAuthToken(null);
    } catch (error) {
      // Silent error handling to prevent infinite loops
    } finally {
      setLoading(false);
    }
  };

  const login = async (idCardNumber: string) => {
    try {
      setLoading(true);
      const response = await apiService.login(idCardNumber);
      
      if (response.success && response.data) {
        // The backend returns { success: true, data: { user, token } }
        const { user: userData, token: authToken } = response.data;
        
        if (userData && authToken) {
          setUser(userData);
          setToken(authToken);
          await AsyncStorage.setItem('authToken', authToken);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          apiService.setAuthToken(authToken);
        } else {
          throw new Error('Invalid response structure: missing user or token');
        }
      } else {
        const errorMessage = response.error || 'Login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiService.adminLogin(email, password);
      
      if (response.success && response.data) {
        // The backend returns { success: true, data: { user, token } }
        const { user: userData, token: authToken } = response.data;
        
        if (userData && authToken) {
          setUser(userData);
          setToken(authToken);
          await AsyncStorage.setItem('authToken', authToken);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          apiService.setAuthToken(authToken);
        } else {
          throw new Error('Invalid response structure: missing user or token');
        }
      } else {
        const errorMessage = response.error || 'Admin login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      // Set loading to true to prevent navigation race conditions
      setLoading(true);
      
      // Clear API token first to prevent any ongoing requests
      apiService.setAuthToken(null);
      
      // Clear AsyncStorage in parallel
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('user')
      ]);
      
      // Clear state after everything else is done
      setUser(null);
      setToken(null);
      
    } catch (error) {
      // Silent error handling
    } finally {
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    adminLogin,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};