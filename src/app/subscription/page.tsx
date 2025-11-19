'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components';
import { useAuth } from '@/contexts';
import { useUserSubscriptions } from '@/hooks';
import { SubscriptionsService, SubscriptionType } from '@/modules/subscriptions';

const subscriptionsService = new SubscriptionsService();

export default function Subscription() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { subscriptions, isLoading: isSubsLoading } = useUserSubscriptions();
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/subscription');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Fetch subscription types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await subscriptionsService.getSubscriptionTypes();
        setSubscriptionTypes(types);
      } catch (error) {
        console.error('Failed to fetch subscription types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    if (isAuthenticated) {
      fetchTypes();
    }
  }, [isAuthenticated]);

  // Show loading state
  if (isAuthLoading || isSubsLoading || isLoadingTypes) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </UserLayout>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const currentSubscription = subscriptions[0]; // User's current subscription
  const hasSubscription = subscriptions.length > 0;

  const handleSelectPlan = (typeId: string, typeName: string) => {
    // Navigate to payment processing placeholder
    router.push(`/subscription/checkout?plan=${typeId}&name=${encodeURIComponent(typeName)}`);
  };



  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription plan and billing information.
          </p>
        </div>

{hasSubscription && currentSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {currentSubscription.subscription_type.name}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    ${currentSubscription.subscription_type.price_monthly?.toFixed(2) || '0.00'} per month
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Started: {new Date(currentSubscription.subscription.start_date).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                    currentSubscription.subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentSubscription.subscription.status}
                  </span>
                </div>
                <div className="text-right space-y-2">
                  <Button variant="secondary" size="sm">
                    Manage Billing
                  </Button>
                  <br />
                  <Button variant="danger" size="sm">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!hasSubscription && (
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a plan below to get started and unlock all features.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionTypes.map((type, idx) => {
              const isCurrent = hasSubscription && currentSubscription?.subscription_type.id === type.id;
              const isPopular = idx === 1; // Mark the second plan as popular
              
              return (
                <Card key={type.id} className={isPopular ? 'border-2 border-primary' : ''}>
                  <CardContent className="pt-6">
                    {isPopular && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-4">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-foreground">{type.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-foreground">
                        ${type.price_monthly?.toFixed(0) || '0'}
                      </span>
                      <span className="ml-2 text-muted-foreground">/per month</span>
                    </div>
                    {type.description && (
                      <p className="text-sm text-muted-foreground mt-2">{type.description}</p>
                    )}
                    <ul className="mt-6 space-y-3">
                      {type.marketing_points?.map((point, i) => (
                        <li key={i} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-muted-foreground text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      {isCurrent ? (
                        <Button variant="secondary" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          variant={isPopular ? 'primary' : 'secondary'}
                          className="w-full"
                          onClick={() => handleSelectPlan(type.id, type.name)}
                        >
                          {hasSubscription ? 'Switch Plan' : 'Select Plan'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>


      </div>
    </UserLayout>
  );
}
