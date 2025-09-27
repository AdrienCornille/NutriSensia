import React from 'react';
import { cn } from '@/lib/utils';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const alertStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircleIcon,
    iconColor: 'text-red-400',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-400',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-400',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  onClose,
  showCloseButton = false,
}: AlertProps) {
  const styles = alertStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div
      className={cn(
        'relative p-4 border rounded-lg',
        styles.container,
        className
      )}
      role='alert'
    >
      <div className='flex items-start'>
        {/* Icône */}
        <div className='flex-shrink-0 mr-3'>
          <IconComponent className={cn('h-5 w-5', styles.iconColor)} />
        </div>

        {/* Contenu */}
        <div className='flex-1 min-w-0'>
          {title && <h3 className='text-sm font-medium mb-1'>{title}</h3>}
          <div className='text-sm'>{children}</div>
        </div>

        {/* Bouton de fermeture */}
        {showCloseButton && onClose && (
          <button
            type='button'
            onClick={onClose}
            className={cn(
              'flex-shrink-0 ml-3 h-5 w-5 rounded-md inline-flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              styles.iconColor,
              'hover:bg-opacity-20 hover:bg-current'
            )}
            aria-label="Fermer l'alerte"
          >
            <XMarkIcon className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
}
