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

  // Initialize auth state on mount - let auth state change listener handle it
  useEffect(() => {
    // The auth state change listener will handle the initial state
    // This prevents race conditions and duplicate state updates
  }, []);

  // Listen for auth state changes from Supabase
  useEffect(() => {
    let mounted = true;
    let isProcessing = false;
    const { auth } = getConfig().providers;
    
    // Supabase client has onAuthStateChange method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('client' in auth && typeof (auth as any).client?.auth?.onAuthStateChange === 'function') {
      // Check initial session first
      const checkInitialSession = async () => {
        if (!mounted || isProcessing) return;
        isProcessing = true;
        
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: sessionData } = await (auth as any).client.auth.getSession();
          if (sessionData?.session?.user && mounted) {
            try {
              const user = await auth.getUser();
              if (user && mounted) {
                setState({
                  user,
                  isLoading: false,
                  isAuthenticated: true,
                });
              }
            } catch (error) {
              console.error('Failed to fetch user on init:', error);
              if (mounted) {
                setState({
                  user: {
                    id: sessionData.session.user.id,
                    email: sessionData.session.user.email,
                    role: sessionData.session.user.user_metadata?.role || sessionData.session.user.role || 'user',
                    metadata: sessionData.session.user.user_metadata,
                  },
                  isLoading: false,
                  isAuthenticated: true,
                });
              }
            }
          } else if (mounted) {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Failed to check initial session:', error);
          if (mounted) {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } finally {
          isProcessing = false;
        }
      };

      checkInitialSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { subscription } } = (auth as any).client.auth.onAuthStateChange(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (_event: string, session: any) => {
          // Prevent state updates if component is unmounted or already processing
          if (!mounted || isProcessing) return;

          isProcessing = true;

          try {
            if (session?.user) {
              // Fetch full user data including profile to get merged role information
              try {
                const user = await auth.getUser();
                if (user && mounted) {
                  setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                  });
                }
              } catch (error) {
                console.error('Failed to fetch user in auth state change:', error);
                // Fallback to session data only if component is still mounted
                if (mounted) {
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
              }
            } else {
              if (mounted) {
                setState({
                  user: null,
                  isLoading: false,
                  isAuthenticated: false,
                });
              }
            }
          } finally {
            isProcessing = false;
          }
        }
      );

      return () => {
        mounted = false;
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
