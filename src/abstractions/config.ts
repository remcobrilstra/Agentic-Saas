/**
 * Provider Configuration System
 * 
 * This module provides a centralized configuration for all providers,
 * allowing easy replacement and dependency injection.
 */

import { IDatabaseProvider } from './database';
import { IAuthProvider } from './auth';
import { IPaymentProvider } from './payment';
import { SupabaseDatabaseProvider } from './supabase-database';
import { SupabaseAuthProvider } from './supabase-auth';
import { StripePaymentProvider } from './stripe-payment';

export interface AppConfig {
  providers: {
    database: IDatabaseProvider;
    auth: IAuthProvider;
    payment: IPaymentProvider;
  };
}

let appConfig: AppConfig | null = null;

/**
 * Initialize the application configuration with providers
 */
export function initializeConfig(config?: Partial<AppConfig>): AppConfig {
  // Default configuration using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // Only initialize Stripe if keys are provided
  let paymentProvider: IPaymentProvider;
  if (config?.providers?.payment) {
    paymentProvider = config.providers.payment;
  } else if (stripeKey && stripeWebhookSecret && stripeKey !== 'sk_test_mock_key') {
    paymentProvider = new StripePaymentProvider(stripeKey, stripeWebhookSecret);
  } else {
    // Create a mock payment provider for development
    paymentProvider = {
      createCustomer: async () => 'mock_customer_id',
      createSubscription: async () => ({ id: 'mock_sub_id', status: 'active' } as any),
      cancelSubscription: async () => ({ id: 'mock_sub_id', status: 'canceled' } as any),
      updateSubscription: async () => ({ id: 'mock_sub_id', status: 'active' } as any),
      getSubscription: async () => ({ id: 'mock_sub_id', status: 'active' } as any),
      handleWebhook: async () => {},
    } as IPaymentProvider;
  }

  appConfig = {
    providers: {
      database: config?.providers?.database || new SupabaseDatabaseProvider(supabaseUrl, supabaseKey),
      auth: config?.providers?.auth || new SupabaseAuthProvider(supabaseUrl, supabaseKey),
      payment: paymentProvider,
    },
  };

  return appConfig;
}

/**
 * Get the current application configuration
 * Initializes with defaults if not already initialized
 */
export function getConfig(): AppConfig {
  if (!appConfig) {
    return initializeConfig();
  }
  return appConfig;
}

/**
 * Reset the configuration (useful for testing)
 */
export function resetConfig(): void {
  appConfig = null;
}
