# Quick Start: Using Subscriptions in Your Code

This guide shows you how to quickly integrate subscription-based features into your application.

## 1. Check if a User Has Access to a Feature

```tsx
'use client';

import { useSubscription } from '@/hooks';

export default function MyFeature() {
  // Check if user has access to this feature
  const hasAccess = useSubscription('advanced_analytics');
  
  if (!hasAccess) {
    return (
      <div className="p-4 bg-gray-100 rounded">
        <p>Upgrade to Pro to access this feature.</p>
        <button>Upgrade Now</button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Your feature content */}
      <h2>Advanced Analytics Dashboard</h2>
      {/* ... */}
    </div>
  );
}
```

## 2. Get User's Active Subscriptions

```tsx
'use client';

import { useUserSubscriptions } from '@/hooks';

export default function SubscriptionInfo() {
  const { subscriptions, isLoading, error } = useUserSubscriptions();
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading subscriptions</p>;
  
  return (
    <div>
      <h2>Your Subscriptions</h2>
      {subscriptions.map(sub => (
        <div key={sub.subscription.id}>
          <h3>{sub.subscription_type.name}</h3>
          <p>${sub.subscription_type.price_monthly}/month</p>
          <ul>
            {sub.subscription_type.marketing_points?.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## 3. Create a Subscription Programmatically

```typescript
import { SubscriptionsService } from '@/modules/subscriptions';

// In an API route or server action
export async function createUserSubscription(userId: string, planName: string) {
  const service = new SubscriptionsService();
  
  // Get the subscription type by name
  const subscriptionType = await service.getSubscriptionTypeByName(planName);
  
  if (!subscriptionType) {
    throw new Error('Subscription type not found');
  }
  
  // Create the subscription
  const subscription = await service.createSubscription({
    subscription_type_id: subscriptionType.id,
    user_id: userId,
  });
  
  return subscription;
}
```

## 4. Track Feature Usage

```typescript
import { SubscriptionsService } from '@/modules/subscriptions';

export async function trackApiCall(userId: string) {
  const service = new SubscriptionsService();
  
  // Check if user has exceeded their quota
  const hasExceeded = await service.hasExceededQuota(userId, 'api_calls');
  
  if (hasExceeded) {
    throw new Error('API quota exceeded. Please upgrade your plan.');
  }
  
  // Get user's subscriptions
  const subscriptions = await service.getUserSubscriptions(userId);
  
  if (subscriptions.length === 0) {
    throw new Error('No active subscription');
  }
  
  // Increment usage
  await service.incrementUsage(
    subscriptions[0].subscription.id,
    'api_calls',
    1
  );
  
  // Process the API call
  // ...
}
```

## 5. Check Quota Limit

```typescript
import { SubscriptionsService } from '@/modules/subscriptions';

export async function getUserQuotaInfo(userId: string, feature: string) {
  const service = new SubscriptionsService();
  
  // Get the quota limit
  const limit = await service.getQuotaLimit(userId, feature);
  
  // Get current usage
  const subscriptions = await service.getUserSubscriptions(userId);
  const usage = subscriptions.length > 0 
    ? await service.getUsage(subscriptions[0].subscription.id, feature)
    : 0;
  
  return {
    limit,
    usage,
    remaining: limit ? limit - usage : null,
    percentage: limit ? (usage / limit) * 100 : 0,
  };
}
```

## 6. Server-Side Feature Gate

```typescript
// app/api/protected-feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionsService } from '@/modules/subscriptions';

export async function GET(request: NextRequest) {
  // Get user ID from session/auth
  const userId = 'user-id-from-session';
  
  const service = new SubscriptionsService();
  const hasAccess = await service.hasFeatureAccess(userId, 'advanced_analytics');
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Feature not available in your plan' },
      { status: 403 }
    );
  }
  
  // Return feature data
  return NextResponse.json({ data: 'protected data' });
}
```

## 7. Conditional Component Rendering

```tsx
'use client';

