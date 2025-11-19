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
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground hover:text-foreground/80">
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
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
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
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
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
