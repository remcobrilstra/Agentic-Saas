/**
 * Authentication Abstraction Layer
 * 
 * This module provides an abstraction over authentication operations to allow
 * easy replacement of the underlying auth provider.
 */

export interface User {
  id: string;
  email: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface SignUpParams {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}

export interface SignInParams {
  email: string;
  password: string;
}

export type OAuthProvider = 'google' | 'microsoft' | 'apple';

export interface MFAEnrollParams {
  factorType: 'totp';
  friendlyName?: string;
}

export interface MFAFactor {
  id: string;
  type: 'totp';
  status: 'verified' | 'unverified';
  friendlyName?: string;
}

export interface MFAVerifyParams {
  factorId: string;
  code: string;
  challengeId?: string;
}

export interface IAuthProvider {
  /**
   * Sign up a new user
   */
  signUp(params: SignUpParams): Promise<User>;

  /**
   * Sign in an existing user
   */
  signIn(params: SignInParams): Promise<AuthSession>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Get the current authenticated user
   */
  getUser(): Promise<User | null>;

  /**
   * Get the current session
   */
  getSession(): Promise<AuthSession | null>;

  /**
   * Refresh the current session
   */
  refreshSession(): Promise<AuthSession>;

  /**
   * Reset password for a user
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Update user metadata
   */
  updateUser(userId: string, metadata: Record<string, unknown>): Promise<User>;

  /**
   * Sign in with OAuth provider (Google, Microsoft, Apple)
   */
  signInWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<{ url: string }>;

  /**
   * Enroll a new MFA factor for the current user
   */
  enrollMFA(params: MFAEnrollParams): Promise<{ id: string; totp?: { qr_code: string; secret: string; uri: string } }>;

  /**
   * Verify an MFA factor
   */
  verifyMFA(params: MFAVerifyParams): Promise<void>;

  /**
   * Unenroll an MFA factor
   */
  unenrollMFA(factorId: string): Promise<void>;

  /**
   * List all MFA factors for the current user
   */
  listMFAFactors(): Promise<MFAFactor[]>;
}
