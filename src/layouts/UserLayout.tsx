/**
 * User Layout
 * 
 * Layout component for user pages with navigation.
 */

'use client';

import React from 'react';
import Link from 'next/link';

export interface UserLayoutProps {
  children: React.ReactNode;
  extraSections?: React.ReactNode[];
}

export function UserLayout({ children, extraSections = [] }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">microSaaS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/subscription"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Subscription
                </Link>
                {/* Extension point: Add custom sections here */}
                {extraSections.map((section, index) => (
                  <React.Fragment key={`user-nav-${index}`}>{section}</React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/logout"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
