/**
 * Abstractions Layer Exports
 * 
 * This module exports all abstraction interfaces and their implementations.
 */

// Interfaces
export type { IDatabaseProvider } from './database';
export type { IAuthProvider, User, AuthSession, SignUpParams, SignInParams } from './auth';
export type {
  IPaymentProvider,
  Subscription,
  CreateSubscriptionParams,
  WebhookEvent,
} from './payment';

// Implementations
export { SupabaseDatabaseProvider } from './supabase-database';
export { SupabaseAuthProvider } from './supabase-auth';
export { StripePaymentProvider } from './stripe-payment';
