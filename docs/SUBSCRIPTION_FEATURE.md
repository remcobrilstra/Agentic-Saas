# Subscription Feature Documentation

## Overview

This document describes the subscription management system that has been implemented in the microSaaS template. The feature allows administrators to define subscription types with feature flags and quota limits, and enables users to subscribe to different tiers that control their access to platform features.

## Database Schema

### Tables Created

The subscription feature adds the following tables to the database (see `supabase/migrations/002_create_subscription_tables.sql`):

#### 1. `subscription_types`
Defines the available subscription plans.

**Columns:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Unique subscription name
- `description` (TEXT) - Description of the subscription
- `marketing_points` (TEXT[]) - Array of feature bullet points for marketing
- `feature_flags` (JSONB) - JSON object defining which features are enabled
- `quota_limits` (JSONB) - JSON object defining usage limits per feature
- `price_monthly` (DECIMAL) - Monthly price
- `price_annual` (DECIMAL) - Annual price
- `stripe_monthly_id` (VARCHAR) - Stripe price ID for monthly billing
- `stripe_annual_id` (VARCHAR) - Stripe price ID for annual billing
- `created_at`, `updated_at` (TIMESTAMP)

**Sample Data:**
Two subscription types are seeded:
- **Basic**: Free tier with basic features
  - Feature flags: `dashboard_basic`, `email_notifications`
  - Quotas: 1,000 API calls, 10 GB storage
- **Pro**: Paid tier ($29/month) with advanced features
  - Feature flags: All Basic features + `advanced_analytics`, `priority_support`, `custom_integrations`
  - Quotas: 10,000 API calls, 100 GB storage

#### 2. `subscriptions`
Represents active subscriptions.

**Columns:**
- `id` (UUID) - Primary key
- `subscription_type_id` (UUID) - Foreign key to subscription_types
- `start_date` (TIMESTAMP) - When the subscription started
- `end_date` (TIMESTAMP) - When the subscription ends (nullable for active)
- `status` (VARCHAR) - One of: active, cancelled, expired, suspended
- `created_at`, `updated_at` (TIMESTAMP)

#### 3. `subscription_consumption`
Tracks feature usage per subscription.

**Columns:**
- `id` (UUID) - Primary key
- `subscription_id` (UUID) - Foreign key to subscriptions
- `feature` (VARCHAR) - Name of the feature being tracked
- `usage` (INTEGER) - Current usage count
- `month` (DATE) - First day of the month being tracked
- `created_at`, `updated_at` (TIMESTAMP)

Unique constraint: `(subscription_id, feature, month)`

#### 4. `subscription_users`
Links users to subscriptions with roles.

**Columns:**
- `id` (UUID) - Primary key
- `subscription_id` (UUID) - Foreign key to subscriptions
- `user_id` (UUID) - User ID
- `role` (VARCHAR) - Currently only 'subscription_owner'
- `created_at`, `updated_at` (TIMESTAMP)

Unique constraint: `(subscription_id, user_id)`

## Backend Module

### Location: `src/modules/subscriptions/`

The subscriptions module provides a service layer for all subscription-related operations.

### Key Components

#### Types (`types.ts`)
Defines TypeScript interfaces for:
- `SubscriptionType` - Full subscription type details
- `Subscription` - Active subscription record
- `SubscriptionConsumption` - Usage tracking record
- `SubscriptionUser` - User-subscription association
- `UserSubscription` - Combined view for user queries
- Input types for create/update operations

#### Service (`service.ts`)
The `SubscriptionsService` class provides methods for:

**Subscription Type Management:**
- `getSubscriptionTypes()` - Get all subscription types
- `getSubscriptionTypeById(id)` - Get specific type
- `getSubscriptionTypeByName(name)` - Find by name
- `createSubscriptionType(input)` - Create new type (admin)
- `updateSubscriptionType(id, input)` - Update type (admin)
- `deleteSubscriptionType(id)` - Delete type (admin)

**Subscription Management:**
- `createSubscription(input)` - Create subscription for a user
- `getSubscriptionById(id)` - Get subscription details
- `updateSubscription(id, input)` - Update subscription
- `cancelSubscription(id)` - Cancel a subscription
- `getUserSubscriptions(userId)` - Get all active subscriptions for a user

**Feature Access Control:**
- `hasFeatureAccess(userId, featureFlag)` - Check if user has access to a feature
- `getQuotaLimit(userId, feature)` - Get user's quota limit for a feature
- `hasExceededQuota(userId, feature)` - Check if user exceeded quota

**Usage Tracking:**
- `getUsage(subscriptionId, feature, month?)` - Get usage for a feature
- `incrementUsage(subscriptionId, feature, amount?, month?)` - Track feature usage

**User Management:**
- `addUserToSubscription(subscriptionId, userId, role)` - Add user to subscription
- `removeUserFromSubscription(subscriptionId, userId)` - Remove user
- `getSubscriptionUsers(subscriptionId)` - Get all users in subscription

## React Hooks

### `useSubscription(featureFlag: string): boolean`
**Location:** `src/hooks/useSubscription.ts`

Check if the current authenticated user has access to a specific feature.

**Usage:**
```tsx
import { useSubscription } from '@/hooks';

function MyComponent() {
  const hasProAccess = useSubscription('advanced_analytics');
  
  return hasProAccess ? (
    <ProFeature />
  ) : (
    <UpgradePrompt />
  );
}
```

