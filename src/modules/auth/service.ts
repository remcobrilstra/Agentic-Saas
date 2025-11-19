/**
 * Authentication Service
 * 
 * Provides business logic for authentication operations using the abstraction layer.
 */

import { getConfig } from '@/abstractions/config';
import { OAuthProvider } from '@/abstractions/auth';
import { LoginCredentials, RegisterCredentials, AuthUser } from './types';
import { DEFAULT_USER_ROLE } from '@/utils/constants';

export class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    const { auth } = getConfig().providers;

    const user = await auth.signUp({
      email: credentials.email,
      password: credentials.password,
      metadata: {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: DEFAULT_USER_ROLE, // Default role
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role || DEFAULT_USER_ROLE,
      metadata: user.metadata,
    };
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { auth } = getConfig().providers;

    const session = await auth.signIn({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role || DEFAULT_USER_ROLE,
      metadata: session.user.metadata,
    };
  }

  /**
   * Login with OAuth provider
   */
  async loginWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<{ url: string }> {
    const { auth } = getConfig().providers;
    return auth.signInWithOAuth(provider, redirectTo);
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const { auth } = getConfig().providers;
    await auth.signOut();
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { auth } = getConfig().providers;
    const user = await auth.getUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role || DEFAULT_USER_ROLE,
      metadata: user.metadata,
    };
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { auth } = getConfig().providers;
    await auth.resetPassword(email);
  }

  /**
   * Update user profile information
   */
  async updateProfile(userId: string, data: Record<string, unknown>): Promise<AuthUser> {
    const { auth } = getConfig().providers;
    const user = await auth.updateUser(userId, data);

    return {
      id: user.id,
      email: user.email,
      role: user.role || DEFAULT_USER_ROLE,
      metadata: user.metadata,
    };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { auth } = getConfig().providers;
    const session = await auth.getSession();
    return session !== null;
  }
}
