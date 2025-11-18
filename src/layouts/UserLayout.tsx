/**
 * User Layout
 * 
 * Layout component for user pages with navigation.
 */

'use client';

import React from 'react';
import { Header } from '@/components';

export interface UserLayoutProps {
  children: React.ReactNode;
  extraSections?: React.ReactNode[];
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showDashboardLink={true} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
