'use client';

import React, { useReducer, useEffect, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  NotificationsHeader,
  NotificationsFilters,
  NotificationsList,
  NotificationsEmptyState,
} from '@/components/notifications';
import {
  notificationsReducer,
  initialNotificationsState,
  filterNotifications,
  groupNotificationsByDate,
  getUnreadCount,
  getFiltersConfig,
  type NotificationFilter,
  type Notification as UINotification,
  type NotificationType,
} from '@/types/notifications';
import {
  useNotifications as useNotificationsAPI,
  useMarkNotificationsRead,
  useDismissNotification,
  useClearAllNotifications,
} from '@/hooks/useNotifications';

// ==================== ADAPTERS ====================

function codeToType(code: string | null): NotificationType {
  if (!code) return 'system';
  if (code.startsWith('appointment_') || code === 'appointment_no_show')
    return 'appointment';
  if (code === 'new_message' || code === 'unread_messages') return 'message';
  if (code.startsWith('new_meal_plan') || code.startsWith('plan_modification_'))
    return 'plan';
  if (
    code === 'weight_goal_reached' ||
    code === 'streak_milestone' ||
    code === 'badge_earned'
  )
    return 'achievement';
  if (code === 'hydration_reminder') return 'hydration';
  if (
    code === 'weight_reminder' ||
    code === 'meal_reminder' ||
    code === 'questionnaire_due'
  )
    return 'reminder';
  if (code === 'new_content' || code === 'new_recipe') return 'content';
  return 'system';
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60)
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24)
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

// ==================== PAGE ====================

export default function NotificationsPage() {
  const [state, dispatch] = useReducer(
    notificationsReducer,
    initialNotificationsState
  );

  // API hooks
  const { data: notifData, isLoading } = useNotificationsAPI('all');
  const markReadMutation = useMarkNotificationsRead();
  const dismissMutation = useDismissNotification();
  const clearAllMutation = useClearAllNotifications();

  // Sync API data to reducer
  useEffect(() => {
    if (notifData?.notifications) {
      const uiNotifications: UINotification[] = notifData.notifications.map(
        n => ({
          id: n.id,
          type: codeToType(n.notification_code),
          title: n.title,
          description: n.body,
          timestamp: formatRelativeTime(n.created_at),
          read: n.is_read,
          icon: n.icon || '🔔',
          action: n.action_url
            ? { label: n.action_label || 'Voir', link: n.action_url }
            : null,
        })
      );
      dispatch({ type: 'SET_NOTIFICATIONS', notifications: uiNotifications });
    }
  }, [notifData]);

  useEffect(() => {
    if (isLoading) {
      dispatch({ type: 'SET_LOADING', isLoading: true });
    }
  }, [isLoading]);

  // Derived state
  const filteredNotifications = useMemo(
    () => filterNotifications(state.notifications, state.activeFilter),
    [state.notifications, state.activeFilter]
  );

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(filteredNotifications),
    [filteredNotifications]
  );

  const unreadCount = useMemo(
    () => getUnreadCount(state.notifications),
    [state.notifications]
  );

  const filtersConfig = useMemo(
    () => getFiltersConfig(state.notifications),
    [state.notifications]
  );

  // Handlers — optimistic local update + API call
  const handleFilterChange = useCallback((filter: NotificationFilter) => {
    dispatch({ type: 'SET_FILTER', filter });
  }, []);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      dispatch({ type: 'MARK_AS_READ', notificationId: id });
      markReadMutation.mutate([id]);
    },
    [markReadMutation]
  );

  const handleMarkAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    markReadMutation.mutate(null);
  }, [markReadMutation]);

  const handleDelete = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_NOTIFICATION', notificationId: id });
      dismissMutation.mutate(id);
    },
    [dismissMutation]
  );

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    clearAllMutation.mutate();
  }, [clearAllMutation]);

  const handleResetFilter = useCallback(() => {
    dispatch({ type: 'SET_FILTER', filter: 'all' });
  }, []);

  if (state.isLoading) {
    return (
      <>
        <DashboardHeader showNotifications={false} />
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B998B]' />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader showNotifications={false} />
      <div className='p-6 lg:p-8'>
        {/* Header */}
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* Filters */}
        <div className='mb-6'>
          <NotificationsFilters
            filters={filtersConfig}
            activeFilter={state.activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Content */}
        {filteredNotifications.length === 0 ? (
          <NotificationsEmptyState
            activeFilter={state.activeFilter}
            onResetFilter={handleResetFilter}
          />
        ) : (
          <NotificationsList
            groupedNotifications={groupedNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            totalCount={state.notifications.length}
          />
        )}
      </div>
    </>
  );
}
