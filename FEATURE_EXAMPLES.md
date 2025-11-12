# Notification Feature - Code Examples

This document provides code examples showing how to use the notification system.

## Admin: Creating a Notification Type

```typescript
// In the admin interface at /admin/notifications
// Fill out the form:
{
  name: "Payment Failed",
  description: "Alert when a payment fails",
  enabledByDefault: true,
  channel: "email",
  category: "Billing"
}

// API call that happens:
POST /api/admin/notifications
{
  "name": "Payment Failed",
  "description": "Alert when a payment fails", 
  "enabledByDefault": true,
  "channel": "email",
  "category": "Billing"
}

// Returns:
{
  "notificationType": {
    "id": "uuid-here",
    "name": "Payment Failed",
    "description": "Alert when a payment fails",
    "enabledByDefault": true,
    "channel": "email",
    "category": "Billing",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## User: Managing Preferences

```typescript
// User visits /profile
// The NotificationPreferencesSection component loads:

// 1. Fetch preferences
GET /api/user/notification-preferences?userId=user-123

// Returns:
{
  "preferences": [
    {
      "notificationType": {
        "id": "notif-1",
        "name": "Account Updates",
        "description": "Important updates about your account",
        "enabledByDefault": true,
        "channel": "email",
        "category": "Account"
      },
      "enabled": true  // User hasn't set preference, so uses default
    },
    {
      "notificationType": {
        "id": "notif-2",
        "name": "Marketing Emails",
        "description": "Receive product updates and news",
        "enabledByDefault": false,
        "channel": "email",
        "category": "Marketing"
      },
      "enabled": false  // User hasn't set preference, so uses default
    }
  ]
}

// 2. User toggles a preference
POST /api/user/notification-preferences
{
  "userId": "user-123",
  "notificationId": "notif-2",
  "preference": true  // User wants marketing emails
}

