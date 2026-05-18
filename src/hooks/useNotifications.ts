/**
 * Hooks React Query pour les notifications
 * Utilisés côté patient ET nutritionniste
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string | null;
  data: Record<string, string | number | boolean>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at: string | null;
  notification_code: string | null;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
}

export type NotificationFilter =
  | 'all'
  | 'unread'
  | 'message'
  | 'appointment'
  | 'plan'
  | 'achievement'
  | 'reminder'
  | 'system';

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  limit: number;
  offset: number;
}

interface UnreadCountResponse {
  unread_count: number;
}

// ============================================================================
// Query keys
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filter?: NotificationFilter) =>
    [...notificationKeys.all, 'list', filter || 'all'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch notifications list with optional filter
 */
export function useNotifications(filter: NotificationFilter = 'all') {
  return useQuery<NotificationsResponse, Error>({
    queryKey: notificationKeys.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') {
        params.set('filter', filter);
      }

      const response = await fetch(
        `/api/protected/notifications?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors du chargement');
      }

      const json = await response.json();
      return json.data;
    },
    staleTime: 30 * 1000, // 30s
    refetchInterval: 60 * 1000, // Poll every 60s
  });
}

/**
 * Fetch only the unread count (lightweight, for badge)
 */
export function useUnreadNotificationCount() {
  return useQuery<number, Error>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await fetch(
        '/api/protected/notifications?count_only=true',
        { credentials: 'include' }
      );

      if (!response.ok) {
        return 0;
      }

      const json = await response.json();
      return (json.data as UnreadCountResponse).unread_count || 0;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Mark notifications as read
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ marked_count: number }, Error, string[] | null>({
    mutationFn: async notificationIds => {
      const response = await fetch('/api/protected/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }

      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Dismiss (delete) a notification
 */
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async notificationId => {
      const response = await fetch(
        `/api/protected/notifications?id=${encodeURIComponent(notificationId)}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Clear all notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await fetch(
        '/api/protected/notifications?clear_all=true',
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
