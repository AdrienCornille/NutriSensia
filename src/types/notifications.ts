/**
 * Types pour le Centre de Notifications
 *
 * NOTIF-001: Consultation des notifications
 * NOTIF-002: Filtrage des notifications
 * NOTIF-003: Marquage comme lu
 * NOTIF-004: Action depuis notification
 * NOTIF-005: Suppression de notification
 * NOTIF-006: Badge de notifications non lues
 */

// ==================== ENUMS ====================

export type NotificationType =
  | 'message'
  | 'appointment'
  | 'achievement'
  | 'plan'
  | 'reminder'
  | 'hydration'
  | 'content'
  | 'system';

export type NotificationFilter =
  | 'all'
  | 'unread'
  | 'message'
  | 'appointment'
  | 'reminder'
  | 'achievement';

// ==================== INTERFACES ====================

export interface NotificationAction {
  label: string;
  link: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon: string;
  action: NotificationAction | null;
}

export interface NotificationFilterConfig {
  id: NotificationFilter;
  label: string;
  count: number;
}

export interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

// ==================== STATE ====================

export interface NotificationsState {
  notifications: Notification[];
  activeFilter: NotificationFilter;
  isLoading: boolean;
}

// ==================== ACTIONS ====================

export type NotificationsAction =
  | { type: 'SET_NOTIFICATIONS'; notifications: Notification[] }
  | { type: 'SET_FILTER'; filter: NotificationFilter }
  | { type: 'MARK_AS_READ'; notificationId: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; notificationId: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_LOADING'; isLoading: boolean };

// ==================== INITIAL STATE ====================

export const initialNotificationsState: NotificationsState = {
  notifications: [],
  activeFilter: 'all',
  isLoading: true,
};

// ==================== REDUCER ====================

export function notificationsReducer(
  state: NotificationsState,
  action: NotificationsAction
): NotificationsState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.notifications,
        isLoading: false,
      };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.filter };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          n => n.id !== action.notificationId
        ),
      };
    case 'CLEAR_ALL':
      return { ...state, notifications: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const notificationTypeConfig: Record<
  NotificationType,
  { bgColor: string; textColor: string }
> = {
  message: { bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  appointment: { bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  achievement: { bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  plan: { bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  reminder: { bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  hydration: { bgColor: 'bg-cyan-100', textColor: 'text-cyan-600' },
  content: { bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
  system: { bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
};

export const filterLabels: Record<NotificationFilter, string> = {
  all: 'Toutes',
  unread: 'Non lues',
  message: 'Messages',
  appointment: 'Rendez-vous',
  reminder: 'Rappels',
  achievement: 'Récompenses',
};

// ==================== HELPERS ====================

/**
 * Filtre les notifications selon le filtre actif
 */
export function filterNotifications(
  notifications: Notification[],
  filter: NotificationFilter
): Notification[] {
  switch (filter) {
    case 'all':
      return notifications;
    case 'unread':
      return notifications.filter(n => !n.read);
    case 'reminder':
      return notifications.filter(n =>
        ['reminder', 'hydration'].includes(n.type)
      );
    default:
      return notifications.filter(n => n.type === filter);
  }
}

/**
 * Groupe les notifications par date
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): GroupedNotifications {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const older: Notification[] = [];

  notifications.forEach(notif => {
    if (
      notif.timestamp.includes('heure') ||
      notif.timestamp.includes('minute')
    ) {
      today.push(notif);
    } else if (notif.timestamp.includes('Hier')) {
      yesterday.push(notif);
    } else if (notif.timestamp.includes('jour')) {
      thisWeek.push(notif);
    } else {
      older.push(notif);
    }
  });

  return { today, yesterday, thisWeek, older };
}

/**
 * Calcule le nombre de notifications non lues
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.read).length;
}

/**
 * Génère la configuration des filtres avec les compteurs
 */
export function getFiltersConfig(
  notifications: Notification[]
): NotificationFilterConfig[] {
  return [
    { id: 'all', label: filterLabels.all, count: notifications.length },
    {
      id: 'unread',
      label: filterLabels.unread,
      count: notifications.filter(n => !n.read).length,
    },
    {
      id: 'message',
      label: filterLabels.message,
      count: notifications.filter(n => n.type === 'message').length,
    },
    {
      id: 'appointment',
      label: filterLabels.appointment,
      count: notifications.filter(n => n.type === 'appointment').length,
    },
    {
      id: 'reminder',
      label: filterLabels.reminder,
      count: notifications.filter(n =>
        ['reminder', 'hydration'].includes(n.type)
      ).length,
    },
    {
      id: 'achievement',
      label: filterLabels.achievement,
      count: notifications.filter(n => n.type === 'achievement').length,
    },
  ];
}

/**
 * Calcule les statistiques des notifications
 */
export function getNotificationsStats(notifications: Notification[]): {
  messages: number;
  achievements: number;
  reminders: number;
} {
  return {
    messages: notifications.filter(n => n.type === 'message').length,
    achievements: notifications.filter(n => n.type === 'achievement').length,
    reminders: notifications.filter(n =>
      ['reminder', 'hydration'].includes(n.type)
    ).length,
  };
}
