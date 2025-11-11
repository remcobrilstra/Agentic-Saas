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
} from './auth';

export class SupabaseAuthProvider implements IAuthProvider {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async signUp(params: SignUpParams): Promise<User> {
    const { data, error } = await this.client.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: params.metadata,
      },
    });

    if (error) {
      throw new Error(`Sign up error: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Sign up failed: No user returned');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      role: data.user.role,
      metadata: data.user.user_metadata,
    };
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

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: data.user.role,
        metadata: data.user.user_metadata,
      },
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

    if (error) {
      throw new Error(`Get user error: ${error.message}`);
    }

    if (!data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      role: data.user.role,
      metadata: data.user.user_metadata,
    };
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      throw new Error(`Get session error: ${error.message}`);
    }

    if (!data.session) {
      return null;
    }

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email!,
        role: data.session.user.role,
        metadata: data.session.user.user_metadata,
      },
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

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email!,
        role: data.session.user.role,
        metadata: data.session.user.user_metadata,
      },
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

    return {
      id: data.user.id,
      email: data.user.email!,
      role: data.user.role,
      metadata: data.user.user_metadata,
    };
  }
}
