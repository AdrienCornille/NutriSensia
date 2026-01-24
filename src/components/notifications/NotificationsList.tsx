'use client';

import React from 'react';
import type { GroupedNotifications } from '@/types/notifications';
import { NotificationGroup } from './NotificationGroup';

interface NotificationsListProps {
  groupedNotifications: GroupedNotifications;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  totalCount: number;
}

export function NotificationsList({
  groupedNotifications,
  onMarkAsRead,
  onDelete,
  onClearAll,
  totalCount,
}: NotificationsListProps) {
  return (
    <>
      <NotificationGroup
        title="Aujourd'hui"
        notifications={groupedNotifications.today}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
      <NotificationGroup
        title="Hier"
        notifications={groupedNotifications.yesterday}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
      <NotificationGroup
        title="Cette semaine"
        notifications={groupedNotifications.thisWeek}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
      <NotificationGroup
        title="Plus ancien"
        notifications={groupedNotifications.older}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />

      {/* Clear all */}
      {totalCount > 0 && (
        <div className="mt-8 text-center">
          <button onClick={onClearAll} className="text-sm text-gray-500 hover:text-gray-700">
            Effacer toutes les notifications
          </button>
        </div>
      )}
    </>
  );
}

export default NotificationsList;
