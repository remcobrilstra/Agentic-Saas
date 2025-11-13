/**
 * Subscriptions Service
 * 
 * Provides business logic for subscription management.
 */

import { getConfig } from '@/abstractions/config';
import type {
  SubscriptionType,
  Subscription,
  SubscriptionUser,
  UserSubscription,
  CreateSubscriptionTypeInput,
  UpdateSubscriptionTypeInput,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionConsumption,
} from './types';

export class SubscriptionsService {
  private db;

  constructor() {
    const config = getConfig();
    this.db = config.providers.database;
  }

  /**
   * Get all subscription types
   */
  async getSubscriptionTypes(): Promise<SubscriptionType[]> {
    return this.db.query<SubscriptionType>('subscription_types');
  }

  /**
   * Get a subscription type by ID
   */
  async getSubscriptionTypeById(id: string): Promise<SubscriptionType | null> {
    return this.db.getById<SubscriptionType>('subscription_types', id);
  }

  /**
   * Get a subscription type by name
   */
  async getSubscriptionTypeByName(name: string): Promise<SubscriptionType | null> {
    const results = await this.db.query<SubscriptionType>('subscription_types', { name });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new subscription type (admin only)
   */
  async createSubscriptionType(input: CreateSubscriptionTypeInput): Promise<SubscriptionType> {
    return this.db.insert<SubscriptionType>('subscription_types', input);
  }

  /**
   * Update a subscription type (admin only)
   */
  async updateSubscriptionType(
    id: string,
    input: UpdateSubscriptionTypeInput
  ): Promise<SubscriptionType> {
    return this.db.update<SubscriptionType>('subscription_types', id, input);
  }

  /**
   * Delete a subscription type (admin only)
   */
  async deleteSubscriptionType(id: string): Promise<void> {
    return this.db.delete('subscription_types', id);
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    const { user_id, subscription_type_id, start_date } = input;

    // Create the subscription
    const subscription = await this.db.insert<Subscription>('subscriptions', {
      subscription_type_id,
      start_date: start_date || new Date().toISOString(),
      status: 'active',
    });

    // Add the user as the subscription owner
    await this.db.insert<SubscriptionUser>('subscription_users', {
      subscription_id: subscription.id,
      user_id,
      role: 'subscription_owner',
    });

    return subscription;
  }

  /**
   * Get a subscription by ID
   */
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.db.getById<Subscription>('subscriptions', id);
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    id: string,
    input: UpdateSubscriptionInput
  ): Promise<Subscription> {
    return this.db.update<Subscription>('subscriptions', id, input);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, {
      status: 'cancelled',
      end_date: new Date().toISOString(),
    });
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    // Get subscription_users for this user
    const subscriptionUsers = await this.db.query<SubscriptionUser>('subscription_users', {
      user_id: userId,
    });

    // Fetch full subscription details with types
    const userSubscriptions: UserSubscription[] = [];
    
    for (const subUser of subscriptionUsers) {
      const subscription = await this.db.getById<Subscription>(
        'subscriptions',
        subUser.subscription_id
      );
      
      if (subscription && subscription.status === 'active') {
        const subscriptionType = await this.db.getById<SubscriptionType>(
          'subscription_types',
          subscription.subscription_type_id
        );
        
        if (subscriptionType) {
          userSubscriptions.push({
            subscription,
            subscription_type: subscriptionType,
            role: subUser.role,
          });
        }
      }
    }

    return userSubscriptions;
  }

  /**
   * Check if a user has access to a feature
   */
  async hasFeatureAccess(userId: string, featureFlag: string): Promise<boolean> {
    const subscriptions = await this.getUserSubscriptions(userId);
    
    // Check if any active subscription has the feature flag enabled
    return subscriptions.some(
      (sub) => sub.subscription_type.feature_flags[featureFlag] === true
    );
  }

  /**
   * Get quota limit for a feature for a user's subscription
   */
  async getQuotaLimit(userId: string, feature: string): Promise<number | null> {
    const subscriptions = await this.getUserSubscriptions(userId);
    
    // Return the highest quota limit from all active subscriptions
    let maxLimit: number | null = null;
    
    for (const sub of subscriptions) {
      const limit = sub.subscription_type.quota_limits[feature];
      if (limit !== undefined && (maxLimit === null || limit > maxLimit)) {
        maxLimit = limit;
      }
    }
    
    return maxLimit;
  }

  /**
   * Get current usage for a feature in the current month
   */
  async getUsage(subscriptionId: string, feature: string, month?: string): Promise<number> {
    const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';
    
    const results = await this.db.query<SubscriptionConsumption>('subscription_consumption', {
      subscription_id: subscriptionId,
      feature,
      month: targetMonth,
    });
    
    return results.length > 0 ? results[0].usage : 0;
  }

  /**
   * Increment usage for a feature
   */
  async incrementUsage(
    subscriptionId: string,
    feature: string,
    amount: number = 1,
    month?: string
  ): Promise<SubscriptionConsumption> {
    const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';
    
    const currentUsage = await this.getUsage(subscriptionId, feature, targetMonth);
    
    // Try to update existing record or insert new one
    const existing = await this.db.query<SubscriptionConsumption>('subscription_consumption', {
      subscription_id: subscriptionId,
      feature,
      month: targetMonth,
    });
    
    if (existing.length > 0) {
      return this.db.update<SubscriptionConsumption>(
        'subscription_consumption',
        existing[0].id,
        { usage: currentUsage + amount }
      );
    } else {
      return this.db.insert<SubscriptionConsumption>('subscription_consumption', {
        subscription_id: subscriptionId,
        feature,
        usage: amount,
        month: targetMonth,
      });
    }
  }

  /**
   * Check if a user has exceeded their quota for a feature
   */
  async hasExceededQuota(userId: string, feature: string): Promise<boolean> {
    const subscriptions = await this.getUserSubscriptions(userId);
    const limit = await this.getQuotaLimit(userId, feature);
    
    if (limit === null) {
      // No limit defined means unlimited
      return false;
    }
    
    // Get total usage across all user's subscriptions
    let totalUsage = 0;
    for (const sub of subscriptions) {
      const usage = await this.getUsage(sub.subscription.id, feature);
      totalUsage += usage;
    }
    
    return totalUsage >= limit;
  }

  /**
   * Add a user to a subscription
   */
  async addUserToSubscription(
    subscriptionId: string,
    userId: string,
    role: 'subscription_owner' = 'subscription_owner'
  ): Promise<SubscriptionUser> {
    return this.db.insert<SubscriptionUser>('subscription_users', {
      subscription_id: subscriptionId,
      user_id: userId,
      role,
    });
  }

  /**
   * Remove a user from a subscription
   */
  async removeUserFromSubscription(subscriptionId: string, userId: string): Promise<void> {
    const users = await this.db.query<SubscriptionUser>('subscription_users', {
      subscription_id: subscriptionId,
      user_id: userId,
    });
    
    if (users.length > 0) {
      await this.db.delete('subscription_users', users[0].id);
    }
  }

  /**
   * Get all users in a subscription
   */
  async getSubscriptionUsers(subscriptionId: string): Promise<SubscriptionUser[]> {
    return this.db.query<SubscriptionUser>('subscription_users', {
      subscription_id: subscriptionId,
    });
  }
}
