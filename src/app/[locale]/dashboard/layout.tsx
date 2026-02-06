'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Root dashboard layout
 * Provides authentication guard for all dashboard routes
 * Each sub-dashboard (patient, nutritionist) has its own layout with sidebar
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
