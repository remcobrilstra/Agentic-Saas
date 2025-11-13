'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components';
import { useAuth } from '@/contexts';
import { usePermission } from '@/hooks';
import { SubscriptionsService, SubscriptionType } from '@/modules/subscriptions';

const subscriptionsService = new SubscriptionsService();

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const hasAdminAccess = usePermission('admin:access');
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Redirect if not authenticated or doesn't have admin access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin/subscriptions');
    } else if (!isLoading && isAuthenticated && !hasAdminAccess) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, hasAdminAccess, router]);

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

    if (isAuthenticated && hasAdminAccess) {
      fetchTypes();
    }
  }, [isAuthenticated, hasAdminAccess]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or no admin access
  if (!isAuthenticated || !hasAdminAccess) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Types</h1>
            <p className="text-gray-600 mt-2">
              Manage subscription plans and pricing.
            </p>
          </div>
          <Button variant="primary">
            Add Subscription Type
          </Button>
        </div>

        {isLoadingTypes ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading subscription types...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptionTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{type.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{type.description || 'No description'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Pricing</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Monthly: </span>
                          <span className="font-medium">${type.price_monthly?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Annual: </span>
                          <span className="font-medium">${type.price_annual?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {type.marketing_points && type.marketing_points.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                        <ul className="space-y-1">
                          {type.marketing_points.map((point, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Feature Flags</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(type.feature_flags).map(([key, value]) => (
                          <span
                            key={key}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              value
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {key}: {value ? 'Yes' : 'No'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quota Limits</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(type.quota_limits).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600">{key}: </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(type.stripe_monthly_id || type.stripe_annual_id) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Stripe IDs</h4>
                        <div className="text-xs text-gray-500 space-y-1">
                          {type.stripe_monthly_id && (
                            <div>Monthly: {type.stripe_monthly_id}</div>
                          )}
                          {type.stripe_annual_id && (
                            <div>Annual: {type.stripe_annual_id}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingTypes && subscriptionTypes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No subscription types found.</p>
              <Button variant="primary">
                Create Your First Subscription Type
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
