/**
 * Unified Header Component
 * 
 * Provides consistent navigation across all pages with authentication-aware content.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { UserMenu } from './UserMenu';

export interface HeaderProps {
  showDashboardLink?: boolean;
}

export function Header({ showDashboardLink = true }: HeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              microSaaS
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link - only show when logged in */}
                {showDashboardLink && (
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {/* User Menu */}
                <UserMenu />
              </>
            ) : (
              /* Not authenticated - show Login/Signup */
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
