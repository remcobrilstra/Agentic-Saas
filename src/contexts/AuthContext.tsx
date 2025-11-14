/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/modules/auth';
import { AuthState } from '@/modules/auth/types';
import { getConfig } from '@/abstractions/config';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'microsoft' | 'apple') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const authService = new AuthService();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setState({
          user,
          isLoading: false,
          isAuthenticated: user !== null,
        });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for auth state changes from Supabase
  useEffect(() => {
    const { auth } = getConfig().providers;
    
    // Supabase client has onAuthStateChange method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('client' in auth && typeof (auth as any).client?.auth?.onAuthStateChange === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { subscription } } = (auth as any).client.auth.onAuthStateChange(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (_event: string, session: any) => {
          if (session?.user) {
            // Fetch full user data including profile to get merged role information
            try {
              const user = await auth.getUser();
              if (user) {
                setState({
                  user,
                  isLoading: false,
                  isAuthenticated: true,
                });
              }
            } catch (error) {
              console.error('Failed to fetch user in auth state change:', error);
              // Fallback to session data
              setState({
                user: {
                  id: session.user.id,
                  email: session.user.email,
                  role: session.user.user_metadata?.role || session.user.role || 'user',
                  metadata: session.user.user_metadata,
                },
                isLoading: false,
                isAuthenticated: true,
              });
            }
          } else {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login({ email, password });
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const user = await authService.register({ email, password, firstName, lastName });
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      const { url } = await authService.loginWithOAuth(provider);
      // Redirect to OAuth provider
      window.location.href = url;
    } catch (error) {
      console.error('OAuth login failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setState({
        user,
        isLoading: false,
        isAuthenticated: user !== null,
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        loginWithOAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get just the user
export function useUser() {
  const { user } = useAuth();
  return user;
}
