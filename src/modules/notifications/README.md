# Notifications Module

This module provides a flexible notification system with support for multiple notification types and user-specific preferences.

## Features

- **Notification Types Management**: Admins can create, update, and delete notification types
- **User Preferences**: Users can customize which notifications they want to receive
- **Default Fallback**: If a user hasn't set a preference, the system falls back to the notification type's `enabledByDefault` value
- **Multi-Channel Support**: Supports email, SMS, and push notifications
- **Category Organization**: Notifications can be grouped into categories

## Database Schema

### notification_types

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | string | Notification name (e.g., "Account Updates") |
| description | string | Optional description |
| enabledByDefault | boolean | Default state for new users |
| channel | string | Channel type: 'email', 'sms', or 'push' |
| category | string | Category for grouping (e.g., "Account", "Marketing", "Security") |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

### notification_preferences

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| userId | uuid | Foreign key to users table |
| notificationId | uuid | Foreign key to notification_types |
| preference | boolean | User's preference (true = enabled, false = disabled) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

## Usage

### Service Methods

```typescript
import { NotificationService } from '@/modules/notifications';

// Get all notification types
const types = await NotificationService.getAllNotificationTypes();

// Create a notification type
const newType = await NotificationService.createNotificationType({
  name: 'Weekly Newsletter',
  description: 'Receive our weekly newsletter',
  enabledByDefault: false,
  channel: 'email',
  category: 'Marketing'
});

// Get user's notification preferences with defaults
const preferences = await NotificationService.getUserNotificationPreferences(userId);

// Check if a user allows a specific notification
const isEnabled = await NotificationService.isNotificationEnabled(userId, notificationId);

// Set user's preference
await NotificationService.setUserNotificationPreference(userId, notificationId, true);
```

## Admin Interface

Navigate to `/admin/notifications` to:
- View all notification types in a table
- Create new notification types
- Edit existing notification types
- Delete notification types
- See category, channel, and default state for each type

## User Interface

The profile page (`/profile`) displays notification preferences grouped by category, allowing users to:
- View all available notifications
- Toggle notifications on/off
- See which channel each notification uses
- Read descriptions for each notification type

## API Endpoints

### Admin Endpoints

**GET** `/api/admin/notifications`
- List all notification types
- Response: `{ notificationTypes: NotificationType[] }`

**POST** `/api/admin/notifications`
- Create a new notification type
- Body: `{ name, description?, enabledByDefault, channel, category }`
- Response: `{ notificationType: NotificationType }`

**GET** `/api/admin/notifications/[id]`
- Get a specific notification type
- Response: `{ notificationType: NotificationType }`

**PUT** `/api/admin/notifications/[id]`
- Update a notification type
- Body: `{ name?, description?, enabledByDefault?, channel?, category? }`
- Response: `{ notificationType: NotificationType }`

**DELETE** `/api/admin/notifications/[id]`
- Delete a notification type
- Response: `{ success: true }`

### User Endpoints

**GET** `/api/user/notification-preferences?userId={userId}`
- Get all notification preferences for a user
- Response: `{ preferences: UserNotificationPreference[] }`

**POST** `/api/user/notification-preferences`
- Set a user's notification preference
- Body: `{ userId, notificationId, preference }`
- Response: `{ preference: NotificationPreference }`

## Example Categories

- **Account**: Account-related updates (login, password changes, etc.)
- **Marketing**: Promotional content, newsletters
- **Security**: Security alerts, suspicious activity
- **Product**: Product updates, new features
- **Billing**: Payment receipts, subscription changes

## Extending the Module

### Adding New Channels

To add support for a new notification channel:

1. Update the `channel` type in `types.ts`:
```typescript
channel: 'email' | 'sms' | 'push' | 'slack' | 'discord';
```

2. Update the channel dropdown in the admin UI (`/app/admin/notifications/page.tsx`)

3. Implement the actual sending logic in your notification sender service

### Adding Notification Templates

While this module handles user preferences, you'll likely want to pair it with a template system for the actual notification content. Consider creating a separate `notification-templates` module.

## Notes

- The system automatically falls back to `enabledByDefault` if a user hasn't set a preference
- When a notification type is deleted, associated preferences should also be cleaned up (consider adding cascade delete)
- Currently, the API routes use query parameters for userId - in production, use session/JWT authentication
