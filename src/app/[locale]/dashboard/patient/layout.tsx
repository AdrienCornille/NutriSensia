'use client';

import React from 'react';
import { PatientSidebar } from '@/components/patient';
import { useUnreadCount } from '@/hooks/useConversations';

interface PatientDashboardLayoutProps {
  children: React.ReactNode;
}

export default function PatientDashboardLayout({
  children,
}: PatientDashboardLayoutProps) {
  const { data: unreadData } = useUnreadCount();

  return (
    <div className='min-h-screen bg-gray-100 flex'>
      {/* Sidebar */}
      <PatientSidebar unreadMessagesCount={unreadData?.unread_count ?? 0} />

      {/* Main content area */}
      <main className='flex-1 ml-64'>{children}</main>
    </div>
  );
}
