/**
 * Supabase Auth Provider Implementation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IAuthProvider,
  User,
  AuthSession,
  SignUpParams,
  SignInParams,
  OAuthProvider,
  MFAEnrollParams,
  MFAFactor,
  MFAVerifyParams,
} from './auth';

export class SupabaseAuthProvider implements IAuthProvider {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Private method to fetch user profile and merge with auth user data
   * This hides the implementation detail of having separate tables
   */
  private async getUserWithProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; role?: string }): Promise<User> {
    try {
      // Fetch user profile from user_profiles table
      const { data: profile, error } = await this.client
        .from('user_profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Log error but don't fail - fallback to metadata role
        console.warn('Failed to fetch user profile:', error.message);
      }

      // Merge auth user data with profile data
      // Priority: user_profiles.role > user_metadata.role > default 'user'
      const role = profile?.role || authUser.user_metadata?.role as string || authUser.role || 'user';

      return {
        id: authUser.id,
        email: authUser.email || '',
        role,
        metadata: authUser.user_metadata,
      };
    } catch (error) {
      // Fallback to just auth user data if profile fetch fails
      console.warn('Error in getUserWithProfile:', error);
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: authUser.user_metadata?.role as string || authUser.role || 'user',
        metadata: authUser.user_metadata,
      };
    }
  }

  async signUp(params: SignUpParams): Promise<User> {
    const { data, error } = await this.client.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          ...params.metadata,
          role: params.metadata?.role || 'user', // Set default role
        },
      },
    });

    if (error) {
      throw new Error(`Sign up error: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Sign up failed: No user returned');
    }

    // Merge auth user with profile data (profile created via trigger)
    return this.getUserWithProfile(data.user);
  }

  async signIn(params: SignInParams): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) {
      throw new Error(`Sign in error: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('Sign in failed: No session returned');
    }

    // Merge auth user with profile data
    const user = await this.getUserWithProfile(data.user);

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(`Sign out error: ${error.message}`);
    }
  }

  async getUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    // Merge auth user with profile data
    return this.getUserWithProfile(data.user);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      throw new Error(`Get session error: ${error.message}`);
    }

    if (!data.session) {
      return null;
    }

    // Merge auth user with profile data
    const user = await this.getUserWithProfile(data.session.user);

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await this.client.auth.refreshSession();

    if (error) {
      throw new Error(`Refresh session error: ${error.message}`);
    }

    if (!data.session) {
      throw new Error('Refresh session failed: No session returned');
    }

    // Merge auth user with profile data
    const user = await this.getUserWithProfile(data.session.user);

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(`Reset password error: ${error.message}`);
    }
  }

  async updateUser(userId: string, metadata: Record<string, unknown>): Promise<User> {
    const { data, error } = await this.client.auth.updateUser({
      data: metadata,
    });

    if (error) {
      throw new Error(`Update user error: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Update user failed: No user returned');
    }

    // Merge auth user with profile data
    return this.getUserWithProfile(data.user);
  }

  async signInWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<{ url: string }> {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: provider as 'google' | 'azure' | 'apple',
      options: {
        redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(`OAuth sign in error: ${error.message}`);
    }

    if (!data.url) {
      throw new Error('OAuth sign in failed: No URL returned');
    }

    return { url: data.url };
  }

  async enrollMFA(params: MFAEnrollParams): Promise<{ id: string; totp?: { qr_code: string; secret: string; uri: string } }> {
    const { data, error } = await this.client.auth.mfa.enroll({
      factorType: params.factorType,
      friendlyName: params.friendlyName,
    });

    if (error) {
      throw new Error(`MFA enrollment error: ${error.message}`);
    }

    if (!data) {
      throw new Error('MFA enrollment failed: No data returned');
    }

    return {
      id: data.id,
      totp: data.totp ? {
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      } : undefined,
    };
  }

  async verifyMFA(params: MFAVerifyParams): Promise<void> {
    // For TOTP enrollment verification, we need to use challenge
    let challengeId = params.challengeId;
    
    if (!challengeId) {
      // Create a challenge if not provided
      const { data: challengeData, error: challengeError } = await this.client.auth.mfa.challenge({
        factorId: params.factorId,
      });

      if (challengeError) {
        throw new Error(`MFA challenge error: ${challengeError.message}`);
      }

      challengeId = challengeData.id;
    }

    const { error } = await this.client.auth.mfa.verify({
      factorId: params.factorId,
      challengeId: challengeId,
      code: params.code,
    });

    if (error) {
      throw new Error(`MFA verification error: ${error.message}`);
    }
  }

  async unenrollMFA(factorId: string): Promise<void> {
    const { error } = await this.client.auth.mfa.unenroll({
      factorId,
    });

    if (error) {
      throw new Error(`MFA unenrollment error: ${error.message}`);
    }
  }

  async listMFAFactors(): Promise<MFAFactor[]> {
    const { data, error } = await this.client.auth.mfa.listFactors();

    if (error) {
      throw new Error(`List MFA factors error: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.totp.map((factor) => ({
      id: factor.id,
      type: 'totp' as const,
      status: factor.status as 'verified' | 'unverified',
      friendlyName: factor.friendly_name,
    }));
  }
}
