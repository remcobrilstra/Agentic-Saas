# Testing the Subscription Feature

This guide explains how to test the subscription management feature in your local environment.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at https://supabase.com
   - Get your project URL and anon key
   - Configure your `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

2. **Run Database Migrations**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or manually run the SQL from:
   # supabase/migrations/002_create_subscription_tables.sql
   ```

3. **Create Test Users**
   Create at least two users in your Supabase project:
   - One admin user (set `role` in `user_metadata` to 'admin')
   - One regular user (default role is 'user')

## Test Scenarios

### 1. Admin - View Subscription Types

**Steps:**
1. Log in as an admin user
2. Navigate to `/admin/subscriptions`
3. Verify you see the two seeded subscription types:
   - **Basic**: Free tier with basic features
   - **Pro**: $29/month with advanced features

**Expected Results:**
- Both subscription types are displayed in cards
- Each card shows:
  - Name and description
  - Monthly and annual pricing
  - Marketing feature points
  - Feature flags (as badges)
  - Quota limits
  - Stripe IDs (if configured)
- Edit and Delete buttons are present

### 2. User - No Subscription (Default)

**Steps:**
1. Log in as a regular user (without any subscription)
2. Navigate to `/dashboard`

**Expected Results:**
- Basic Dashboard card is visible
- Advanced Analytics card shows as "Pro Plan Only" with upgrade prompt
- Pro feature is grayed out

### 3. User - Basic Subscription

**Steps:**
1. Create a subscription for the user in the database:
   ```sql
   -- Get the Basic subscription type ID
   SELECT id FROM subscription_types WHERE name = 'Basic';
   
   -- Get the user ID from auth.users
   SELECT id FROM auth.users WHERE email = 'your-test-user@example.com';
   
   -- Create the subscription
   INSERT INTO subscriptions (subscription_type_id, status)
   VALUES ('basic-type-id', 'active')
   RETURNING id;
   
   -- Link user to subscription
   INSERT INTO subscription_users (subscription_id, user_id, role)
   VALUES ('new-subscription-id', 'user-id', 'subscription_owner');
   ```

2. Refresh the `/dashboard` page

**Expected Results:**
- Basic Dashboard card is visible
- Advanced Analytics card still shows upgrade prompt
- User has access to basic features only

### 4. User - Pro Subscription

**Steps:**
1. Update the user's subscription to Pro:
   ```sql
   -- Get the Pro subscription type ID
   SELECT id FROM subscription_types WHERE name = 'Pro';
   
   -- Update the existing subscription
   UPDATE subscriptions 
   SET subscription_type_id = 'pro-type-id'
   WHERE id = 'subscription-id';
   ```

2. Refresh the `/dashboard` page

**Expected Results:**
- Basic Dashboard card is visible
- Advanced Analytics card is now fully visible and styled with purple theme
- "Explore Analytics" button is available
- User has access to all Pro features

### 5. Feature Flag Check via useSubscription Hook

**Steps:**
1. Create a test component:
   ```tsx
   // src/app/test-subscription/page.tsx
   'use client';
   
   import { useSubscription } from '@/hooks';
   
   export default function TestPage() {
     const hasBasic = useSubscription('dashboard_basic');
     const hasAdvanced = useSubscription('advanced_analytics');
     const hasPriority = useSubscription('priority_support');
     
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">Feature Access Test</h1>
         <ul className="space-y-2">
           <li>Dashboard Basic: {hasBasic ? '✅' : '❌'}</li>
           <li>Advanced Analytics: {hasAdvanced ? '✅' : '❌'}</li>
           <li>Priority Support: {hasPriority ? '✅' : '❌'}</li>
         </ul>
       </div>
     );
   }
   ```

2. Navigate to `/test-subscription` while logged in

**Expected Results:**
- With no subscription: All show ❌
- With Basic subscription: dashboard_basic shows ✅, others ❌
- With Pro subscription: All show ✅

### 6. Usage Tracking

