/**
 * Profile Page
 * 
 * User profile management with authentication required.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Spinner, Badge, Alert } from '@/components';
import { MFASection } from '@/components/profile/MFASection';
import { NotificationPreferencesSection } from '@/components/profile/NotificationPreferencesSection';
import { useAuth } from '@/contexts';
import { useUserSubscriptions } from '@/hooks';
import { getConfig } from '@/abstractions/config';

function SubscriptionCard() {
  const { subscriptions, isLoading } = useUserSubscriptions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Spinner size="sm" className="border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasSubscription = subscriptions.length > 0;
  const currentSubscription = subscriptions[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {hasSubscription && currentSubscription ? (
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Current Plan</p>
              <p className="font-semibold text-lg text-gray-900">
                {currentSubscription.subscription_type.name}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Price</p>
              <p className="font-medium text-gray-900">
                ${currentSubscription.subscription_type.price_monthly?.toFixed(2) || '0.00'}/month
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <Badge
                variant={currentSubscription.subscription.status === 'active' ? 'success' : 'secondary'}
              >
                {currentSubscription.subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Started</p>
              <p className="text-sm text-gray-900">
                {new Date(currentSubscription.subscription.start_date).toLocaleDateString()}
              </p>
            </div>
            <div className="pt-3">
              <Link href="/subscription">
                <Button variant="secondary" size="sm" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              You don&apos;t have an active subscription.
            </p>
            <Link href="/subscription">
              <Button variant="primary" size="sm" className="w-full">
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.metadata?.firstName as string || '');
      setLastName(user.metadata?.lastName as string || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsUpdating(true);

    try {
      const { auth } = getConfig().providers;
      await auth.updateUser(user!.id, {
        firstName,
        lastName,
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

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

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {message && (
                    <Alert variant="success">
                      {message}
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      {error}
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isUpdating}
                    />
                    <Input
                      label="Last Name"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setFirstName(user.metadata?.firstName as string || '');
                        setLastName(user.metadata?.lastName as string || '');
                        setMessage('');
                        setError('');
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* MFA Section */}
            <MFASection />

            {/* Notification Preferences Section */}
            <NotificationPreferencesSection userId={user.id} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                    {firstName?.[0]?.toUpperCase() || email[0]?.toUpperCase()}
                    {lastName?.[0]?.toUpperCase() || ''}
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">{email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Account ID</p>
                    <p className="font-medium text-gray-900 break-all text-xs">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SubscriptionCard />

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="danger" size="sm" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
