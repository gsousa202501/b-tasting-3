import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials } from '@/types/auth';
import { authApi } from '@/lib/auth-api';
import { authStorage } from '@/lib/auth-storage';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = authStorage.getToken();
      const userData = authStorage.getUserData();

      if (token && userData) {
        // Validate token with server
        try {
          const validatedUser = await authApi.getCurrentUser(token);
          setUser(validatedUser);
          console.log('Session restored successfully for user:', validatedUser.name);
        } catch (error) {
          // Token is invalid, clear storage
          authStorage.clearAll();
          console.error('Token validation failed:', error);
        }
      } else {
        console.log('No stored authentication found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(credentials);
      
      // Store auth data
      authStorage.setToken(response.token, credentials.rememberMe);
      authStorage.setRefreshToken(response.refreshToken);
      authStorage.setUserData(response.user, credentials.rememberMe);

      setUser(response.user);

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo, ${response.user.name}`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(errorMessage);
      toast.error('Erro no login', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      await authApi.logout();
      
      // Clear all auth data
      authStorage.clearAll();
      setUser(null);
      setError(null);

      toast.success('Logout realizado com sucesso!');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if server request fails
      authStorage.clearAll();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      
      // Update stored auth data
      const rememberMe = authStorage.isRememberMeEnabled();
      authStorage.setToken(response.token, rememberMe);
      authStorage.setRefreshToken(response.refreshToken);
      authStorage.setUserData(response.user, rememberMe);

      setUser(response.user);
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};