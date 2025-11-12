/**
 * Notifications Service
 * 
 * Provides utilities to manage notification types and user preferences
 */

import { getConfig } from '@/abstractions/config';
import {
  NotificationType,
  NotificationPreference,
  CreateNotificationTypeParams,
  UpdateNotificationTypeParams,
  UserNotificationPreference,
} from './types';

export class NotificationService {
  /**
   * Get all notification types
   */
  static async getAllNotificationTypes(): Promise<NotificationType[]> {
    const { database } = getConfig().providers;
    return database.query<NotificationType>('notification_types');
  }

  /**
   * Get a single notification type by ID
   */
  static async getNotificationTypeById(id: string): Promise<NotificationType | null> {
    const { database } = getConfig().providers;
    return database.getById<NotificationType>('notification_types', id);
  }

  /**
   * Create a new notification type
   */
  static async createNotificationType(
    params: CreateNotificationTypeParams
  ): Promise<NotificationType> {
    const { database } = getConfig().providers;
    return database.insert<NotificationType>('notification_types', {
      name: params.name,
      description: params.description,
      enabledByDefault: params.enabledByDefault,
      channel: params.channel,
      category: params.category,
    });
  }

  /**
   * Update a notification type
   */
  static async updateNotificationType(
    id: string,
    params: UpdateNotificationTypeParams
  ): Promise<NotificationType> {
    const { database } = getConfig().providers;
    return database.update<NotificationType>('notification_types', id, params);
  }

  /**
   * Delete a notification type
   */
  static async deleteNotificationType(id: string): Promise<void> {
    const { database } = getConfig().providers;
    await database.delete('notification_types', id);
  }

  /**
   * Get all notification preferences for a user
   * Returns all notification types with their user-specific preferences
   */
  static async getUserNotificationPreferences(
    userId: string
  ): Promise<UserNotificationPreference[]> {
    const { database } = getConfig().providers;
    
    // Get all notification types
    const notificationTypes = await database.query<NotificationType>('notification_types');
    
    // Get user's preferences
    const preferences = await database.query<NotificationPreference>(
      'notification_preferences',
      { userId }
    );
    
    // Map preferences to notification types
    const preferencesMap = new Map(
      preferences.map((p) => [p.notificationId, p.preference])
    );
    
    // Build result with fallback to enabledByDefault
    return notificationTypes.map((notificationType) => ({
      notificationType,
      enabled: preferencesMap.has(notificationType.id)
        ? preferencesMap.get(notificationType.id)!
        : notificationType.enabledByDefault,
    }));
  }

  /**
   * Check if a user allows a specific notification
   * Falls back to enabledByDefault if no preference is set
   */
  static async isNotificationEnabled(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    const { database } = getConfig().providers;
    
    // Check for user preference first
    const preferences = await database.query<NotificationPreference>(
      'notification_preferences',
      { userId, notificationId }
    );
    
    if (preferences.length > 0) {
      return preferences[0].preference;
    }
    
    // Fall back to notification type's default
    const notificationType = await database.getById<NotificationType>(
      'notification_types',
      notificationId
    );
    
    return notificationType?.enabledByDefault ?? false;
  }

  /**
   * Set a user's notification preference
   */
  static async setUserNotificationPreference(
    userId: string,
    notificationId: string,
    preference: boolean
  ): Promise<NotificationPreference> {
    const { database } = getConfig().providers;
    
    // Check if preference already exists
    const existingPreferences = await database.query<NotificationPreference>(
      'notification_preferences',
      { userId, notificationId }
    );
    
    if (existingPreferences.length > 0) {
      // Update existing preference
      return database.update<NotificationPreference>(
        'notification_preferences',
        existingPreferences[0].id,
        { preference }
      );
    } else {
      // Create new preference
      return database.insert<NotificationPreference>('notification_preferences', {
        userId,
        notificationId,
        preference,
      });
    }
  }
}
