/**
 * Payment Abstraction Layer
 * 
 * This module provides an abstraction over payment operations to allow
 * easy replacement of the underlying payment provider.
 */

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: unknown;
}

export interface IPaymentProvider {
  /**
   * Create a new customer
   */
  createCustomer(email: string, metadata?: Record<string, unknown>): Promise<string>;

  /**
   * Create a subscription for a customer
   */
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>;

  /**
   * Cancel a subscription
   */
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<Subscription>;

  /**
   * Get subscription details
   */
  getSubscription(subscriptionId: string): Promise<Subscription | null>;

  /**
   * Handle webhook events
   */
  handleWebhook(payload: string, signature: string): Promise<WebhookEvent>;

  /**
   * Create a checkout session
   */
  createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }>;

  /**
   * Create a portal session for customer to manage subscriptions
   */
  createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }>;
}
