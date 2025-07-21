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
      console.log('🔍 Loading stored authentication...');
      
      // Get stored token and user data
      const [storedToken, storedUserData] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user')
      ]);

      if (storedToken && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log('✅ Found stored auth data for user:', userData.name);
          
          // Set the auth token in the API service
          apiService.setAuthToken(storedToken);
          
          // Verify the token is still valid by making a test request
          try {
            const verifyResponse = await apiService.getUsers();
            
            if (verifyResponse.success) {
              // Token is valid, restore the user session
              setUser(userData);
              setToken(storedToken);
              console.log('✅ Successfully restored user session');
            } else {
              // Token is invalid, clear stored data
              console.log('❌ Stored token is invalid, clearing auth data');
              await Promise.all([
                AsyncStorage.removeItem('authToken'),
                AsyncStorage.removeItem('user')
              ]);
              apiService.setAuthToken(null);
            }
          } catch (verifyError) {
            // Network error or server error, but keep the stored auth for offline use
            console.log('⚠️ Could not verify token (network issue), keeping stored auth:', verifyError);
            setUser(userData);
            setToken(storedToken);
          }
        } catch (parseError) {
          console.log('❌ Error parsing stored user data:', parseError);
          // Clear corrupted data
          await Promise.all([
            AsyncStorage.removeItem('authToken'),
            AsyncStorage.removeItem('user')
          ]);
          apiService.setAuthToken(null);
        }
      } else {
        console.log('ℹ️ No stored authentication found');
      }
    } catch (error) {
      console.log('❌ Error loading stored auth:', error);
      // Clear any potentially corrupted data
      try {
        await Promise.all([
          AsyncStorage.removeItem('authToken'),
          AsyncStorage.removeItem('user')
        ]);
        apiService.setAuthToken(null);
      } catch (clearError) {
        console.log('❌ Error clearing corrupted auth data:', clearError);
      }
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
          
          // Store auth data for persistent login
          await Promise.all([
            AsyncStorage.setItem('authToken', authToken),
            AsyncStorage.setItem('user', JSON.stringify(userData))
          ]);
          
          apiService.setAuthToken(authToken);
          console.log('✅ User logged in and auth data stored:', userData.name);
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
          
          // Store auth data for persistent login
          await Promise.all([
            AsyncStorage.setItem('authToken', authToken),
            AsyncStorage.setItem('user', JSON.stringify(userData))
          ]);
          
          apiService.setAuthToken(authToken);
          console.log('✅ Admin logged in and auth data stored:', userData.name);
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

  const refreshUser = useCallback(async () => {
    try {
      if (!user?._id || !token) return;
      
      const response = await apiService.getUserById(user._id);
      if (response.success && response.data) {
        const updatedUser = response.data;
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ User data refreshed');
      }
    } catch (error) {
      console.log('❌ Error refreshing user data:', error);
    }
  }, [user?._id, token]);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out user...');
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
      
      console.log('✅ User logged out and auth data cleared');
    } catch (error) {
      console.log('❌ Error during logout:', error);
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
    refreshUser,
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