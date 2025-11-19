/**
 * OAuth Callback Page
 * 
 * Handles the OAuth callback and redirects to the dashboard.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Spinner } from '@/components';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Refresh the user state
        await refreshUser();
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
