/**
 * User Management Service
 * 
 * Provides business logic for user management operations.
 */

import { getConfig } from '@/abstractions/config';
import { UserProfile, UpdateProfileParams, CreateUserParams } from './types';

export class UserManagementService {
  /**
   * Get a user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { database } = getConfig().providers;
    return database.getById<UserProfile>('profiles', userId);
  }

  /**
   * Create a new user with profile
   */
  async createUser(params: CreateUserParams): Promise<UserProfile> {
    const { auth, database } = getConfig().providers;

    // Create auth user
    const user = await auth.signUp({
      email: params.email,
      password: params.password,
      metadata: {
        firstName: params.firstName,
        lastName: params.lastName,
      },
    });

    // Create profile
    const profile = await database.insert<UserProfile>('profiles', {
      id: user.id,
      email: user.email,
      role: params.role || 'user',
      firstName: params.firstName,
      lastName: params.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return profile;
  }

  /**
   * Update a user profile
   */
  async updateProfile(userId: string, params: UpdateProfileParams): Promise<UserProfile> {
    const { database } = getConfig().providers;

    const profile = await database.update<UserProfile>('profiles', userId, {
      ...params,
      updatedAt: new Date(),
    });

    return profile;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    const { database } = getConfig().providers;
    await database.delete('profiles', userId);
  }

  /**
   * List all users (with pagination)
   */
  async listUsers(filters?: Record<string, unknown>): Promise<UserProfile[]> {
    const { database } = getConfig().providers;
    return database.query<UserProfile>('profiles', filters);
  }

  /**
   * Extension point: Add custom user profile fields
   * This can be used by consumers to extend the user profile
   */
  extendProfile(customFields: Record<string, unknown>): void {
    // Extension point: Implement custom logic here
    console.log('Extending user profile with custom fields:', customFields);
  }
}
