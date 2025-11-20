'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner, Badge } from '@/components';
import { useAuth } from '@/contexts';
import { usePermission } from '@/hooks';
import { SubscriptionsService } from '@/modules/subscriptions';
import type { SubscriptionWithDetails } from '@/modules/subscriptions/types';

const subscriptionsService = new SubscriptionsService();

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const hasAdminAccess = usePermission('admin:access');
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);

  // Redirect if not authenticated or doesn't have admin access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin/subscriptions');
    } else if (!isLoading && isAuthenticated && !hasAdminAccess) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, hasAdminAccess, router]);

  // Fetch subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs = await subscriptionsService.getAllSubscriptions();
        setSubscriptions(subs);
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };

    if (isAuthenticated && hasAdminAccess) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, hasAdminAccess]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-2">
              Manage active subscriptions and subscription types.
            </p>
          </div>
          <Button variant="primary" onClick={() => router.push('/admin/subscriptions/types')}>
            Edit Subscription Types
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{subscriptions.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {subscriptions.reduce((acc, sub) => acc + sub.user_count, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  ${subscriptions.reduce((acc, sub) => acc + (sub.subscription_type.price_monthly || 0), 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Plan Types</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {new Set(subscriptions.map(s => s.subscription_type.id)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSubscriptions ? (
              <div className="text-center py-12">
                <Spinner size="md" className="mb-2" />
                <p className="text-muted-foreground mt-2">Loading subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No active subscriptions found.</p>
                <p className="text-sm text-gray-500">Subscriptions will appear here once users subscribe to plans.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subscription ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Users</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Start Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Monthly Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="text-xs font-mono text-gray-600">
                            {subscription.id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{subscription.subscription_type.name}</p>
                            <p className="text-xs text-gray-500">{subscription.subscription_type.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {subscription.user_count} {subscription.user_count === 1 ? 'user' : 'users'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(subscription.start_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={subscription.status === 'active' ? 'success' : 'secondary'}
                          >
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">
                          ${subscription.subscription_type.price_monthly?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="secondary" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscriptions by Type */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from(new Set(subscriptions.map(s => s.subscription_type.id))).map(typeId => {
                  const subs = subscriptions.filter(s => s.subscription_type.id === typeId);
                  const type = subs[0].subscription_type;
                  return (
                    <div key={typeId} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{type.name}</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{subs.length}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {subs.reduce((acc, s) => acc + s.user_count, 0)} total users
                      </p>
                      <p className="text-sm text-gray-500">
                        ${((type.price_monthly || 0) * subs.length).toFixed(2)}/month revenue
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
