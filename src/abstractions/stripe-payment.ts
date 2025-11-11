/**
 * Stripe Payment Provider Implementation
 */

import Stripe from 'stripe';
import {
  IPaymentProvider,
  Subscription as AppSubscription,
  CreateSubscriptionParams,
  WebhookEvent,
} from './payment';

export class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(apiKey: string, webhookSecret: string) {
    this.stripe = new Stripe(apiKey);
    this.webhookSecret = webhookSecret;
  }

  async createCustomer(email: string, metadata?: Record<string, unknown>): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      metadata: metadata as Stripe.MetadataParam,
    });

    return customer.id;
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<AppSubscription> {
    const subscription = await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata as Stripe.MetadataParam,
    });

    return this.mapSubscription(subscription);
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<AppSubscription> {
    const subscription = immediately
      ? await this.stripe.subscriptions.cancel(subscriptionId)
      : await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

    return this.mapSubscription(subscription);
  }

  async getSubscription(subscriptionId: string): Promise<AppSubscription | null> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return this.mapSubscription(subscription);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'resource_missing') {
        return null;
      }
      throw error;
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data.object,
      };
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${(error as Error).message}`);
    }
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const session = await this.stripe.checkout.sessions.create({
      customer: params.customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    if (!session.url) {
      throw new Error('Checkout session URL not generated');
    }

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  private mapSubscription(subscription: Stripe.Subscription): AppSubscription {
    const subAny = subscription as unknown as Record<string, unknown>;
    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      priceId: subscription.items.data[0].price.id,
      status: subscription.status as AppSubscription['status'],
      currentPeriodEnd: new Date((subAny.current_period_end as number) * 1000),
      cancelAtPeriodEnd: subAny.cancel_at_period_end as boolean,
    };
  }
}
