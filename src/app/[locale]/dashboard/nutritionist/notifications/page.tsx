'use client';

import React, { useState, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, Loader2, Filter } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationsRead,
  useDismissNotification,
  useClearAllNotifications,
  type NotificationFilter,
  type Notification,
} from '@/hooks/useNotifications';

// ==================== FILTER TABS ====================

const filters: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'unread', label: 'Non lues' },
  { value: 'message', label: 'Messages' },
  { value: 'appointment', label: 'RDV' },
  { value: 'plan', label: 'Plans' },
  { value: 'system', label: 'Système' },
];

// ==================== NOTIFICATION ITEM ====================

function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const timeAgo = formatRelativeTime(new Date(notification.created_at));

  return (
    <div
      className={`flex items-start gap-3 p-4 border-b border-gray-100 transition-colors ${
        notification.is_read ? 'bg-white' : 'bg-blue-50/50'
      }`}
    >
      {/* Icon */}
      <div className='flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg'>
        {notification.icon || '🔔'}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <p
            className={`text-sm ${
              notification.is_read
                ? 'text-gray-700'
                : 'text-gray-900 font-medium'
            }`}
          >
            {notification.title}
          </p>
          <span className='text-xs text-gray-400 whitespace-nowrap flex-shrink-0'>
            {timeAgo}
          </span>
        </div>
        <p className='text-xs text-gray-500 mt-0.5 line-clamp-2'>
          {notification.body}
        </p>

        {/* Priority badge */}
        {notification.priority === 'high' ||
        notification.priority === 'urgent' ? (
          <span
            className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              notification.priority === 'urgent'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {notification.priority === 'urgent' ? 'Urgent' : 'Important'}
          </span>
        ) : null}
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1 flex-shrink-0'>
        {!notification.is_read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className='p-1.5 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/5 rounded-lg transition-colors'
            title='Marquer comme lu'
          >
            <Check className='w-3.5 h-3.5' />
          </button>
        )}
        <button
          onClick={() => onDismiss(notification.id)}
          className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
          title='Supprimer'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  );
}

// ==================== HELPERS ====================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ==================== MAIN PAGE ====================

export default function NutritionistNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const { data: notifData, isLoading, error } = useNotifications(activeFilter);

  const markReadMutation = useMarkNotificationsRead();
  const dismissMutation = useDismissNotification();
  const clearAllMutation = useClearAllNotifications();

  const handleMarkRead = useCallback(
    (id: string) => {
      markReadMutation.mutate([id]);
    },
    [markReadMutation]
  );

  const handleMarkAllRead = useCallback(() => {
    markReadMutation.mutate(null);
  }, [markReadMutation]);

  const handleDismiss = useCallback(
    (id: string) => {
      dismissMutation.mutate(id);
    },
    [dismissMutation]
  );

  const handleClearAll = useCallback(() => {
    if (window.confirm('Supprimer toutes les notifications ?')) {
      clearAllMutation.mutate();
    }
  }, [clearAllMutation]);

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unread_count || 0;

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
            <Bell className='w-5 h-5 text-[#1B998B]' />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-gray-800'>
              Notifications
            </h1>
            <p className='text-sm text-gray-500'>
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes lues'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markReadMutation.isPending}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B998B] bg-[#1B998B]/5 rounded-lg hover:bg-[#1B998B]/10 transition-colors disabled:opacity-50'
            >
              <CheckCheck className='w-3.5 h-3.5' />
              Tout marquer comme lu
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAllMutation.isPending}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
            >
              <Trash2 className='w-3.5 h-3.5' />
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-1 mb-4 overflow-x-auto pb-1'>
        <Filter className='w-4 h-4 text-gray-400 mr-1 flex-shrink-0' />
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              activeFilter === f.value
                ? 'bg-[#1B998B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        {isLoading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
          </div>
        ) : error ? (
          <div className='text-center py-16'>
            <p className='text-sm text-red-500'>Erreur : {error.message}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
            <Bell className='w-12 h-12 mb-3' />
            <p className='text-sm font-medium text-gray-500'>
              Aucune notification
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              {activeFilter !== 'all'
                ? 'Essayez un autre filtre'
                : 'Vous êtes à jour !'}
            </p>
          </div>
        ) : (
          notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
}
