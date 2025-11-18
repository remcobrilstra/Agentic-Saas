/**
 * Admin Layout
 * 
 * Layout component for admin pages with navigation and extensibility.
 */

'use client';

import React from 'react';
import { Header, AdminSidebar } from '@/components';

export interface AdminLayoutProps {
  children: React.ReactNode;
  extraSections?: React.ReactNode[];
}

export function AdminLayout({ children, extraSections = [] }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showDashboardLink={true} />
      <div className="flex">
        <AdminSidebar extraSections={extraSections} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
