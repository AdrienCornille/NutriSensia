'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  showNotifications?: boolean;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  showGreeting = true,
  showNotifications = true,
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
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div>
          {showGreeting ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-800">
                Bonjour {firstName} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1 capitalize">{formattedDate}</p>
            </>
          ) : (
            <>
              {title && (
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
              )}
              {subtitle && <p className="text-gray-500">{subtitle}</p>}
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {children}
          {showNotifications && (
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
