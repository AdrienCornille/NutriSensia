'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/types/notifications';
import { notificationTypeConfig } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();
  const typeConfig = notificationTypeConfig[notification.type];

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (notification.action?.link) {
      router.push(notification.action.link);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
    if (notification.action?.link) {
      router.push(notification.action.link);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
        notification.read
          ? 'bg-white border-gray-200'
          : 'bg-[#1B998B]/5 border-[#1B998B]/20'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.bgColor}`}
        >
          <span className="text-xl">{notification.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={`font-medium ${
                  notification.read ? 'text-gray-800' : 'text-gray-900'
                }`}
              >
                {notification.title}
              </p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {notification.description}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-3 h-3 bg-[#1B998B] rounded-full flex-shrink-0 mt-1" />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{notification.timestamp}</span>

            <div className="flex items-center gap-2">
              {notification.action && (
                <button
                  onClick={handleActionClick}
                  className="text-sm text-[#1B998B] font-medium hover:text-[#158578]"
                >
                  {notification.action.label}
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationItem;
