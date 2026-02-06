'use client';

import React from 'react';
import { PatientSidebar } from '@/components/patient';

interface PatientDashboardLayoutProps {
  children: React.ReactNode;
}

export default function PatientDashboardLayout({
  children,
}: PatientDashboardLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-100 flex'>
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main content area */}
      <main className='flex-1 ml-64'>{children}</main>
    </div>
  );
}
