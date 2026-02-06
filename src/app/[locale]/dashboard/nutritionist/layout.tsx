'use client';

import React from 'react';
import { NutritionistSidebar } from '@/components/nutritionist';
import { useNutritionistPendingAppointments } from '@/hooks/useNutritionistAppointments';

interface NutritionistDashboardLayoutProps {
  children: React.ReactNode;
}

export default function NutritionistDashboardLayout({
  children,
}: NutritionistDashboardLayoutProps) {
  const { data: pendingData } = useNutritionistPendingAppointments();
  const pendingCount = pendingData?.pending_count ?? 0;

  return (
    <div className='min-h-screen bg-gray-100 flex'>
      {/* Sidebar */}
      <NutritionistSidebar pendingAppointmentsCount={pendingCount} />

      {/* Main content area */}
      <main className='flex-1 ml-64'>{children}</main>
    </div>
  );
}
