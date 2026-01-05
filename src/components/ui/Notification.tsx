'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Types de notification disponibles
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Props du composant Notification
 */
export interface NotificationProps {
  /**
   * Type de notification
   */
  type: NotificationType;
  /**
   * Titre de la notification
   */
  title: string;
  /**
   * Message de la notification
   */
  message?: string;
  /**
   * Durée d'affichage en millisecondes (0 = pas d'auto-fermeture)
   */
  duration?: number;
  /**
   * Callback appelé lors de la fermeture
   */
  onClose?: () => void;
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  /**
   * Afficher le bouton de fermeture
   */
  showCloseButton?: boolean;
  /**
   * Position de la notification
   */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

/**
 * Composant Notification pour afficher des messages à l'utilisateur
 *
 * @example
 * ```tsx
 * <Notification
 *   type="success"
 *   title="Succès!"
 *   message="Votre photo de profil a été mise à jour"
 *   duration={5000}
 *   onClose={() => console.log('Notification fermée')}
 * />
 * ```
 */
export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
  showCloseButton = true,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Styles selon le type de notification
  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      closeButton: 'text-green-400 hover:text-green-600',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      closeButton: 'text-red-400 hover:text-red-600',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      closeButton: 'text-yellow-400 hover:text-yellow-600',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      closeButton: 'text-blue-400 hover:text-blue-600',
    },
  };

  // Icônes selon le type
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  // Positions de la notification
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  /**
   * Ferme la notification
   */
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  /**
   * Auto-fermeture après la durée spécifiée
   */
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        typeStyles[type].container,
        positionStyles[position],
        'animate-in slide-in-from-top-2',
        className
      )}
      role='alert'
      aria-live='assertive'
    >
      <div className='flex items-start'>
        {/* Icône */}
        <div
          className={cn('flex-shrink-0 w-5 h-5 mr-3', typeStyles[type].icon)}
        >
          <span className='text-lg font-bold'>{icons[type]}</span>
        </div>

        {/* Contenu */}
        <div className='flex-1 min-w-0'>
          <h3 className='text-sm font-medium'>{title}</h3>
          {message && <p className='mt-1 text-sm opacity-90'>{message}</p>}
        </div>

        {/* Bouton de fermeture */}
        {showCloseButton && (
          <button
            type='button'
            className={cn(
              'flex-shrink-0 ml-3 w-5 h-5 rounded-full inline-flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-500',
              typeStyles[type].closeButton
            )}
            onClick={handleClose}
            aria-label='Fermer la notification'
          >
            <span className='sr-only'>Fermer</span>
            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Hook pour gérer les notifications
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState<
    Array<NotificationProps & { id: string }>
  >([]);

  /**
   * Supprime une notification
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  /**
   * Ajoute une nouvelle notification
   */
  const addNotification = useCallback(
    (notification: Omit<NotificationProps, 'onClose'>) => {
      const id = Math.random().toString(36).substring(2);
      const newNotification = {
        ...notification,
        id,
        onClose: () => removeNotification(id),
      };

      setNotifications(prev => [...prev, newNotification]);
    },
    [removeNotification]
  );

  /**
   * Ajoute une notification de succès
   */
  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: 'success', title, message, duration });
    },
    [addNotification]
  );

  /**
   * Ajoute une notification d'erreur
   */
  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: 'error', title, message, duration });
    },
    [addNotification]
  );

  /**
   * Ajoute une notification d'avertissement
   */
  const showWarning = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration });
  };

  /**
   * Ajoute une notification d'information
   */
  const showInfo = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration });
  };

  /**
   * Composant pour afficher toutes les notifications
   */
  const NotificationContainer = () => (
    <div className='fixed z-50 space-y-2'>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            top: `${4 + index * 80}px`,
            right: '1rem',
          }}
          className='absolute'
        >
          <Notification {...notification} />
        </div>
      ))}
    </div>
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer,
  };
};

export default Notification;
