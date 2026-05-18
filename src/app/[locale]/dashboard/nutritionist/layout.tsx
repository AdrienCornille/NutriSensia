'use client';

import React from 'react';
import { NutritionistSidebar } from '@/components/nutritionist';
import { useNutritionistPendingAppointments } from '@/hooks/useNutritionistAppointments';
import { useUnreadCount } from '@/hooks/useConversations';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { DashboardTopBar } from '@/components/nutritionist/dashboard/DashboardTopBar';

interface NutritionistDashboardLayoutProps {
  children: React.ReactNode;
}

export default function NutritionistDashboardLayout({
  children,
}: NutritionistDashboardLayoutProps) {
  const { data: pendingData } = useNutritionistPendingAppointments();
  const pendingCount = pendingData?.pending_count ?? 0;
  const { data: unreadData } = useUnreadCount();
  const { data: unreadNotifCount } = useUnreadNotificationCount();

  return (
    <div className='dp-shell ns2'>
      <NutritionistSidebar
        pendingAppointmentsCount={pendingCount}
        unreadMessagesCount={unreadData?.unread_count ?? 0}
        unreadNotificationsCount={unreadNotifCount ?? 0}
      />

      <main className='dp-main'>
        <DashboardTopBar
          unreadMessagesCount={unreadData?.unread_count ?? 0}
          unreadNotificationsCount={unreadNotifCount ?? 0}
        />
        {children}
      </main>
    </div>
  );
}