import { useSubscription } from '@/hooks';
import { BasicDashboard, AdvancedDashboard } from '@/components';

export default function Dashboard() {
  const hasAdvanced = useSubscription('advanced_analytics');
  
  return (
    <div>
      {hasAdvanced ? (
        <AdvancedDashboard />
      ) : (
        <BasicDashboard />
      )}
    </div>
  );
}
```

## 8. Show Upgrade Prompt

```tsx
'use client';

import { useSubscription } from '@/hooks';
import { Button } from '@/components';

export function FeatureWithUpgrade({ 
  featureFlag, 
  children 
}: { 
  featureFlag: string; 
  children: React.ReactNode;
}) {
  const hasAccess = useSubscription(featureFlag);
  
  if (!hasAccess) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Unlock This Feature</h3>
        <p className="text-gray-600 mb-4">
          Upgrade to Pro to access this feature
        </p>
        <Button variant="primary" href="/subscription">
          View Plans
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Usage
<FeatureWithUpgrade featureFlag="custom_integrations">
  <CustomIntegrationsPanel />
</FeatureWithUpgrade>
```

## 9. Admin: Create Subscription Type

```typescript
import { SubscriptionsService } from '@/modules/subscriptions';

export async function createNewPlan() {
  const service = new SubscriptionsService();
  
  const newPlan = await service.createSubscriptionType({
    name: 'Enterprise',
    description: 'For large organizations',
    marketing_points: [
      'Unlimited API calls',
      '1 TB storage',
      '24/7 support',
      'Custom integrations',
      'SLA guarantee',
    ],
    feature_flags: {
      dashboard_basic: true,
      email_notifications: true,
      advanced_analytics: true,
      priority_support: true,
      custom_integrations: true,
      dedicated_support: true,
    },
    quota_limits: {
      api_calls: 1000000,
      storage_gb: 1000,
    },
    price_monthly: 299.00,
    price_annual: 2990.00,
    stripe_monthly_id: 'price_enterprise_monthly',
    stripe_annual_id: 'price_enterprise_annual',
  });
  
  return newPlan;
}
```

## 10. Display Usage Stats

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useUserSubscriptions } from '@/hooks';
import { SubscriptionsService } from '@/modules/subscriptions';

export function UsageStats() {
  const { subscriptions } = useUserSubscriptions();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    if (subscriptions.length === 0) return;
    
    const fetchStats = async () => {
      const service = new SubscriptionsService();
      const subscription = subscriptions[0];
      
      const apiUsage = await service.getUsage(
        subscription.subscription.id,
        'api_calls'
      );
      
      const apiLimit = subscription.subscription_type.quota_limits.api_calls;
      
      setStats({
        apiUsage,
        apiLimit,
        apiPercentage: (apiUsage / apiLimit) * 100,
      });
    };
    
    fetchStats();
  }, [subscriptions]);
  
  if (!stats) return <p>Loading stats...</p>;
  
  return (
    <div>
      <h3>API Usage</h3>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${stats.apiPercentage}%` }}
        />
      </div>
      <p>{stats.apiUsage} / {stats.apiLimit} calls</p>
    </div>
  );
}
```

## Common Patterns

### Pattern: Feature Flag Helper
```typescript
export const FEATURES = {
  BASIC_DASHBOARD: 'dashboard_basic',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PRIORITY_SUPPORT: 'priority_support',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
} as const;

// Usage
const hasAccess = useSubscription(FEATURES.ADVANCED_ANALYTICS);
```

### Pattern: Subscription Context
```tsx
// Create a context for easy access
import { createContext, useContext } from 'react';
import { useUserSubscriptions } from '@/hooks';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const subscriptionData = useUserSubscriptions();
  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  return useContext(SubscriptionContext);
}
```

## Need More Help?

- See `SUBSCRIPTION_FEATURE.md` for detailed documentation
- See `TESTING_SUBSCRIPTIONS.md` for testing instructions
- Check the `src/modules/subscriptions/service.ts` for all available methods
