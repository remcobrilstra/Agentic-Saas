/**
 * Notifications Module Types
 */

export interface NotificationType {
  id: string;
  name: string;
  description?: string;
  enabledByDefault: boolean;
  channel: 'email' | 'sms' | 'push';
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationId: string;
  preference: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNotificationTypeParams {
  name: string;
  description?: string;
  enabledByDefault: boolean;
  channel: 'email' | 'sms' | 'push';
  category: string;
}

export interface UpdateNotificationTypeParams {
  name?: string;
  description?: string;
  enabledByDefault?: boolean;
  channel?: 'email' | 'sms' | 'push';
  category?: string;
}

export interface UserNotificationPreference {
  notificationType: NotificationType;
  enabled: boolean;
}