### `useUserSubscriptions()`
**Location:** `src/hooks/useUserSubscriptions.ts`

Get the current user's active subscriptions.

**Returns:**
- `subscriptions` - Array of UserSubscription objects
- `isLoading` - Loading state
- `error` - Error if fetch failed

**Usage:**
```tsx
import { useUserSubscriptions } from '@/hooks';

function SubscriptionInfo() {
  const { subscriptions, isLoading, error } = useUserSubscriptions();
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.subscription.id}>
          {sub.subscription_type.name}
        </div>
      ))}
    </div>
  );
}
```

## Admin Interface

### Location: `/admin/subscriptions`

Administrators with the `admin:access` permission can manage subscription types.

**Features:**
- View all subscription types
- See details including:
  - Name and description
  - Monthly and annual pricing
  - Marketing feature points
  - Technical feature flags
  - Quota limits
  - Stripe integration IDs
- Edit and delete subscription types (buttons implemented, functionality to be added)
- Create new subscription types (button implemented, functionality to be added)

**Navigation:**
The admin menu has been updated to include a "Subscriptions" link.

## Dashboard Integration

### Location: `/dashboard`

The user dashboard now shows subscription-based feature cards:

1. **Basic Dashboard Card** - Visible to all users
   - Shows basic tier features
   - Always accessible

2. **Advanced Analytics Card** - Visible only to Pro subscribers
   - Checks `advanced_analytics` feature flag
   - Shows Pro features when user has access
   - Shows upgrade prompt when user doesn't have access

**Implementation:**
```tsx
const hasProAccess = useSubscription('advanced_analytics');

{hasProAccess && <ProFeatureCard />}
{!hasProAccess && <UpgradePromptCard />}
```

## How to Use

### For Developers

#### 1. Define New Features
Add feature flags to subscription types:
```sql
UPDATE subscription_types 
SET feature_flags = feature_flags || '{"new_feature": true}'::jsonb
WHERE name = 'Pro';
```

#### 2. Check Feature Access in Code
```tsx
import { useSubscription } from '@/hooks';

function NewFeature() {
  const hasAccess = useSubscription('new_feature');
  
  if (!hasAccess) {
    return <UpgradePrompt feature="new_feature" />;
  }
  
  return <YourFeature />;
}
```

#### 3. Track Feature Usage
```typescript
import { SubscriptionsService } from '@/modules/subscriptions';

const service = new SubscriptionsService();

// Get user's subscriptions
const subscriptions = await service.getUserSubscriptions(userId);

// Check quota
const hasExceeded = await service.hasExceededQuota(userId, 'api_calls');

if (!hasExceeded) {
  // Increment usage
  await service.incrementUsage(subscriptions[0].subscription.id, 'api_calls');
  // Process API call
}
```

### For Administrators

#### 1. Create Subscription Types
Use the admin interface at `/admin/subscriptions` to:
- Define subscription tiers
- Set pricing
- Configure feature flags
- Set quota limits
- Add Stripe integration IDs

#### 2. Assign Subscriptions to Users
Use the subscriptions service to create subscriptions:
```typescript
const subscription = await service.createSubscription({
  subscription_type_id: 'type-uuid',
  user_id: 'user-uuid',
});
```

## Extension Points

### Adding New Subscription Types
1. Insert into `subscription_types` table with appropriate feature flags and quotas
2. Features automatically become available based on flags
3. No code changes needed for basic feature gating

### Adding New Features
1. Add feature flag to subscription types
2. Use `useSubscription(featureFlag)` hook in your components
3. Track usage with `incrementUsage()` if needed

### Custom Subscription Roles
Currently only `subscription_owner` is supported. To add more roles:
1. Update the `subscription_users` table constraint
2. Update the `SubscriptionUserRole` type in `types.ts`
3. Implement role-based permission checks in your code

## Out of Scope (Future Enhancements)

The following features are planned but not yet implemented:

1. **Payment Processing Integration**
   - Actual Stripe checkout flow
   - Webhook handling for subscription changes
   - Payment method management

2. **User Invitation System**
   - Invite other users to a subscription
   - Accept/decline invitations
   - Manage subscription members

3. **Self-Service Subscription Management**
   - User-initiated subscription upgrades/downgrades
   - Subscription cancellation flow
   - Billing history and invoices

4. **Usage Analytics**
   - Dashboard showing quota usage
   - Usage trends and predictions
   - Alerts for approaching limits

## Testing

To test the subscription feature:

1. **Database Setup:**
   ```bash
   # Run migrations
   supabase db push
   ```

2. **Verify Sample Data:**
   - Check that Basic and Pro subscription types exist
   - Confirm feature flags and quotas are set

3. **Test Feature Access:**
   - Create a subscription for a user
   - Navigate to `/dashboard` when logged in
   - Verify feature cards appear based on subscription

4. **Test Admin Interface:**
   - Log in as admin user
   - Navigate to `/admin/subscriptions`
   - Verify subscription types are displayed

## Security Considerations

1. **Feature Access:** Always check on the server side, not just client side
2. **Quota Enforcement:** Implement server-side quota checks before processing requests
3. **Admin Actions:** All subscription type modifications require `admin:access` permission
4. **User Data:** Subscription users table only stores user IDs, not sensitive data

## Performance Notes

- Feature access checks query the database; consider caching user subscriptions in session
- Usage tracking creates/updates records frequently; ensure proper indexing
- Consider implementing Redis for real-time quota tracking in high-traffic scenarios
