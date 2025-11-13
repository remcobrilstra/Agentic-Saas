/**
 * useSubscription Hook
 * 
 * Hook to check if the current user has access to a feature based on their subscription.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import { SubscriptionsService } from '@/modules/subscriptions';

const subscriptionsService = new SubscriptionsService();

export function useSubscription(featureFlag: string): boolean {
  const { user, isAuthenticated } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || !user) {
        setHasAccess(false);
        return;
      }
      
      try {
        const access = await subscriptionsService.hasFeatureAccess(user.id, featureFlag);
        setHasAccess(access);
      } catch (error) {
        console.error('Failed to check feature access:', error);
        setHasAccess(false);
      }
    };
    
    checkAccess();
  }, [user, isAuthenticated, featureFlag]);
  
  return hasAccess;
}
