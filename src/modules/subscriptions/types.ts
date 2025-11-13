/**
 * Subscriptions Module Types
 */

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'suspended';

export type SubscriptionUserRole = 'subscription_owner';

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface QuotaLimits {
  [key: string]: number;
}

export interface SubscriptionType {
  id: string;
  name: string;
  description: string | null;
  marketing_points: string[] | null;
  feature_flags: FeatureFlags;
  quota_limits: QuotaLimits;
  price_monthly: number | null;
  price_annual: number | null;
  stripe_monthly_id: string | null;
  stripe_annual_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  subscription_type_id: string;
  start_date: string;
  end_date: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionConsumption {
  id: string;
  subscription_id: string;
  feature: string;
  usage: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUser {
  id: string;
  subscription_id: string;
  user_id: string;
  role: SubscriptionUserRole;
  created_at: string;
  updated_at: string;
}

// Combined types for queries
export interface SubscriptionWithType extends Subscription {
  subscription_type?: SubscriptionType;
}

export interface SubscriptionWithUsers extends Subscription {
  subscription_users?: SubscriptionUser[];
}

export interface UserSubscription {
  subscription: Subscription;
  subscription_type: SubscriptionType;
  role: SubscriptionUserRole;
}

// Input types for creating/updating
export interface CreateSubscriptionTypeInput {
  name: string;
  description?: string;
  marketing_points?: string[];
  feature_flags: FeatureFlags;
  quota_limits: QuotaLimits;
  price_monthly?: number;
  price_annual?: number;
  stripe_monthly_id?: string;
  stripe_annual_id?: string;
}

export interface UpdateSubscriptionTypeInput {
  name?: string;
  description?: string;
  marketing_points?: string[];
  feature_flags?: FeatureFlags;
  quota_limits?: QuotaLimits;
  price_monthly?: number;
  price_annual?: number;
  stripe_monthly_id?: string;
  stripe_annual_id?: string;
}

export interface CreateSubscriptionInput {
  subscription_type_id: string;
  user_id: string;
  start_date?: string;
}

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus;
  end_date?: string;
}