**Steps:**
1. In your application code, track usage:
   ```typescript
   import { SubscriptionsService } from '@/modules/subscriptions';
   
   const service = new SubscriptionsService();
   
   // Get user's subscription
   const subs = await service.getUserSubscriptions(userId);
   
   // Check quota
   const limit = await service.getQuotaLimit(userId, 'api_calls');
   const hasExceeded = await service.hasExceededQuota(userId, 'api_calls');
   
   if (!hasExceeded) {
     // Increment usage
     await service.incrementUsage(subs[0].subscription.id, 'api_calls');
   }
   ```

2. Check the database:
   ```sql
   SELECT * FROM subscription_consumption 
   WHERE subscription_id = 'your-subscription-id';
   ```

**Expected Results:**
- Usage is tracked in `subscription_consumption` table
- Usage increments with each call
- Quota check returns true when limit exceeded

### 7. Multiple Users per Subscription

**Steps:**
1. Add another user to an existing subscription:
   ```sql
   INSERT INTO subscription_users (subscription_id, user_id, role)
   VALUES ('subscription-id', 'second-user-id', 'subscription_owner');
   ```

2. Log in as the second user
3. Navigate to `/dashboard`

**Expected Results:**
- Second user has same feature access as first user
- Both users share the subscription

### 8. Subscription Cancellation

**Steps:**
1. Cancel a subscription via the service:
   ```typescript
   const service = new SubscriptionsService();
   await service.cancelSubscription('subscription-id');
   ```

2. Check the database:
   ```sql
   SELECT status, end_date FROM subscriptions 
   WHERE id = 'subscription-id';
   ```

**Expected Results:**
- Status is set to 'cancelled'
- `end_date` is set to current timestamp
- User loses feature access on next page load

## Automated Testing Ideas

While not implemented in this PR, here are suggestions for automated tests:

### Unit Tests (Jest/Vitest)
```typescript
describe('SubscriptionsService', () => {
  it('should create a subscription', async () => {
    const service = new SubscriptionsService();
    const result = await service.createSubscription({
      subscription_type_id: 'type-id',
      user_id: 'user-id'
    });
    expect(result).toHaveProperty('id');
  });
  
  it('should check feature access correctly', async () => {
    const service = new SubscriptionsService();
    const hasAccess = await service.hasFeatureAccess('user-id', 'advanced_analytics');
    expect(hasAccess).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('Subscription Flow', () => {
  it('should restrict feature access for basic users', async () => {
    // Create basic subscription
    // Check feature access
    // Expect advanced features to be false
  });
  
  it('should track usage correctly', async () => {
    // Create subscription
    // Increment usage multiple times
    // Check final usage count
    // Verify quota enforcement
  });
});
```

### E2E Tests (Playwright)
```typescript
test('User can see subscription-based features', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('.basic-feature')).toBeVisible();
  await expect(page.locator('.pro-feature')).not.toBeVisible();
  
  // Upgrade to Pro
  // ...
  
  await page.goto('/dashboard');
  await expect(page.locator('.pro-feature')).toBeVisible();
});
```

## Troubleshooting

### Issue: Subscription not showing up
**Solution:** 
- Verify the subscription status is 'active'
- Check that subscription_users links the user correctly
- Clear browser cache and reload

### Issue: Feature flags not working
**Solution:**
- Verify feature_flags column is properly formatted JSON
- Check that the flag name matches exactly (case-sensitive)
- Ensure user has an active subscription

### Issue: Quota not enforcing
**Solution:**
- Verify quota_limits are set in subscription_types
- Check that incrementUsage is being called
- Ensure the feature name matches in both places

### Issue: Admin page not accessible
**Solution:**
- Verify user has 'admin' role in user_metadata
- Check that usePermission hook is working
- Ensure permissions service is configured correctly

## Next Steps

After testing the basic functionality, consider:
1. Integrating Stripe for actual payment processing
2. Building out the subscription management UI (edit/create forms)
3. Adding user invitation system
4. Implementing usage dashboards
5. Setting up automated quota resets (monthly)
6. Adding email notifications for quota warnings
