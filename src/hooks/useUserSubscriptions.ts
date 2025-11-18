/**
 * useUserSubscriptions Hook
 * 
 * Hook to get the current user's active subscriptions.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import { SubscriptionsService, UserSubscription } from '@/modules/subscriptions';

const subscriptionsService = new SubscriptionsService();

export function useUserSubscriptions() {
  const { user, isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!isAuthenticated || !user) {
        setSubscriptions([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const subs = await subscriptionsService.getUserSubscriptions(user.id);
        setSubscriptions(subs);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        setError(err as Error);
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [user, isAuthenticated]);
  
  return { subscriptions, isLoading, error };
}
