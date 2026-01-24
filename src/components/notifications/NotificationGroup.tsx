'use client';

import React from 'react';
import type { Notification } from '@/types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationGroup({
  title,
  notifications,
  onMarkAsRead,
  onDelete,
}: NotificationGroupProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default NotificationGroup;
