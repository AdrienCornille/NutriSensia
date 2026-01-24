'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import type { NotificationFilter } from '@/types/notifications';

interface NotificationsEmptyStateProps {
  activeFilter: NotificationFilter;
  onResetFilter: () => void;
}

export function NotificationsEmptyState({
  activeFilter,
  onResetFilter,
}: NotificationsEmptyStateProps) {
  const isFilteredView = activeFilter !== 'all';

  return (
    <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">
        {isFilteredView ? 'Aucune notification dans cette catégorie' : 'Aucune notification'}
      </h3>
      <p className="text-gray-500">
        {isFilteredView
          ? 'Essayez un autre filtre ou revenez plus tard.'
          : 'Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.'}
      </p>
      {isFilteredView && (
        <button
          onClick={onResetFilter}
          className="mt-4 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors"
        >
          Voir toutes les notifications
        </button>
      )}
    </div>
  );
}

export default NotificationsEmptyState;