// Returns:
{
  "preference": {
    "id": "pref-uuid",
    "userId": "user-123",
    "notificationId": "notif-2",
    "preference": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Developer: Checking Before Sending Notification

```typescript
import { NotificationService } from '@/modules/notifications';

// Example: Before sending a payment receipt email
async function sendPaymentReceipt(userId: string, paymentData: any) {
  // Check if user wants this notification
  const notificationId = 'payment-receipts-notification-id';
  const isEnabled = await NotificationService.isNotificationEnabled(
    userId, 
    notificationId
  );
  
  if (!isEnabled) {
    console.log('User has disabled payment receipt notifications');
    return;
  }
  
  // User wants this notification, send it
  await emailService.send({
    to: user.email,
    subject: 'Payment Receipt',
    body: createReceiptEmail(paymentData)
  });
}

// Example: Getting all preferences for a settings page
async function loadNotificationSettings(userId: string) {
  const preferences = await NotificationService.getUserNotificationPreferences(userId);
  
  // Group by category for display
  const grouped = preferences.reduce((acc, pref) => {
    const category = pref.notificationType.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(pref);
    return acc;
  }, {});
  
  return grouped;
}
```

## Developer: Creating Notifications Programmatically

```typescript
import { NotificationService } from '@/modules/notifications';

// Create a notification type when deploying a new feature
async function setupFeatureNotifications() {
  // Create notification type
  const notificationType = await NotificationService.createNotificationType({
    name: 'New AI Feature Available',
    description: 'Get notified when we release new AI capabilities',
    enabledByDefault: true,
    channel: 'email',
    category: 'Product'
  });
  
  console.log('Created notification type:', notificationType.id);
  
  // Now all users will have this notification enabled by default
  // They can disable it in their profile if they want
}

// Batch update - set preference for multiple users
async function disableMarketingForInactiveUsers(userIds: string[]) {
  const marketingNotifications = await NotificationService
    .getAllNotificationTypes()
    .then(types => types.filter(t => t.category === 'Marketing'));
  
  for (const userId of userIds) {
    for (const notif of marketingNotifications) {
      await NotificationService.setUserNotificationPreference(
        userId,
        notif.id,
        false
      );
    }
  }
}
```

## UI Components Usage

### In a Custom Admin Page

```tsx
import { NotificationService } from '@/modules/notifications';

function CustomAdminDashboard() {
  const [notificationStats, setNotificationStats] = useState({});
  
  useEffect(() => {
    async function loadStats() {
      const types = await NotificationService.getAllNotificationTypes();
      const stats = {
        total: types.length,
        byCategory: types.reduce((acc, type) => {
          acc[type.category] = (acc[type.category] || 0) + 1;
          return acc;
        }, {}),
        enabledByDefault: types.filter(t => t.enabledByDefault).length
      };
      setNotificationStats(stats);
    }
    loadStats();
  }, []);
  
  return (
    <div>
      <h2>Notification Statistics</h2>
      <p>Total types: {notificationStats.total}</p>
      <p>Enabled by default: {notificationStats.enabledByDefault}</p>
    </div>
  );
}
```

### In a Custom Profile Component

```tsx
import { NotificationPreferencesSection } from '@/components/profile/NotificationPreferencesSection';

function UserSettings({ user }) {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      {/* Other settings sections */}
      
      {/* Notification preferences */}
      <NotificationPreferencesSection userId={user.id} />
      
      {/* More settings */}
    </div>
  );
}
```

## Database Queries

### Sample SQL Queries

```sql
-- Get all notification types in a category
SELECT * FROM notification_types 
WHERE category = 'Security' 
ORDER BY name;

-- Get a user's preferences with notification details
SELECT 
  nt.name,
  nt.description,
  nt.channel,
  COALESCE(np.preference, nt.enabled_by_default) as is_enabled
FROM notification_types nt
LEFT JOIN notification_preferences np 
  ON nt.id = np.notification_id 
  AND np.user_id = 'user-uuid-here'
ORDER BY nt.category, nt.name;

-- Count users who have disabled a specific notification
SELECT COUNT(*) as users_disabled
FROM notification_preferences
WHERE notification_id = 'notification-uuid'
  AND preference = false;

-- Get most popular notification types (most users have them enabled)
SELECT 
  nt.name,
  nt.category,
  COUNT(CASE WHEN np.preference = true THEN 1 END) as enabled_count,
  COUNT(CASE WHEN np.preference = false THEN 1 END) as disabled_count
FROM notification_types nt
LEFT JOIN notification_preferences np ON nt.id = np.notification_id
GROUP BY nt.id, nt.name, nt.category
ORDER BY enabled_count DESC;
```

## Testing Examples

### Testing the Service

```typescript
// Mock the database provider
const mockDb: IDatabaseProvider = {
  query: jest.fn(),
  getById: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  raw: jest.fn()
};

// Initialize config with mock
initializeConfig({
  providers: { database: mockDb }
});

// Test fallback behavior
test('isNotificationEnabled falls back to enabledByDefault', async () => {
  // Mock: no user preference exists
  mockDb.query.mockResolvedValue([]);
  
  // Mock: notification type has enabledByDefault = true
  mockDb.getById.mockResolvedValue({
    id: 'notif-1',
    name: 'Test',
    enabledByDefault: true,
    channel: 'email',
    category: 'Test'
  });
  
  const result = await NotificationService.isNotificationEnabled(
    'user-123',
    'notif-1'
  );
  
  expect(result).toBe(true);
});
```

### Testing the API Routes

```typescript
// Test the GET endpoint
test('GET /api/admin/notifications returns all types', async () => {
  const response = await fetch('/api/admin/notifications');
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data.notificationTypes).toBeInstanceOf(Array);
});

// Test the POST endpoint
test('POST /api/admin/notifications creates a type', async () => {
  const newType = {
    name: 'Test Notification',
    description: 'Test description',
    enabledByDefault: true,
    channel: 'email',
    category: 'Test'
  };
  
  const response = await fetch('/api/admin/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newType)
  });
  
  const data = await response.json();
  
  expect(response.status).toBe(201);
  expect(data.notificationType.name).toBe('Test Notification');
});
```

## Integration Examples

### With an Email Service

```typescript
import { NotificationService } from '@/modules/notifications';
import { sendEmail } from '@/services/email';

class NotificationSender {
  async sendWelcomeEmail(userId: string, userData: any) {
    // Check if user wants welcome emails
    const welcomeNotifId = await this.getNotificationIdByName('Welcome Email');
    
    if (await NotificationService.isNotificationEnabled(userId, welcomeNotifId)) {
      await sendEmail({
        to: userData.email,
        template: 'welcome',
        data: userData
      });
    }
  }
  
  async sendBulkNewsletter(userIds: string[], content: any) {
    const newsletterNotifId = await this.getNotificationIdByName('Weekly Newsletter');
    
    // Filter to only users who want newsletters
    const enabledUsers = [];
    for (const userId of userIds) {
      if (await NotificationService.isNotificationEnabled(userId, newsletterNotifId)) {
        enabledUsers.push(userId);
      }
    }
    
    // Send to enabled users
    await sendBulkEmail({
      userIds: enabledUsers,
      template: 'newsletter',
      content
    });
  }
  
  private async getNotificationIdByName(name: string): Promise<string> {
    const types = await NotificationService.getAllNotificationTypes();
    const type = types.find(t => t.name === name);
    if (!type) throw new Error(`Notification type "${name}" not found`);
    return type.id;
  }
}
```

### With a Queue System

```typescript
import { NotificationService } from '@/modules/notifications';
import { addToQueue } from '@/services/queue';

async function queueNotification(userId: string, notificationType: string, data: any) {
  // Get the notification type ID
  const types = await NotificationService.getAllNotificationTypes();
  const notif = types.find(t => t.name === notificationType);
  
  if (!notif) {
    console.error(`Unknown notification type: ${notificationType}`);
    return;
  }
  
  // Check if user wants this notification
  const isEnabled = await NotificationService.isNotificationEnabled(userId, notif.id);
  
  if (isEnabled) {
    // Add to queue for processing
    await addToQueue('notifications', {
      userId,
      notificationId: notif.id,
      channel: notif.channel,
      data
    });
  }
}
```

## Summary

The notification system provides:

1. **Flexible Configuration**: Admins define what notifications exist
2. **User Control**: Users can enable/disable each notification
3. **Smart Defaults**: Falls back to admin-defined defaults
4. **Type Safety**: Full TypeScript support
5. **Extensible**: Easy to add new channels or features
6. **Well-Integrated**: Uses existing abstractions and patterns

All code follows the template's modular architecture and can be easily extended or modified.
