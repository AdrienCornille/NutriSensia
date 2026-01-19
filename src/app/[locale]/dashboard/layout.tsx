'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardSidebar } from '@/components/dashboard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main content area */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
