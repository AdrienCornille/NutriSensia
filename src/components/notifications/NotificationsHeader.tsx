'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationsHeader({ unreadCount, onMarkAllAsRead }: NotificationsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-[#1B998B] text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">Restez informé de votre suivi</p>
      </div>

      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-2 text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg text-sm font-medium transition-colors"
          >
            Tout marquer comme lu
          </button>
        )}
        <button
          onClick={() => router.push('/dashboard/profil')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          title="Paramètres de notifications"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default NotificationsHeader;
