'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  showNotifications?: boolean;
  unreadNotificationsCount?: number;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  showGreeting = true,
  showNotifications = true,
  unreadNotificationsCount = 3, // Default mock value
  children,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  // User info
  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Utilisateur';

  // Date formatée
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className='bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20'>
      <div className='flex items-center justify-between'>
        <div>
          {showGreeting ? (
            <>
              <h1 className='text-2xl font-semibold text-gray-800'>
                Bonjour {firstName} 👋
              </h1>
              <p className='text-gray-500 text-sm mt-1 capitalize'>
                {formattedDate}
              </p>
            </>
          ) : (
            <>
              {title && (
                <h1 className='text-2xl font-semibold text-gray-800'>
                  {title}
                </h1>
              )}
              {subtitle && <p className='text-gray-500'>{subtitle}</p>}
            </>
          )}
        </div>
        <div className='flex items-center gap-4'>
          {children}
          {showNotifications && (
            <Link
              href='/dashboard/patient/notifications'
              className='block p-2 text-gray-400 hover:text-gray-600 relative rounded-lg hover:bg-gray-100 transition-colors'
            >
              <Bell className='w-6 h-6' />
              {unreadNotificationsCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                  {unreadNotificationsCount > 9
                    ? '9+'
                    : unreadNotificationsCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
