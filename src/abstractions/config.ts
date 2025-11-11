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

  appConfig = {
    providers: {
      database: config?.providers?.database || new SupabaseDatabaseProvider(supabaseUrl, supabaseKey),
      auth: config?.providers?.auth || new SupabaseAuthProvider(supabaseUrl, supabaseKey),
      payment: config?.providers?.payment || new StripePaymentProvider(stripeKey, stripeWebhookSecret),
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
