'use client';

import React, { useReducer, useEffect, useMemo } from 'react';
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
} from '@/types/notifications';
import { getNotifications } from '@/data/mock-notifications';

export default function NotificationsPage() {
  const [state, dispatch] = useReducer(
    notificationsReducer,
    initialNotificationsState
  );

  // Load notifications on mount
  useEffect(() => {
    const notifications = getNotifications();
    dispatch({ type: 'SET_NOTIFICATIONS', notifications });
  }, []);

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

  // Handlers
  const handleFilterChange = (filter: NotificationFilter) => {
    dispatch({ type: 'SET_FILTER', filter });
  };

  const handleMarkAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', notificationId: id });
  };

  const handleMarkAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', notificationId: id });
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const handleResetFilter = () => {
    dispatch({ type: 'SET_FILTER', filter: 'all' });
  };

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
